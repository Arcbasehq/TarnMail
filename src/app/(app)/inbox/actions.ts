"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import {
  listMailboxes,
  getMailbox,
  ensurePrimaryMailbox,
  type MailboxTokens,
} from "@/lib/auth/tokens";
import { getPlanStatus, type PlanStatus } from "@/lib/plans";
import { planFromEntitlements } from "@/lib/billing/revenuecat";
import { fetchActiveEntitlements } from "@/lib/billing/revenuecat-server";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@prisma/client";
import { getAccessToken } from "@/lib/google/gmail";
import * as mail from "@/lib/mail/dispatch";
import type {
  Folder,
  InboxRow,
  ThreadData,
  StorageQuota,
  OutgoingAttachment,
} from "@/lib/google/gmail";

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function currentUserEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email ?? null;
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    throw new Error("Not authenticated");
  }
  return { id: session.user.id, email: session.user.email };
}

/* --------------------------- thread ref helpers --------------------------- */
// A thread is addressed across the unified timeline as `mailboxId~threadId`, so
// every mutation knows which mailbox's token to use. InboxList builds these refs
// and ThreadView passes them straight back to the actions below.
const REF_SEP = "~";

function parseRef(ref: string): { mailboxId: string; threadId: string } {
  const i = ref.indexOf(REF_SEP);
  if (i === -1) return { mailboxId: "", threadId: ref };
  return { mailboxId: ref.slice(0, i), threadId: ref.slice(i + 1) };
}

// A usable access token plus the provider, so the dispatcher can route the call.
type Access = { token: string; provider: string };

async function accessForMailbox(
  userId: string,
  mailboxId: string,
): Promise<Access> {
  const mailbox = await getMailbox(userId, mailboxId);
  if (!mailbox) throw new Error("Mailbox not found");
  return { token: await getAccessToken(mailbox), provider: mailbox.provider };
}

/** Resolves one access token per distinct mailbox referenced by `refs`. */
async function accessForRefs(
  userId: string,
  refs: string[],
): Promise<Map<string, Access>> {
  const ids = [...new Set(refs.map((r) => parseRef(r).mailboxId))];
  const entries = await Promise.all(
    ids.map(async (id) => [id, await accessForMailbox(userId, id)] as const),
  );
  return new Map(entries);
}

async function primaryMailbox(userId: string): Promise<MailboxTokens> {
  const boxes = await listMailboxes(userId);
  if (boxes.length === 0) throw new Error("No mailbox connected");
  return boxes[0]; // listMailboxes orders isPrimary first
}

/* ------------------------------ reading mail ------------------------------ */
/**
 * Unified timeline: fans out across every connected mailbox, merges by date and
 * returns the newest `max` rows. A single failing mailbox is skipped rather than
 * failing the whole inbox. Works across providers (Gmail + Outlook) via the
 * dispatcher.
 */
export async function fetchInbox(
  folder: Folder = "inbox",
  max = 30,
  search = "",
): Promise<InboxRow[]> {
  const user = await requireUser();
  await ensurePrimaryMailbox(user.id, user.email);
  const mailboxes = await listMailboxes(user.id);
  const perBox = Math.max(10, Math.ceil(max / Math.max(1, mailboxes.length)));

  const results = await Promise.allSettled(
    mailboxes.map(async (mb) => {
      const token = await getAccessToken(mb);
      const page = await mail.listMessages(
        mb.provider,
        token,
        { id: mb.id, email: mb.email },
        folder,
        perBox,
        search,
      );
      return page.rows;
    }),
  );

  const rows = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : [],
  );
  rows.sort((a, b) => b.date.localeCompare(a.date));
  return rows.slice(0, max);
}

export type FolderCount = Record<Folder, number>;

export async function fetchFolderCounts(): Promise<FolderCount> {
  const user = await requireUser();
  await ensurePrimaryMailbox(user.id, user.email);
  const mailboxes = await listMailboxes(user.id);

  const folders: Folder[] = [
    "inbox",
    "drafts",
    "sent",
    "starred",
    "archive",
    "spam",
    "trash",
    "all",
  ];

  const counts: Partial<FolderCount> = {};

  const results = await Promise.allSettled(
    mailboxes.map(async (mb) => {
      const token = await getAccessToken(mb);
      const boxCounts: Partial<FolderCount> = {};
      for (const folder of folders) {
        try {
          const page = await mail.listMessages(
            mb.provider,
            token,
            { id: mb.id, email: mb.email },
            folder,
            1,
            "",
          );
          boxCounts[folder] = page.rows.length;
        } catch {
          boxCounts[folder] = 0;
        }
      }
      return boxCounts;
    }),
  );

  for (const folder of folders) {
    counts[folder] = results
      .filter((r): r is PromiseFulfilledResult<Partial<FolderCount>> => r.status === "fulfilled")
      .reduce((sum, r) => sum + (r.value[folder] ?? 0), 0);
  }

  return counts as FolderCount;
}

export async function fetchAttachment(
  mailboxId: string,
  messageId: string,
  attachmentId: string,
): Promise<string> {
  const user = await requireUser();
  const { token, provider } = await accessForMailbox(user.id, mailboxId);
  return mail.getAttachment(provider, token, messageId, attachmentId);
}

/** Storage quota for the user's primary mailbox (Gmail/Drive or OneDrive). */
export async function fetchStorage(): Promise<StorageQuota | null> {
  const user = await requireUser();
  await ensurePrimaryMailbox(user.id, user.email);
  const mb = await primaryMailbox(user.id);
  const token = await getAccessToken(mb);
  return mail.getStorageQuota(mb.provider, token);
}

export async function fetchThread(ref: string): Promise<ThreadData> {
  const user = await requireUser();
  const { mailboxId, threadId } = parseRef(ref);
  const mailbox = await getMailbox(user.id, mailboxId);
  if (!mailbox) throw new Error("Mailbox not found");
  const token = await getAccessToken(mailbox);
  return mail.getThread(mailbox.provider, token, threadId, mailbox.email);
}

/* ----------------------------- mutating mail ------------------------------ */
export async function starThread(ref: string, on: boolean): Promise<void> {
  const user = await requireUser();
  const { mailboxId, threadId } = parseRef(ref);
  const { token, provider } = await accessForMailbox(user.id, mailboxId);
  await mail.setThreadStar(provider, token, threadId, on);
}

export async function markThreadRead(ref: string, read: boolean): Promise<void> {
  const user = await requireUser();
  const { mailboxId, threadId } = parseRef(ref);
  const { token, provider } = await accessForMailbox(user.id, mailboxId);
  await mail.setThreadRead(provider, token, threadId, read);
}

export async function archiveThreads(refs: string[]): Promise<void> {
  const user = await requireUser();
  const access = await accessForRefs(user.id, refs);
  await Promise.all(
    refs.map((ref) => {
      const { mailboxId, threadId } = parseRef(ref);
      const a = access.get(mailboxId)!;
      return mail.archiveThread(a.provider, a.token, threadId);
    }),
  );
  revalidatePath("/inbox");
}

export async function trashThreads(refs: string[]): Promise<void> {
  const user = await requireUser();
  const access = await accessForRefs(user.id, refs);
  await Promise.all(
    refs.map((ref) => {
      const { mailboxId, threadId } = parseRef(ref);
      const a = access.get(mailboxId)!;
      return mail.trashThread(a.provider, a.token, threadId);
    }),
  );
  revalidatePath("/inbox");
}

export async function markThreadsRead(
  refs: string[],
  read: boolean,
): Promise<void> {
  const user = await requireUser();
  const access = await accessForRefs(user.id, refs);
  await Promise.all(
    refs.map((ref) => {
      const { mailboxId, threadId } = parseRef(ref);
      const a = access.get(mailboxId)!;
      return mail.setThreadRead(a.provider, a.token, threadId, read);
    }),
  );
  revalidatePath("/inbox");
}

export async function composeEmail(formData: FormData): Promise<void> {
  const user = await requireUser();
  const to = String(formData.get("to") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const threadId = String(formData.get("threadId") ?? "").trim();
  const inReplyTo = String(formData.get("inReplyTo") ?? "").trim();
  const mailboxId = String(formData.get("mailboxId") ?? "").trim();
  if (!to || !body) throw new Error("Recipient and message are required");

  // Send from the chosen mailbox, or the primary one for a fresh compose.
  const mailbox = mailboxId
    ? await getMailbox(user.id, mailboxId)
    : await primaryMailbox(user.id);
  if (!mailbox) throw new Error("Mailbox not found");
  const token = await getAccessToken(mailbox);

  const files = formData
    .getAll("files")
    .filter((f): f is File => typeof f !== "string" && f.size > 0);
  const attachments: OutgoingAttachment[] = await Promise.all(
    files.map(async (f) => ({
      fileName: f.name || "attachment",
      mimeType: f.type || "application/octet-stream",
      base64: Buffer.from(await f.arrayBuffer()).toString("base64"),
    })),
  );

  await mail.sendEmail(mailbox.provider, token, {
    from: mailbox.email,
    to,
    subject,
    body,
    attachments,
    ...(threadId ? { threadId } : {}),
    ...(inReplyTo ? { inReplyTo } : {}),
  });

  if (threadId) revalidatePath(`/inbox/${mailbox.id}~${threadId}`);
  revalidatePath("/inbox");
}

export async function saveDraft(formData: FormData): Promise<void> {
  const user = await requireUser();
  const to = String(formData.get("to") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const mailboxId = String(formData.get("mailboxId") ?? "").trim();

  const mailbox = mailboxId
    ? await getMailbox(user.id, mailboxId)
    : await primaryMailbox(user.id);
  if (!mailbox) throw new Error("Mailbox not found");
  const token = await getAccessToken(mailbox);

  const files = formData
    .getAll("files")
    .filter((f): f is File => typeof f !== "string" && f.size > 0);
  const attachments = await Promise.all(
    files.map(async (f) => ({
      fileName: f.name || "attachment",
      mimeType: f.type || "application/octet-stream",
      base64: Buffer.from(await f.arrayBuffer()).toString("base64"),
    })),
  );

  await mail.saveDraft(mailbox.provider, token, {
    from: mailbox.email,
    to,
    subject,
    body,
    attachments,
  });

  revalidatePath("/inbox");
}

/* ------------------------- mailbox management ----------------------------- */
export type MailboxSummary = {
  id: string;
  email: string;
  provider: string;
  isPrimary: boolean;
};

export type MailboxOverview = {
  mailboxes: MailboxSummary[];
  plan: PlanStatus;
};

/** Connected mailboxes + plan status for the settings UI. */
export async function fetchMailboxes(): Promise<MailboxOverview> {
  const user = await requireUser();
  await ensurePrimaryMailbox(user.id, user.email);
  const [boxes, plan] = await Promise.all([
    listMailboxes(user.id),
    getPlanStatus(user.id),
  ]);
  return {
    mailboxes: boxes.map((b) => ({
      id: b.id,
      email: b.email,
      provider: b.provider,
      isPrimary: b.isPrimary,
    })),
    plan,
  };
}

/* ------------------------------- billing ---------------------------------- */
export type BillingContext = { userId: string; email: string; plan: PlanStatus };

/** Identity + plan needed to configure the RevenueCat Web Billing checkout. */
export async function billingContext(): Promise<BillingContext> {
  const user = await requireUser();
  return { userId: user.id, email: user.email, plan: await getPlanStatus(user.id) };
}

/**
 * Authoritatively re-reads the signed-in user's entitlements from RevenueCat
 * and writes the resulting plan. Called right after a successful purchase (and
 * safe to call anytime) so upgrades take effect immediately, independent of the
 * webhook. Never trusts client-supplied entitlement state.
 */
export async function syncMyPlan(): Promise<Plan> {
  const user = await requireUser();
  const entitlements = await fetchActiveEntitlements(user.id);
  const plan = planFromEntitlements(entitlements);
  await prisma.user.update({ where: { id: user.id }, data: { plan } });
  revalidatePath("/settings");
  revalidatePath("/inbox");
  return plan;
}

/** Disconnects an additional mailbox. The primary mailbox can't be removed. */
export async function disconnectMailbox(mailboxId: string): Promise<void> {
  const user = await requireUser();
  const mailbox = await getMailbox(user.id, mailboxId);
  if (!mailbox) throw new Error("Mailbox not found");
  if (mailbox.isPrimary) {
    throw new Error("Disconnect the primary account by signing out instead.");
  }
  await prisma.connectedMailbox.delete({ where: { id: mailbox.id } });
  revalidatePath("/settings");
  revalidatePath("/inbox");
}
