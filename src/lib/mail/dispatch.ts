import * as gmail from "@/lib/google/gmail";
import * as graph from "@/lib/microsoft/graph";
import * as yahoo from "@/lib/yahoo/mail";
import type {
  Folder,
  InboxPage,
  MailboxRef,
  OutgoingAttachment,
  StorageQuota,
  ThreadData,
} from "@/lib/google/gmail";

// Provider-agnostic mail dispatch. Routes each call to the Gmail, Microsoft
// Graph, or Yahoo IMAP/SMTP client based on the mailbox's provider.

const isGoogle = (provider: string) => provider === "google";
const isYahoo = (provider: string) => provider === "yahoo";

export function listMessages(
  provider: string,
  token: string,
  mailbox: MailboxRef,
  folder: Folder,
  max: number,
  search: string,
): Promise<InboxPage> {
  if (isGoogle(provider))
    return gmail.listMessages(token, mailbox, folder, max, search);
  if (isYahoo(provider))
    return yahoo.listMessages(token, mailbox, folder, max, search);
  return graph.listMessages(token, mailbox, folder, max, search);
}

export function getThread(
  provider: string,
  token: string,
  threadId: string,
  selfEmail: string,
): Promise<ThreadData> {
  if (isGoogle(provider)) return gmail.getThread(token, threadId, selfEmail);
  if (isYahoo(provider)) return yahoo.getThread(token, threadId, selfEmail);
  return graph.getThread(token, threadId, selfEmail);
}

export function setThreadStar(
  provider: string,
  token: string,
  threadId: string,
  on: boolean,
): Promise<void> {
  if (isGoogle(provider)) return gmail.setThreadStar(token, threadId, on);
  if (isYahoo(provider)) return yahoo.setThreadStar(token, threadId, on);
  return graph.setThreadStar(token, threadId, on);
}

export function setThreadRead(
  provider: string,
  token: string,
  threadId: string,
  read: boolean,
): Promise<void> {
  if (isGoogle(provider)) return gmail.setThreadRead(token, threadId, read);
  if (isYahoo(provider)) return yahoo.setThreadRead(token, threadId, read);
  return graph.setThreadRead(token, threadId, read);
}

export function archiveThread(
  provider: string,
  token: string,
  threadId: string,
): Promise<void> {
  if (isGoogle(provider)) return gmail.archiveThread(token, threadId);
  if (isYahoo(provider)) return yahoo.archiveThread(token, threadId);
  return graph.archiveThread(token, threadId);
}

export function trashThread(
  provider: string,
  token: string,
  threadId: string,
): Promise<void> {
  if (isGoogle(provider)) return gmail.trashThread(token, threadId);
  if (isYahoo(provider)) return yahoo.trashThread(token, threadId);
  return graph.trashThread(token, threadId);
}

export function sendEmail(
  provider: string,
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
  if (isGoogle(provider)) return gmail.sendEmail(token, opts);
  if (isYahoo(provider)) return yahoo.sendEmail(token, opts);
  return graph.sendEmail(token, opts);
}

export function saveDraft(
  provider: string,
  token: string,
  opts: {
    from: string;
    to: string;
    subject: string;
    body: string;
    attachments?: OutgoingAttachment[];
  },
): Promise<void> {
  if (isGoogle(provider)) return gmail.saveDraft(token, opts);
  if (isYahoo(provider)) return yahoo.saveDraft(token, opts);
  return graph.saveDraft(token, opts);
}

export function getStorageQuota(
  provider: string,
  token: string,
): Promise<StorageQuota | null> {
  if (isGoogle(provider)) return gmail.getStorageQuota(token);
  if (isYahoo(provider)) return yahoo.getStorageQuota(token);
  return graph.getStorageQuota(token);
}

export function getAttachment(
  provider: string,
  token: string,
  messageId: string,
  attachmentId: string,
): Promise<string> {
  if (isGoogle(provider)) return gmail.getAttachment(token, messageId, attachmentId);
  if (isYahoo(provider)) return yahoo.getAttachment(token, messageId, attachmentId);
  return graph.getAttachment(token, messageId, attachmentId);
}
