import crypto from "crypto";
import type { Provider } from "@/lib/auth/tokens";

// Signed OAuth `state` for the mailbox-connect flow. The state binds the
// connecting user + provider and is HMAC-signed; a matching one-time nonce is
// also stored in an httpOnly cookie, so the callback is protected against CSRF
// and cross-user replay.

function secret(): string {
  const s = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function hmac(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export const CONNECT_NONCE_COOKIE = "mb_connect_nonce";

export function signState(
  userId: string,
  provider: Provider,
): { state: string; nonce: string } {
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = b64url(JSON.stringify({ userId, provider, nonce }));
  return { state: `${payload}.${hmac(payload)}`, nonce };
}

export function verifyState(
  state: string,
  nonce: string | undefined,
): { userId: string; provider: Provider } | null {
  if (!nonce) return null;
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const expected = hmac(payload);
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.nonce !== nonce) return null;
    return { userId: data.userId, provider: data.provider };
  } catch {
    return null;
  }
}
