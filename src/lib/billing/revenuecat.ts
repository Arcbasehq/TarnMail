// Plan as a type only (see src/lib/plans.ts) — keyed with string literals so we
// never touch the Prisma enum's runtime object.
import type { Plan } from "@prisma/client";

// RevenueCat Web Billing integration. RevenueCat is the authoritative source of
// a user's plan: its webhook (src/app/api/revenuecat/webhook/route.ts) maps
// active entitlements onto User.plan, which in turn gates the mailbox limit
// (src/lib/plans.ts). The RevenueCat app_user_id is the tarnmail User.id.

// Entitlement identifiers configured in the RevenueCat dashboard.
export const ENTITLEMENT_PLAN: Record<string, Plan> = {
  deep: "DEEP",
  fathom: "FATHOM",
};

/** Highest tier among the active entitlements wins; none ⇒ FREE. */
export function planFromEntitlements(entitlementIds: string[]): Plan {
  if (entitlementIds.some((id) => ENTITLEMENT_PLAN[id] === "FATHOM")) {
    return "FATHOM";
  }
  if (entitlementIds.some((id) => ENTITLEMENT_PLAN[id] === "DEEP")) {
    return "DEEP";
  }
  return "FREE";
}

// Event types that mean the user no longer has an active entitlement.
const REVOKING_EVENTS = new Set([
  "CANCELLATION",
  "EXPIRATION",
  "SUBSCRIPTION_PAUSED",
  "REFUND",
]);

/** Resolves the plan a webhook event implies. */
export function planForEvent(event: {
  type: string;
  entitlement_ids?: string[] | null;
}): Plan {
  if (REVOKING_EVENTS.has(event.type)) return "FREE";
  return planFromEntitlements(event.entitlement_ids ?? []);
}

/**
 * Verifies the shared-secret Authorization header configured on the RevenueCat
 * webhook. Accepts either the raw secret or a `Bearer <secret>` form.
 */
export function verifyWebhookAuth(authHeader: string | null): boolean {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret || !authHeader) return false;
  return authHeader === secret || authHeader === `Bearer ${secret}`;
}
