"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Purchases,
  PurchasesError,
  ErrorCode,
  type Package,
} from "@revenuecat/purchases-js";
import { billingContext, syncMyPlan } from "@/app/(app)/inbox/actions";
import {
  WEB_BILLING_KEY,
  isBillingConfigured,
  TIERS,
  type PaidTier,
} from "@/lib/billing/config";

const PLAN_LABEL: Record<string, string> = {
  FREE: "Tarn (Free)",
  DEEP: "Deep",
  FATHOM: "Fathom",
};

// Configure RevenueCat once per app-user; reuse the shared instance after.
function getPurchases(appUserId: string): Purchases {
  try {
    return Purchases.getSharedInstance();
  } catch {
    return Purchases.configure({ apiKey: WEB_BILLING_KEY, appUserId });
  }
}

function findPackage(
  pkgId: string,
  offering: { packagesById: Record<string, Package>; availablePackages: Package[] },
): Package | undefined {
  return (
    offering.packagesById[pkgId] ??
    offering.availablePackages.find((p) => p.identifier === pkgId)
  );
}

export function BillingCard() {
  const router = useRouter();
  const params = useSearchParams();
  const [plan, setPlan] = useState<string | null>(null);
  const [busy, setBusy] = useState<PaidTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const startedAuto = useRef(false);

  useEffect(() => {
    billingContext()
      .then((c) => setPlan(c.plan.plan))
      .catch(() => {});
  }, []);

  async function buy(tier: PaidTier) {
    if (!isBillingConfigured) return;
    setBusy(tier);
    setError(null);
    setDone(false);
    try {
      const ctx = await billingContext();
      const purchases = getPurchases(ctx.userId);
      const offerings = await purchases.getOfferings();
      const offering = offerings.current;
      if (!offering) {
        throw new Error("No current offering is configured in RevenueCat.");
      }
      const pkg = findPackage(TIERS[tier].pkg, offering);
      if (!pkg) {
        throw new Error(
          `Package "${TIERS[tier].pkg}" wasn't found in the current offering.`,
        );
      }
      await purchases.purchase({ rcPackage: pkg, customerEmail: ctx.email });
      // Authoritatively sync the plan server-side, then refresh the UI.
      const newPlan = await syncMyPlan();
      setPlan(newPlan);
      setDone(true);
      router.refresh();
    } catch (e) {
      if (e instanceof PurchasesError && e.errorCode === ErrorCode.UserCancelledError) {
        // User closed the checkout — not an error.
      } else {
        setError(e instanceof Error ? e.message : "Purchase failed");
      }
    } finally {
      setBusy(null);
    }
  }

  // Deep-link: /settings?upgrade=deep auto-opens the checkout once.
  useEffect(() => {
    const tier = params.get("upgrade");
    if (!startedAuto.current && (tier === "deep" || tier === "fathom")) {
      startedAuto.current = true;
      buy(tier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const isCurrent = (tier: PaidTier) => plan === TIERS[tier].plan;

  return (
    <section
      id="billing"
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2 className="text-base font-semibold text-slate-900 dark:text-neutral-100">Plan &amp; billing</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
        Current plan:{" "}
        <span className="font-medium text-slate-900 dark:text-neutral-100">
          {plan ? (PLAN_LABEL[plan] ?? plan) : "…"}
        </span>
      </p>

      {!isBillingConfigured && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          Billing isn&apos;t configured. Set <code>NEXT_PUBLIC_REVENUECAT_WEB_BILLING_KEY</code> (and
          the server keys) to enable upgrades.
        </p>
      )}

      {done && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          You&apos;re upgraded. Enjoy your new account limit.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      {isBillingConfigured && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(Object.keys(TIERS) as PaidTier[]).map((tier) => {
            const t = TIERS[tier];
            const current = isCurrent(tier);
            return (
              <div
                key={tier}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-neutral-800"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100">{t.label}</p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">{t.price}</p>
                </div>
                <button
                  onClick={() => buy(tier)}
                  disabled={busy !== null || current}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
                >
                  {current ? "Current" : busy === tier ? "Opening…" : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
