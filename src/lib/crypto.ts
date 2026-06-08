import crypto from "crypto";

// AES-256-GCM encryption for OAuth tokens at rest. Stored format is
// `v1:<iv>:<tag>:<ciphertext>` (all base64url). `decrypt` is deliberately
// tolerant of plaintext input so we can roll encryption out gradually and run
// the backfill script (prisma/scripts/encrypt-tokens.ts) without downtime.

const PREFIX = "v1";

// Returns the 32-byte key, or null when TOKEN_ENC_KEY isn't configured. When
// it's absent (e.g. local dev) we degrade to storing plaintext rather than
// crashing — decrypt() already tolerates un-prefixed plaintext.
function key(): Buffer | null {
  const raw = process.env.TOKEN_ENC_KEY;
  if (!raw) return null;
  // Accept a 32-byte key as base64/base64url; fall back to hashing whatever is
  // provided so a plain passphrase still yields a valid 32-byte key.
  const buf = Buffer.from(raw, "base64");
  if (buf.length === 32) return buf;
  return crypto.createHash("sha256").update(raw).digest();
}

/** Encrypts a token. Returns null/empty unchanged; no-ops without a key. */
export function encrypt(plaintext: string | null | undefined): string | null {
  if (plaintext == null || plaintext === "") return plaintext ?? null;
  const k = key();
  if (!k) return plaintext; // no key configured: store as-is
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    enc.toString("base64url"),
  ].join(":");
}

/** Returns true if a stored value is in our encrypted envelope format. */
export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(`${PREFIX}:`);
}

/** Decrypts a token. Plaintext (un-prefixed) input is returned as-is. */
export function decrypt(value: string | null | undefined): string | null {
  if (value == null || value === "") return value ?? null;
  if (!isEncrypted(value)) return value; // tolerate legacy/dev plaintext
  const k = key();
  if (!k) {
    throw new Error("TOKEN_ENC_KEY is required to decrypt stored tokens");
  }
  const [, ivB64, tagB64, dataB64] = value.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    k,
    Buffer.from(ivB64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}
