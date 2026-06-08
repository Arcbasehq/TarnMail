import "server-only";

// Server-side RevenueCat REST access (uses the SECRET v1 key). Used to
// authoritatively read a customer's entitlements after a purchase, so we never
// trust client-reported entitlement state. Complements the webhook push path.

const REST_BASE = "https://api.revenuecat.com/v1";

/**
 * Returns the identifiers of the customer's currently-active entitlements by
 * querying RevenueCat. Returns [] if billing isn't configured or the customer
 * is unknown.
 */
export async function fetchActiveEntitlements(
  appUserId: string,
): Promise<string[]> {
  const key = process.env.REVENUECAT_SECRET_API_KEY;
  if (!key) return [];

  const res = await fetch(
    `${REST_BASE}/subscribers/${encodeURIComponent(appUserId)}`,
    {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return [];

  const data = (await res.json()) as {
    subscriber?: {
      entitlements?: Record<string, { expires_date?: string | null }>;
    };
  };
  const entitlements = data.subscriber?.entitlements ?? {};
  const now = Date.now();

  return Object.entries(entitlements)
    .filter(([, e]) => {
      // null expiry = lifetime; otherwise active while in the future.
      if (!e.expires_date) return true;
      return new Date(e.expires_date).getTime() > now;
    })
    .map(([id]) => id);
}
