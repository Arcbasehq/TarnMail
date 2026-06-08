"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Server-side persistence for user settings. The client `PreferencesProvider`
// owns the canonical shape and validation; here we just store/return the blob
// keyed to the signed-in user. All functions no-op (return null) when there is
// no session, so the provider can mount on marketing pages too.

/** Returns the stored preferences blob for the current user, or null. */
export async function loadServerPrefs(): Promise<Record<string, unknown> | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { preferences: true },
  });
  const prefs = user?.preferences;
  return prefs && typeof prefs === "object" && !Array.isArray(prefs)
    ? (prefs as Record<string, unknown>)
    : null;
}

/** Persists the full preferences blob for the current user. No-op if signed out. */
export async function saveServerPrefs(
  prefs: Record<string, unknown>,
): Promise<void> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return;
  await prisma.user.update({
    where: { id },
    data: { preferences: prefs as Prisma.InputJsonValue },
  });
}
