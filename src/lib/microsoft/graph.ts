import type {
  Folder,
  InboxPage,
  InboxRow,
  MailboxRef,
  OutgoingAttachment,
  StorageQuota,
  ThreadData,
} from "@/lib/google/gmail";

// Microsoft Graph mail client. Mirrors the function surface of
// src/lib/google/gmail.ts so the dispatcher (src/lib/mail/dispatch.ts) can route
// Outlook/Microsoft mailboxes through the same actions as Gmail. Threads are
// keyed by Graph `conversationId`.

const GRAPH = "https://graph.microsoft.com/v1.0/me";

// tarnmail folder → Graph well-known folder id.
const FOLDER_ID: Partial<Record<Folder, string>> = {
  inbox: "inbox",
  drafts: "drafts",
  sent: "sentitems",
  archive: "archive",
  spam: "junkemail",
  trash: "deleteditems",
};

const SELECT =
  "id,conversationId,subject,bodyPreview,receivedDateTime,isRead,flag,from,toRecipients,internetMessageId";

type GraphAddress = { name?: string; address?: string };
type GraphRecipient = { emailAddress?: GraphAddress };
type GraphMessage = {
  id: string;
  conversationId: string;
  subject?: string;
  bodyPreview?: string;
  receivedDateTime: string;
  isRead?: boolean;
  flag?: { flagStatus?: string };
  from?: GraphRecipient;
  toRecipients?: GraphRecipient[];
  internetMessageId?: string;
  body?: { contentType?: string; content?: string };
};

async function graph<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${GRAPH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Graph ${path} failed: ${res.status} ${await res.text()}`);
  }
  // 202/204 (move, sendMail, patch) have no JSON body.
  if (res.status === 204 || res.status === 202) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function addr(r: GraphRecipient | undefined): { name: string; email: string } {
  const e = r?.emailAddress;
  return { name: e?.name || e?.address || "", email: e?.address || "" };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toRow(m: GraphMessage, mailbox: MailboxRef): InboxRow {
  const from = addr(m.from);
  return {
    mailboxId: mailbox.id,
    accountEmail: mailbox.email,
    // Graph groups by conversationId; use it as the thread id.
    threadId: m.conversationId,
    messageId: m.id,
    from: from.name,
    subject: m.subject || "(no subject)",
    snippet: m.bodyPreview ?? "",
    date: m.receivedDateTime,
    unread: m.isRead === false,
    starred: m.flag?.flagStatus === "flagged",
  };
}

/** Lists messages for a folder (or a whole-mailbox $search), newest first. */
export async function listMessages(
  token: string,
  mailbox: MailboxRef,
  folder: Folder = "inbox",
  max = 30,
  search = "",
): Promise<InboxPage> {
  const term = search.trim();
  let path: string;
  if (term) {
    // $search can't be combined with $orderby; we re-sort after merging.
    path = `/messages?$search="${encodeURIComponent(term)}"&$top=${max}&$select=${SELECT}`;
  } else if (folder === "starred") {
    path = `/messages?$filter=${encodeURIComponent(
      "flag/flagStatus eq 'flagged'",
    )}&$top=${max}&$select=${SELECT}&$orderby=receivedDateTime desc`;
  } else if (folder === "all") {
    path = `/messages?$top=${max}&$select=${SELECT}&$orderby=receivedDateTime desc`;
  } else {
    const fid = FOLDER_ID[folder] ?? "inbox";
    path = `/mailFolders/${fid}/messages?$top=${max}&$select=${SELECT}&$orderby=receivedDateTime desc`;
  }

  const data = await graph<{ value?: GraphMessage[] }>(token, path);
  const msgs = data.value ?? [];

  // Collapse to one row per conversation (thread).
  const seen = new Set<string>();
  const rows: InboxRow[] = [];
  for (const m of msgs) {
    if (seen.has(m.conversationId)) continue;
    seen.add(m.conversationId);
    rows.push(toRow(m, mailbox));
  }
  return { rows };
}

/** Returns the message ids belonging to a conversation. */
async function conversationMessageIds(
  token: string,
  conversationId: string,
): Promise<string[]> {
  const data = await graph<{ value?: { id: string }[] }>(
    token,
    `/messages?$filter=${encodeURIComponent(
      `conversationId eq '${conversationId}'`,
    )}&$select=id&$top=100`,
  );
  return (data.value ?? []).map((m) => m.id);
}

/** Loads every message in a conversation, oldest first. */
export async function getThread(
  token: string,
  conversationId: string,
  selfEmail: string,
): Promise<ThreadData> {
  const data = await graph<{ value?: GraphMessage[] }>(
    token,
    `/messages?$filter=${encodeURIComponent(
      `conversationId eq '${conversationId}'`,
    )}&$select=${SELECT},body&$orderby=receivedDateTime&$top=100`,
  );
  const msgs = data.value ?? [];

  const participants = new Set<string>();
  const messages = msgs.map((m) => {
    const from = addr(m.from);
    participants.add(from.name);
    const isHtml = m.body?.contentType?.toLowerCase() === "html";
    const content = m.body?.content ?? "";
    return {
      id: m.id,
      senderName: from.name,
      senderEmail: from.email,
      to: (m.toRecipients ?? []).map((r) => addr(r).email).join(", "),
      body: isHtml ? stripHtml(content) : content || m.bodyPreview || "",
      html: isHtml ? content : "",
      createdAt: m.receivedDateTime,
      mine: from.email.toLowerCase() === selfEmail.toLowerCase(),
      attachments: [],
    };
  });

  const last = msgs[msgs.length - 1];
  const lastInbound = [...msgs]
    .reverse()
    .find((m) => addr(m.from).email.toLowerCase() !== selfEmail.toLowerCase());
  const replyTarget = lastInbound ?? last;

  return {
    subject: msgs[0]?.subject || "(no subject)",
    participants: [...participants],
    lastMessageAt: last?.receivedDateTime ?? new Date().toISOString(),
    starred: msgs.some((m) => m.flag?.flagStatus === "flagged"),
    replyToEmail: replyTarget ? addr(replyTarget.from).email : "",
    lastMessageIdHeader: last?.internetMessageId ?? "",
    messages,
  };
}

async function patchMessage(
  token: string,
  id: string,
  body: Record<string, unknown>,
): Promise<void> {
  await graph(token, `/messages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

async function moveMessage(
  token: string,
  id: string,
  destinationId: string,
): Promise<void> {
  await graph(token, `/messages/${id}/move`, {
    method: "POST",
    body: JSON.stringify({ destinationId }),
  });
}

/** Acts on every message in a conversation. */
async function forEachInConversation(
  token: string,
  conversationId: string,
  fn: (id: string) => Promise<void>,
): Promise<void> {
  const ids = await conversationMessageIds(token, conversationId);
  await Promise.all(ids.map(fn));
}

export async function setThreadStar(
  token: string,
  conversationId: string,
  on: boolean,
): Promise<void> {
  await forEachInConversation(token, conversationId, (id) =>
    patchMessage(token, id, {
      flag: { flagStatus: on ? "flagged" : "notFlagged" },
    }),
  );
}

export async function setThreadRead(
  token: string,
  conversationId: string,
  read: boolean,
): Promise<void> {
  await forEachInConversation(token, conversationId, (id) =>
    patchMessage(token, id, { isRead: read }),
  );
}

export async function archiveThread(
  token: string,
  conversationId: string,
): Promise<void> {
  await forEachInConversation(token, conversationId, (id) =>
    moveMessage(token, id, "archive"),
  );
}

export async function trashThread(
  token: string,
  conversationId: string,
): Promise<void> {
  await forEachInConversation(token, conversationId, (id) =>
    moveMessage(token, id, "deleteditems"),
  );
}

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
  const toRecipients = opts.to
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((address) => ({ emailAddress: { address } }));

  const message: Record<string, unknown> = {
    subject: opts.subject,
    body: { contentType: "Text", content: opts.body },
    toRecipients,
  };
  if (opts.attachments?.length) {
    message.attachments = opts.attachments.map((a) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: a.fileName,
      contentType: a.mimeType,
      contentBytes: a.base64,
    }));
  }

  await graph(token, "/sendMail", {
    method: "POST",
    body: JSON.stringify({ message, saveToSentItems: true }),
  });
}

/** Saves a draft in the Drafts folder. */
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
  const toRecipients = opts.to
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((address) => ({ emailAddress: { address } }));

  const message: Record<string, unknown> = {
    subject: opts.subject,
    body: { contentType: "Text", content: opts.body },
    ...(toRecipients.length ? { toRecipients } : {}),
  };
  if (opts.attachments?.length) {
    message.attachments = opts.attachments.map((a) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: a.fileName,
      contentType: a.mimeType,
      contentBytes: a.base64,
    }));
  }

  await graph(token, "/messages", {
    method: "POST",
    body: JSON.stringify(message),
  });
}

/** OneDrive quota, used as the storage figure for Outlook accounts. */
export async function getStorageQuota(
  token: string,
): Promise<StorageQuota | null> {
  try {
    const data = await graph<{
      quota?: { used?: number; total?: number };
    }>(token, "/drive?$select=quota");
    const q = data.quota;
    if (!q || q.used == null) return null;
    return { usage: Number(q.used), limit: q.total != null ? Number(q.total) : null };
  } catch {
    return null;
  }
}

/** Fetches an attachment's bytes as base64. */
export async function getAttachment(
  token: string,
  messageId: string,
  attachmentId: string,
): Promise<string> {
  const data = await graph<{ contentBytes?: string }>(
    token,
    `/messages/${messageId}/attachments/${attachmentId}`,
  );
  return data.contentBytes ?? "";
}
