import { prisma } from "@/lib/prisma";

// Live service health for the public /status page. Each check is a real probe:
// the database is queried, and each mail provider's OAuth surface (the thing we
// actually depend on to connect mailboxes) is pinged. No mock data.

export type ServiceState = "operational" | "down";

export type ServiceCheck = {
  name: string;
  state: ServiceState;
};

const TIMEOUT_MS = 5000;

/** True if the URL is reachable. Any HTTP response (even 4xx) counts as up — we
 *  only care that the provider is answering, not the status code. */
async function reachable(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    return res.status > 0;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function databaseUp(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// OpenID discovery endpoints — the OAuth dependency for each provider.
const PROVIDERS = {
  google: "https://accounts.google.com/.well-known/openid-configuration",
  microsoft:
    "https://login.microsoftonline.com/common/.well-known/openid-configuration",
  yahoo: "https://api.login.yahoo.com/.well-known/openid-configuration",
} as const;

export async function getServiceHealth(): Promise<ServiceCheck[]> {
  const [db, google, microsoft, yahoo] = await Promise.all([
    databaseUp(),
    reachable(PROVIDERS.google),
    reachable(PROVIDERS.microsoft),
    reachable(PROVIDERS.yahoo),
  ]);

  const state = (up: boolean): ServiceState => (up ? "operational" : "down");

  return [
    // We are serving this request, so the web layer is by definition up.
    { name: "Web client", state: "operational" },
    { name: "Database", state: state(db) },
    // Auth.js sessions are backed by the database.
    { name: "Authentication", state: state(db) },
    { name: "Gmail sync", state: state(google) },
    { name: "Outlook sync", state: state(microsoft) },
    { name: "Yahoo sync", state: state(yahoo) },
  ];
}
