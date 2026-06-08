import { prisma } from "@/lib/prisma";
import { isExpired, type MailboxTokens } from "@/lib/auth/tokens";
import { refreshAccessToken } from "@/lib/auth/oauth";
import { encrypt, decrypt } from "@/lib/crypto";

const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";
const DRIVE_ABOUT =
  "https://www.googleapis.com/drive/v3/about?fields=storageQuota";

/**
 * Returns a usable access token for a specific connected mailbox, refreshing it
 * via the stored refresh_token when the current one has expired and persisting
 * the new token back to the ConnectedMailbox row.
 */
export async function getAccessToken(mailbox: MailboxTokens): Promise<string> {
  // Tokens are stored encrypted at rest; decrypt before use.
  const accessToken = decrypt(mailbox.access_token);
  const refreshToken = decrypt(mailbox.refresh_token);
  if (!accessToken) {
    throw new Error(`Mailbox ${mailbox.email} is not connected`);
  }
  if (!isExpired(mailbox.expires_at) || !refreshToken) {
    return accessToken;
  }

  const refreshed = await refreshAccessToken(mailbox.provider, refreshToken);

  await prisma.connectedMailbox.update({
    where: { id: mailbox.id },
    data: {
      access_token: encrypt(refreshed.access_token),
      expires_at: refreshed.expires_at,
      ...(refreshed.refresh_token
        ? { refresh_token: encrypt(refreshed.refresh_token) }
        : {}),
    },
  });

  return refreshed.access_token;
}

export type StorageQuota = {
  /** Bytes used across Gmail, Drive and Photos. */
  usage: number;
  /** Total bytes available, or null for unlimited (Workspace) accounts. */
  limit: number | null;
};

/**
 * Reads the account's storage quota via the Drive `about` endpoint. The 15 GB
 * free pool is shared across Gmail/Drive/Photos, so this is the real number.
 * Returns null if the Drive scope hasn't been granted yet.
 */
export async function getStorageQuota(token: string): Promise<StorageQuota | null> {
  const res = await fetch(DRIVE_ABOUT, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    storageQuota?: { usage?: string; limit?: string };
  };
  const sq = data.storageQuota;
  if (!sq) return null;
  return {
    usage: Number(sq.usage ?? 0),
    // No `limit` field => unlimited (Workspace).
    limit: sq.limit != null ? Number(sq.limit) : null,
  };
}

async function gapi<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GMAIL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gmail API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

type GmailHeader = { name: string; value: string };
type GmailPart = {
  mimeType: string;
  filename?: string;
  body?: { size?: number; data?: string; attachmentId?: string };
  parts?: GmailPart[];
  headers?: GmailHeader[];
};
type GmailMessage = {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  labelIds?: string[];
  payload?: GmailPart & { headers?: GmailHeader[] };
};

function header(headers: GmailHeader[] | undefined, name: string): string {
  return (
    headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ""
  );
}

function decodeB64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
    "utf8",
  );
}

/** Recursively find the first part matching the given MIME type. */
function findPart(
  part: GmailPart | undefined,
  mime: string,
): GmailPart | undefined {
  if (!part) return undefined;
  if (part.mimeType === mime && part.body?.data) return part;
  if (part.parts) {
    for (const p of part.parts) {
      const found = findPart(p, mime);
      if (found) return found;
    }
  }
  return undefined;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns { html, text } bodies for a Gmail payload. */
function extractBodies(part: GmailPart | undefined): {
  html: string;
  text: string;
} {
  const htmlPart = findPart(part, "text/html");
  const textPart = findPart(part, "text/plain");
  const html = htmlPart?.body?.data ? decodeB64Url(htmlPart.body.data) : "";
  const text = textPart?.body?.data ? decodeB64Url(textPart.body.data) : "";
  return { html, text: text || (html ? stripHtml(html) : "") };
}

export type MailAttachment = {
  id: string;
  messageId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

/** Collects downloadable attachment parts from a payload. */
function parseAttachments(
  messageId: string,
  part: GmailPart | undefined,
  out: MailAttachment[] = [],
): MailAttachment[] {
  if (!part) return out;
  if (part.filename && part.body?.attachmentId) {
    out.push({
      id: part.body.attachmentId,
      messageId,
      fileName: part.filename,
      mimeType: part.mimeType,
      sizeBytes: part.body.size ?? 0,
    });
  }
  if (part.parts) for (const p of part.parts) parseAttachments(messageId, p, out);
  return out;
}

/** Fetches a single attachment's bytes as a base64url string. */
export async function getAttachment(
  token: string,
  messageId: string,
  attachmentId: string,
): Promise<string> {
  const res = await gapi<{ data?: string }>(
    token,
    `/messages/${messageId}/attachments/${attachmentId}`,
  );
  return res.data ?? "";
}

function parseFrom(value: string): { name: string; email: string } {
  const match = value.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>/);
  if (match) return { name: match[1].trim() || match[2], email: match[2].trim() };
  return { name: value.trim(), email: value.trim() };
}

export type InboxRow = {
  /** Which connected mailbox this row came from (unified timeline). */
  mailboxId: string;
  accountEmail: string;
  threadId: string;
  messageId: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
  starred: boolean;
};

/** Identity of the mailbox a fan-out request is reading from. */
export type MailboxRef = { id: string; email: string };

export type Folder =
  | "inbox"
  | "drafts"
  | "sent"
  | "starred"
  | "archive"
  | "spam"
  | "trash"
  | "all";

const FOLDER_QUERY: Record<Folder, { labelIds?: string[]; q?: string }> = {
  inbox: { labelIds: ["INBOX"] },
  drafts: { labelIds: ["DRAFT"] },
  sent: { labelIds: ["SENT"] },
  starred: { labelIds: ["STARRED"] },
  spam: { labelIds: ["SPAM"] },
  trash: { labelIds: ["TRASH"] },
  archive: { q: "-in:inbox -in:spam -in:trash -in:sent -in:draft -in:chats" },
  all: { q: "-in:spam -in:trash -in:chats" },
};

export type InboxPage = {
  rows: InboxRow[];
  nextPageToken?: string;
};

/**
 * Lists threads for a folder, newest first, one row per thread. When `search`
 * is given it searches the whole mailbox via Gmail's query syntax instead of a
 * single folder. Returns a `nextPageToken` for pagination.
 */
export async function listMessages(
  token: string,
  mailbox: MailboxRef,
  folder: Folder = "inbox",
  max = 30,
  search = "",
  pageToken = "",
): Promise<InboxPage> {
  const base = FOLDER_QUERY[folder] ?? FOLDER_QUERY.inbox;
  const qs = new URLSearchParams({ maxResults: String(max) });

  const term = search.trim();
  if (term) {
    // Whole-mailbox search (excluding trash/spam noise).
    qs.set("q", `${term} -in:chats`);
  } else {
    for (const l of base.labelIds ?? []) qs.append("labelIds", l);
    if (base.q) qs.set("q", base.q);
  }
  if (pageToken) qs.set("pageToken", pageToken);

  const list = await gapi<{
    messages?: { id: string; threadId: string }[];
    nextPageToken?: string;
  }>(token, `/messages?${qs.toString()}`);
  const ids = list.messages ?? [];

  // For sent/drafts the meaningful contact is the recipient, not the sender.
  const useRecipient = folder === "sent" || folder === "drafts";

  const seen = new Set<string>();
  const rows: InboxRow[] = [];

  for (const { id } of ids) {
    const msg = await gapi<GmailMessage>(
      token,
      `/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
    );
    if (seen.has(msg.threadId)) continue;
    seen.add(msg.threadId);

    const contact = parseFrom(
      header(msg.payload?.headers, useRecipient ? "To" : "From"),
    );
    rows.push({
      mailboxId: mailbox.id,
      accountEmail: mailbox.email,
      threadId: msg.threadId,
      messageId: msg.id,
      from: contact.name,
      subject: header(msg.payload?.headers, "Subject") || "(no subject)",
      snippet: msg.snippet ?? "",
      date: new Date(Number(msg.internalDate)).toISOString(),
      unread: msg.labelIds?.includes("UNREAD") ?? false,
      starred: msg.labelIds?.includes("STARRED") ?? false,
    });
  }

  return { rows, nextPageToken: list.nextPageToken };
}

async function modifyThread(
  token: string,
  threadId: string,
  add: string[],
  remove: string[],
): Promise<void> {
  await gapi(token, `/threads/${threadId}/modify`, {
    method: "POST",
    body: JSON.stringify({ addLabelIds: add, removeLabelIds: remove }),
  });
}

/** Star or unstar a whole thread. */
export async function setThreadStar(
  token: string,
  threadId: string,
  on: boolean,
): Promise<void> {
  await modifyThread(token, threadId, on ? ["STARRED"] : [], on ? [] : ["STARRED"]);
}

/** Mark a thread read or unread. */
export async function setThreadRead(
  token: string,
  threadId: string,
  read: boolean,
): Promise<void> {
  await modifyThread(token, threadId, read ? [] : ["UNREAD"], read ? ["UNREAD"] : []);
}

/** Archive a thread (remove it from the inbox). */
export async function archiveThread(token: string, threadId: string): Promise<void> {
  await modifyThread(token, threadId, [], ["INBOX"]);
}

/** Move a thread to Trash. */
export async function trashThread(token: string, threadId: string): Promise<void> {
  await gapi(token, `/threads/${threadId}/trash`, { method: "POST" });
}

export type ThreadData = {
  subject: string;
  participants: string[];
  lastMessageAt: string;
  starred: boolean;
  /** Address to reply to (the most recent message not sent by the user). */
  replyToEmail: string;
  /** RFC Message-ID of the last message, for threading replies. */
  lastMessageIdHeader: string;
  messages: {
    id: string;
    senderName: string;
    senderEmail: string;
    to: string;
    body: string;
    html: string;
    createdAt: string;
    mine: boolean;
    /** Unsubscribe URL/mailto from the List-Unsubscribe header, if present. */
    listUnsubscribe?: string;
    attachments: MailAttachment[];
  }[];
};

/** Extracts the first usable link from a List-Unsubscribe header value. */
function parseListUnsubscribe(value: string): string | undefined {
  if (!value) return undefined;
  const urls = [...value.matchAll(/<([^>]+)>/g)].map((m) => m[1]);
  return urls.find((u) => u.startsWith("http")) ?? urls.find((u) => u.startsWith("mailto:"));
}

/** Loads every message in a thread, oldest first. */
export async function getThread(
  token: string,
  threadId: string,
  selfEmail: string,
): Promise<ThreadData> {
  const thread = await gapi<{ messages: GmailMessage[] }>(
    token,
    `/threads/${threadId}?format=full`,
  );
  const msgs = thread.messages ?? [];

  const participants = new Set<string>();
  const messages = msgs.map((m) => {
    const from = parseFrom(header(m.payload?.headers, "From"));
    participants.add(from.name);
    const { html, text } = extractBodies(m.payload);
    return {
      id: m.id,
      senderName: from.name,
      senderEmail: from.email,
      to: header(m.payload?.headers, "To"),
      body: text || m.snippet || "",
      html,
      createdAt: new Date(Number(m.internalDate)).toISOString(),
      mine: from.email.toLowerCase() === selfEmail.toLowerCase(),
      listUnsubscribe: parseListUnsubscribe(header(m.payload?.headers, "List-Unsubscribe")),
      attachments: parseAttachments(m.id, m.payload),
    };
  });

  const last = msgs[msgs.length - 1];
  // Reply to the most recent inbound message; fall back to the last one.
  const lastInbound = [...msgs].reverse().find((m) => {
    const f = parseFrom(header(m.payload?.headers, "From"));
    return f.email.toLowerCase() !== selfEmail.toLowerCase();
  });
  const replyTarget = lastInbound ?? last;

  return {
    subject: header(msgs[0]?.payload?.headers, "Subject") || "(no subject)",
    participants: [...participants],
    lastMessageAt: last
      ? new Date(Number(last.internalDate)).toISOString()
      : new Date().toISOString(),
    starred: msgs.some((m) => m.labelIds?.includes("STARRED")),
    replyToEmail: replyTarget
      ? parseFrom(header(replyTarget.payload?.headers, "From")).email
      : "",
    lastMessageIdHeader: header(last?.payload?.headers, "Message-ID"),
    messages,
  };
}

function toBase64Url(str: string): string {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export type OutgoingAttachment = {
  fileName: string;
  mimeType: string;
  /** Standard base64 (not url-safe) file contents. */
  base64: string;
};

/** Sends an email. Set threadId/inReplyTo to reply within a thread; pass
 *  attachments to send as multipart/mixed. */
export async function sendEmail(
  token: string,
  opts: {
    from: string;
    to: string;
    subject: string;
    body: string;
    threadId?: string;
    inReplyTo?: string;
    attachments?: OutgoingAttachment[];
  },
): Promise<void> {
  const baseHeaders = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    "MIME-Version: 1.0",
  ];
  if (opts.inReplyTo) {
    baseHeaders.push(`In-Reply-To: ${opts.inReplyTo}`);
    baseHeaders.push(`References: ${opts.inReplyTo}`);
  }

  let mime: string;
  const attachments = opts.attachments ?? [];
  if (attachments.length === 0) {
    mime = [
      ...baseHeaders,
      "Content-Type: text/plain; charset=utf-8",
      "",
      opts.body,
    ].join("\r\n");
  } else {
    const boundary = `tarn_${Math.random().toString(36).slice(2)}`;
    const parts: string[] = [
      ...baseHeaders,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      opts.body,
    ];
    for (const a of attachments) {
      parts.push(
        `--${boundary}`,
        `Content-Type: ${a.mimeType}; name="${a.fileName}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${a.fileName}"`,
        "",
        // base64 lines, wrapped at 76 chars per RFC 2045.
        a.base64.replace(/(.{76})/g, "$1\r\n"),
      );
    }
    parts.push(`--${boundary}--`);
    mime = parts.join("\r\n");
  }

  const raw = toBase64Url(mime);

  await gapi(token, "/messages/send", {
    method: "POST",
    body: JSON.stringify({ raw, ...(opts.threadId ? { threadId: opts.threadId } : {}) }),
  });
}

/** Saves a draft. Builds the same MIME as sendEmail but stores it as a draft. */
export async function saveDraft(
  token: string,
  opts: {
    from: string;
    to: string;
    subject: string;
    body: string;
    attachments?: OutgoingAttachment[];
  },
): Promise<void> {
  const baseHeaders = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    "MIME-Version: 1.0",
  ];

  let mime: string;
  const attachments = opts.attachments ?? [];
  if (attachments.length === 0) {
    mime = [
      ...baseHeaders,
      "Content-Type: text/plain; charset=utf-8",
      "",
      opts.body,
    ].join("\r\n");
  } else {
    const boundary = `tarn_${Math.random().toString(36).slice(2)}`;
    const parts: string[] = [
      ...baseHeaders,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      opts.body,
    ];
    for (const a of attachments) {
      parts.push(
        `--${boundary}`,
        `Content-Type: ${a.mimeType}; name="${a.fileName}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${a.fileName}"`,
        "",
        a.base64.replace(/(.{76})/g, "$1\r\n"),
      );
    }
    parts.push(`--${boundary}--`);
    mime = parts.join("\r\n");
  }

  const raw = toBase64Url(mime);

  await gapi(token, "/drafts", {
    method: "POST",
    body: JSON.stringify({ message: { raw } }),
  });
}
