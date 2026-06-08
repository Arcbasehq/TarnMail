import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertCanConnect } from "@/lib/plans";
import {
  exchangeCode,
  fetchUserInfo,
  providerFromSlug,
} from "@/lib/auth/oauth";
import { verifyState, CONNECT_NONCE_COOKIE } from "@/lib/auth/state";
import { encrypt } from "@/lib/crypto";

// Completes the additional-mailbox OAuth flow: validates the signed state +
// nonce, exchanges the code, resolves the account email, and stores a
// ConnectedMailbox row scoped to the current user.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const origin = req.nextUrl.origin;
  const back = (connect: string) =>
    NextResponse.redirect(new URL(`/settings?connect=${connect}`, origin));

  const { provider: slug } = await params;
  const provider = providerFromSlug(slug);
  if (!provider) return back("error");

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const nonce = req.cookies.get(CONNECT_NONCE_COOKIE)?.value;
  if (req.nextUrl.searchParams.get("error") || !code || !state) {
    return back("error");
  }

  const verified = verifyState(state, nonce);
  if (
    !verified ||
    verified.userId !== session.user.id ||
    verified.provider !== provider
  ) {
    return back("error");
  }

  // Re-check the limit at completion to close the open-two-tabs race.
  try {
    await assertCanConnect(session.user.id);
  } catch {
    return back("limit");
  }

  try {
    const redirectUri = `${origin}/api/mailboxes/${slug}/callback`;
    const tokens = await exchangeCode(provider, { code, redirectUri });
    const info = await fetchUserInfo(provider, tokens.access_token);

    // Tokens are encrypted at rest (src/lib/crypto.ts).
    const encAccess = encrypt(tokens.access_token);
    const encRefresh = encrypt(tokens.refresh_token);

    await prisma.connectedMailbox.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: session.user.id,
          provider,
          providerAccountId: info.providerAccountId,
        },
      },
      update: {
        email: info.email,
        access_token: encAccess,
        expires_at: tokens.expires_at,
        scope: tokens.scope,
        // Keep the existing refresh_token if the provider didn't return one.
        ...(encRefresh ? { refresh_token: encRefresh } : {}),
      },
      create: {
        userId: session.user.id,
        provider,
        providerAccountId: info.providerAccountId,
        email: info.email,
        access_token: encAccess,
        refresh_token: encRefresh,
        expires_at: tokens.expires_at,
        scope: tokens.scope,
        isPrimary: false,
      },
    });
  } catch {
    return back("error");
  }

  const res = back("ok");
  res.cookies.delete(CONNECT_NONCE_COOKIE);
  return res;
}
