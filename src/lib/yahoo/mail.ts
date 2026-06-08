import type {
  Folder,
  InboxPage,
  InboxRow,
  MailboxRef,
  OutgoingAttachment,
  StorageQuota,
  ThreadData,
} from "@/lib/google/gmail";
import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { simpleParser } from "mailparser";
import type { MailAttachment } from "@/lib/google/gmail";

// Yahoo Mail uses IMAP/SMTP with OAuth2 (XOAuth2).
// IMAP: imap.mail.yahoo.com:993 (SSL)
// SMTP: smtp.mail.yahoo.com:465 (SSL)

async function withImap<T>(
  token: string,
  email: string,
  fn: (client: ImapFlow) => Promise<T>,
): Promise<T> {
  const client = new ImapFlow({
    host: "imap.mail.yahoo.com",
    port: 993,
    secure: true,
    auth: {
      user: email,
      accessToken: token,
    },
    logger: false,
  });
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.logout();
  }
}

const FOLDER_MAP: Record<Folder, string> = {
  inbox: "INBOX",
  drafts: "Draft",
  sent: "Sent",
  starred: "INBOX", // searched by flag
  archive: "Archive",
  spam: "Bulk Mail",
  trash: "Trash",
  all: "All Mail",
};

export async function listMessages(
  token: string,
  mailbox: MailboxRef,
  folder: Folder = "inbox",
  max = 30,
  search = "",
): Promise<InboxPage> {
  return withImap(token, mailbox.email, async (client) => {
    const boxName = FOLDER_MAP[folder] ?? "INBOX";
    await client.mailboxOpen(boxName);

    const query = search.trim()
      ? { header: { subject: search } }
      : {};

    if (folder === "starred") {
      Object.assign(query, { flagged: true });
    }

    const uids = await client.search(query, { uid: true });
    if (!uids || uids.length === 0) return { rows: [] };

    // Take the most recent max messages
    const recent = uids.slice(-max);
    const rows: InboxRow[] = [];
    const seen = new Set<string>();

    for await (const msg of client.fetch(recent, { envelope: true, flags: true, uid: true })) {
      if (!msg || !msg.envelope) continue;
      const uid = String(msg.uid);
      if (seen.has(uid)) continue;
      seen.add(uid);

      const from = msg.envelope.from?.[0];
      const date = msg.envelope.date?.toISOString() ?? new Date().toISOString();

      rows.push({
        mailboxId: mailbox.id,
        accountEmail: mailbox.email,
        threadId: uid,
        messageId: uid,
        from: from?.name || from?.address || "",
        subject: msg.envelope.subject || "(no subject)",
        snippet: "",
        date,
        unread: !msg.flags?.has("\\Seen"),
        starred: msg.flags?.has("\\Flagged") ?? false,
      });
    }

    rows.sort((a, b) => b.date.localeCompare(a.date));
    return { rows };
  });
}

export async function getThread(
  token: string,
  threadId: string,
  selfEmail: string,
): Promise<ThreadData> {
  return withImap(token, selfEmail, async (client) => {
    await client.mailboxOpen("INBOX");
    const msg = await client.fetchOne(threadId, { source: true, envelope: true, uid: true });
    if (!msg || !msg.envelope) {
      return {
        subject: "",
        participants: [],
        lastMessageAt: new Date().toISOString(),
        starred: false,
        replyToEmail: "",
        lastMessageIdHeader: "",
        messages: [],
      };
    }

    const source = msg.source?.toString() ?? "";
    const parsed = await simpleParser(source);

    const from = msg.envelope.from?.[0];
    const to = msg.envelope.to?.map((t: { address?: string }) => t.address || "").join(", ") || "";
    const isMine = (from?.address ?? "").toLowerCase() === selfEmail.toLowerCase();

    const attachments: MailAttachment[] = (parsed.attachments ?? []).map((a, i) => ({
      id: String(i),
      messageId: String(msg.uid),
      fileName: a.filename || `attachment-${i}`,
      sizeBytes: a.content?.length ?? 0,
      mimeType: a.contentType || "application/octet-stream",
    }));

    return {
      subject: msg.envelope.subject || "",
      participants: [from?.name || from?.address || ""],
      lastMessageAt: msg.envelope.date?.toISOString() ?? new Date().toISOString(),
      starred: false,
      replyToEmail: isMine ? "" : (from?.address ?? ""),
      lastMessageIdHeader: parsed.messageId ?? "",
      messages: [
        {
          id: String(msg.uid),
          senderName: from?.name || "",
          senderEmail: from?.address || "",
          to,
          body: parsed.text ?? "",
          html: parsed.html || "",
          createdAt: msg.envelope.date?.toISOString() ?? new Date().toISOString(),
          mine: isMine,
          attachments,
        },
      ],
    };
  });
}

export async function setThreadStar(
  token: string,
  threadId: string,
  on: boolean,
): Promise<void> {
  return withImap(token, "", async (client) => {
    await client.mailboxOpen("INBOX");
    if (on) {
      await client.messageFlagsAdd(threadId, ["\\Flagged"]);
    } else {
      await client.messageFlagsRemove(threadId, ["\\Flagged"]);
    }
  });
}

export async function setThreadRead(
  token: string,
  threadId: string,
  read: boolean,
): Promise<void> {
  return withImap(token, "", async (client) => {
    await client.mailboxOpen("INBOX");
    if (read) {
      await client.messageFlagsAdd(threadId, ["\\Seen"]);
    } else {
      await client.messageFlagsRemove(threadId, ["\\Seen"]);
    }
  });
}

export async function archiveThread(
  token: string,
  threadId: string,
): Promise<void> {
  return withImap(token, "", async (client) => {
    await client.mailboxOpen("INBOX");
    await client.messageMove(threadId, "Archive");
  });
}

export async function trashThread(
  token: string,
  threadId: string,
): Promise<void> {
  return withImap(token, "", async (client) => {
    await client.mailboxOpen("INBOX");
    await client.messageMove(threadId, "Trash");
  });
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
  const transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: opts.from,
      accessToken: token,
    },
  });

  const attachments =
    opts.attachments?.map((a) => ({
      filename: a.fileName,
      contentType: a.mimeType,
      content: Buffer.from(a.base64, "base64"),
    })) ?? [];

  await transporter.sendMail({
    from: opts.from,
    to: opts.to,
    subject: opts.subject,
    text: opts.body,
    inReplyTo: opts.inReplyTo,
    references: opts.inReplyTo ? [opts.inReplyTo] : undefined,
    attachments,
  });
}

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
  return withImap(token, opts.from, async (client) => {
    const MailComposer = require("nodemailer/lib/mail-composer");
    const composer = new MailComposer({
      from: opts.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.body,
      attachments: opts.attachments?.map((a) => ({
        filename: a.fileName,
        contentType: a.mimeType,
        content: Buffer.from(a.base64, "base64"),
      })),
    });
    const message = await composer.compile().build();
    await client.append("Draft", message, ["\\Draft"]);
  });
}

export async function getStorageQuota(
  _token: string,
): Promise<StorageQuota | null> {
  return null;
}

export async function getAttachment(
  token: string,
  messageId: string,
  attachmentId: string,
): Promise<string> {
  return withImap(token, "", async (client) => {
    await client.mailboxOpen("INBOX");
    const msg = await client.fetchOne(messageId, { source: true });
    if (!msg || !msg.source) return "";
    const parsed = await simpleParser(msg.source.toString());
    const index = parseInt(attachmentId, 10);
    const att = parsed.attachments?.[index];
    if (!att || !att.content) return "";
    return att.content.toString("base64");
  });
}
