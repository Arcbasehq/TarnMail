import { createChallenge, verifySolution } from "altcha-lib";

const HMAC_KEY = process.env.ALTCHA_HMAC_KEY;

/** ALTCHA is enabled only when a server HMAC key is configured. */
export const altchaEnabled = !!HMAC_KEY;

/** Build a fresh proof-of-work challenge for the widget to solve. */
export async function createAltchaChallenge() {
  if (!HMAC_KEY) throw new Error("ALTCHA_HMAC_KEY is not configured");
  return createChallenge({ hmacKey: HMAC_KEY });
}

/** Verify the base64 solution payload the widget submits. */
export async function verifyAltcha(payload: string): Promise<boolean> {
  if (!HMAC_KEY) return true; // skip when not configured (dev)
  if (!payload) return false;
  try {
    return await verifySolution(payload, HMAC_KEY);
  } catch {
    return false;
  }
}
