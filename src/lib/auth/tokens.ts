import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";

export type Provider = "google" | "microsoft-entra-id" | "yahoo";

// A connected mailbox plus the token fields needed to call its provider API.
// This is the per-mailbox replacement for the old single-Account lookup: the
// `ConnectedMailbox` table is now the source of truth for mail access.
export type MailboxTokens = {
  id: string;
  userId: string;
  provider: string;
  email: string;
  isPrimary: boolean;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: number | null;
  scope: string | null;
};

const TOKEN_FIELDS = {
  id: true,
  userId: true,
  provider: true,
  email: true,
  isPrimary: true,
  access_token: true,
  refresh_token: true,
  expires_at: true,
  scope: true,
} as const;

/** All mailboxes a user has connected, primary first then newest. */
export function listMailboxes(userId: string): Promise<MailboxTokens[]> {
  return prisma.connectedMailbox.findMany({
    where: { userId },
    select: TOKEN_FIELDS,
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });
}

/** A single mailbox by id, scoped to the owning user. */
export function getMailbox(
  userId: string,
  mailboxId: string,
): Promise<MailboxTokens | null> {
  return prisma.connectedMailbox.findFirst({
    where: { id: mailboxId, userId },
    select: TOKEN_FIELDS,
  });
}

export function isExpired(expiresAt: number | null | undefined): boolean {
  if (!expiresAt) return false;
  // expires_at is unix seconds; refresh 60s early.
  return Date.now() / 1000 > expiresAt - 60;
}

// The subset of an Auth.js Account we need to mirror into a ConnectedMailbox.
type AccountLike = {
  provider: string;
  providerAccountId: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  scope?: string | null;
};

/**
 * Mirrors the login Account into a primary ConnectedMailbox so the unified
 * timeline can treat the first mailbox exactly like additional ones. Called
 * from the Auth.js `linkAccount` event (src/auth.ts).
 */
export async function upsertPrimaryMailbox(
  userId: string,
  email: string,
  account: AccountLike,
): Promise<void> {
  // Callers pass plaintext tokens; they're encrypted at rest here.
  const data = {
    email,
    access_token: encrypt(account.access_token),
    refresh_token: encrypt(account.refresh_token),
    expires_at: account.expires_at ?? null,
    scope: account.scope ?? null,
  };
  await prisma.connectedMailbox.upsert({
    where: {
      userId_provider_providerAccountId: {
        userId,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
    update: data,
    create: {
      userId,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      isPrimary: true,
      ...data,
    },
  });
}

/**
 * Backfills a primary mailbox for users who logged in before ConnectedMailbox
 * existed (their tokens still live only on the Auth.js Account row). No-ops once
 * the user has any mailbox. Safe to call on every inbox load.
 */
export async function ensurePrimaryMailbox(
  userId: string,
  email: string,
): Promise<void> {
  const count = await prisma.connectedMailbox.count({ where: { userId } });
  if (count > 0) return;
  const account = await prisma.account.findFirst({
    where: { userId },
    select: {
      provider: true,
      providerAccountId: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
      scope: true,
    },
  });
  if (account) {
    // Account tokens are encrypted at rest too; decrypt to plaintext so
    // upsertPrimaryMailbox can re-encrypt for the ConnectedMailbox row.
    await upsertPrimaryMailbox(userId, email, {
      ...account,
      access_token: decrypt(account.access_token),
      refresh_token: decrypt(account.refresh_token),
    });
  }
}
