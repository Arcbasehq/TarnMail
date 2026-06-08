// Import Plan as a TYPE only. The generated Prisma enum is also a runtime
// object, but relying on it here (e.g. `Plan.FREE`) crashes when the client is
// stale in the Turbopack/server-action bundle. The enum values are plain
// strings, so we key these maps with string literals instead.
import type { Plan } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// How many mailboxes each tier may connect. Mirrors the marketing pricing page
// (src/app/(marketing)/pricing/page.tsx): Tarn/free = 1, Deep = 5, Fathom = ∞.
export const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 1,
  DEEP: 5,
  FATHOM: Infinity,
  BUSINESS: Infinity,
};

export const PLAN_LABEL: Record<Plan, string> = {
  FREE: "Tarn",
  DEEP: "Deep",
  FATHOM: "Fathom",
  BUSINESS: "Business",
};

// Master switch for paid features. While false, plan limits are ignored
// (everyone gets unlimited mailboxes) and the billing UI is hidden. Flip back
// to true once RevenueCat billing is configured.
export const BILLING_ENABLED = false;

/** Thrown when a user tries to connect more mailboxes than their plan allows. */
export class PlanLimitError extends Error {
  constructor(
    readonly plan: Plan,
    readonly limit: number,
  ) {
    super(
      `Your ${PLAN_LABEL[plan]} plan allows ${
        limit === Infinity ? "unlimited" : limit
      } connected account${limit === 1 ? "" : "s"}. Upgrade to connect more.`,
    );
    this.name = "PlanLimitError";
  }
}

export type PlanStatus = {
  plan: Plan;
  limit: number;
  used: number;
  /** True when the user has room to connect another mailbox. */
  canConnect: boolean;
};

/** Reads the user's plan and current mailbox count. */
export async function getPlanStatus(userId: string): Promise<PlanStatus> {
  const [user, used] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    prisma.connectedMailbox.count({ where: { userId } }),
  ]);
  const plan: Plan = user?.plan ?? "FREE";
  // Paid features off → no mailbox cap.
  const limit = BILLING_ENABLED ? PLAN_LIMITS[plan] : Infinity;
  return { plan, limit, used, canConnect: used < limit };
}

/** Throws PlanLimitError when the user is already at their mailbox limit. */
export async function assertCanConnect(userId: string): Promise<void> {
  const { canConnect, plan, limit } = await getPlanStatus(userId);
  if (!canConnect) throw new PlanLimitError(plan, limit);
}
