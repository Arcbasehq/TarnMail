import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { assertCanConnect, PlanLimitError } from "@/lib/plans";
import { buildAuthUrl, providerFromSlug } from "@/lib/auth/oauth";
import { signState, CONNECT_NONCE_COOKIE } from "@/lib/auth/state";

// Kicks off connecting an *additional* mailbox: enforces the plan limit, then
// redirects to the provider consent screen with a signed state. The login
// session is untouched — this never changes who is signed in.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const origin = req.nextUrl.origin;
  const { provider: slug } = await params;
  const provider = providerFromSlug(slug);
  if (!provider) {
    return NextResponse.redirect(new URL("/settings?connect=error", origin));
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  try {
    await assertCanConnect(session.user.id);
  } catch (e) {
    const reason = e instanceof PlanLimitError ? "limit" : "error";
    return NextResponse.redirect(new URL(`/settings?connect=${reason}`, origin));
  }

  const { state, nonce } = signState(session.user.id, provider);
  const redirectUri = `${origin}/api/mailboxes/${slug}/callback`;
  const res = NextResponse.redirect(buildAuthUrl(provider, { redirectUri, state }));
  res.cookies.set(CONNECT_NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 600,
  });
  return res;
}
