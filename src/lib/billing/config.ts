import type { Plan } from "@prisma/client";

// Client-safe billing config (no secrets, no prisma). Imported by the browser
// checkout component. The actual purchase is RevenueCat Web Billing; secrets
// live server-side (revenuecat.ts / revenuecat-server.ts).

/** Public Web Billing API key (RevenueCat dashboard → API keys → Web Billing). */
export const WEB_BILLING_KEY =
  process.env.NEXT_PUBLIC_REVENUECAT_WEB_BILLING_KEY ?? "";

export const isBillingConfigured = WEB_BILLING_KEY.length > 0;

// Paid tiers we sell. `pkg` is the RevenueCat *package identifier* within the
// current offering (configure these to match your dashboard). `entitlement`
// must match the entitlement the package grants (see ENTITLEMENT_PLAN).
export type PaidTier = "deep" | "fathom";

export const TIERS: Record<
  PaidTier,
  { plan: Plan; label: string; price: string; pkg: string; entitlement: string }
> = {
  deep: { plan: "DEEP", label: "Deep", price: "$5/mo", pkg: "deep", entitlement: "deep" },
  fathom: { plan: "FATHOM", label: "Fathom", price: "$12/mo", pkg: "fathom", entitlement: "fathom" },
};
