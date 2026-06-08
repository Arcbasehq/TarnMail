/**
 * One-off backfill: encrypt any plaintext OAuth tokens already in the database
 * (Account + ConnectedMailbox). Safe to re-run — already-encrypted values are
 * detected via crypto.isEncrypted and skipped.
 *
 * Run with env loaded (DATABASE_URL + TOKEN_ENC_KEY), e.g.:
 *   npx tsx prisma/scripts/encrypt-tokens.ts
 */
import { PrismaClient } from "@prisma/client";
import { encrypt, isEncrypted } from "../../src/lib/crypto";

const prisma = new PrismaClient();

function maybe(value: string | null): string | null | undefined {
  if (value == null || value === "") return undefined; // nothing to change
  if (isEncrypted(value)) return undefined; // already encrypted
  return encrypt(value);
}

async function main() {
  let accounts = 0;
  for (const a of await prisma.account.findMany()) {
    const data: Record<string, string> = {};
    const at = maybe(a.access_token);
    const rt = maybe(a.refresh_token);
    const it = maybe(a.id_token);
    if (at) data.access_token = at;
    if (rt) data.refresh_token = rt;
    if (it) data.id_token = it;
    if (Object.keys(data).length) {
      await prisma.account.update({ where: { id: a.id }, data });
      accounts++;
    }
  }

  let mailboxes = 0;
  for (const m of await prisma.connectedMailbox.findMany()) {
    const data: Record<string, string> = {};
    const at = maybe(m.access_token);
    const rt = maybe(m.refresh_token);
    if (at) data.access_token = at;
    if (rt) data.refresh_token = rt;
    if (Object.keys(data).length) {
      await prisma.connectedMailbox.update({ where: { id: m.id }, data });
      mailboxes++;
    }
  }

  console.log(`Encrypted tokens on ${accounts} account(s), ${mailboxes} mailbox(es).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
