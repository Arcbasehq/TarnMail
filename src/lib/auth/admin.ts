import { auth } from "@/auth";

// Site-level admin access (the global /admin dashboard at admin.tarnmail.xyz).
// This is the *operator* role — the people who run tarnmail — and is entirely
// separate from the BUSINESS plan or workspace roles. Membership is controlled
// by the ADMIN_EMAILS env var (comma-separated), never by anything writable
// from the app UI, so the admin set can't be escalated by a bug in the panel.

/** Lower-cased set of emails permitted into the site-admin dashboard. */
export function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isSiteAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().has(email.toLowerCase());
}

/**
 * Returns the signed-in site admin's identity, or null if the caller is not an
 * admin. Callers should redirect/notFound on null — never reveal the panel.
 */
export async function getSiteAdmin(): Promise<{ id: string; email: string } | null> {
  const session = await auth();
  const email = session?.user?.email;
  const id = session?.user?.id;
  if (!id || !email || !isSiteAdmin(email)) return null;
  return { id, email };
}
