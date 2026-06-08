"use client";

import { useEffect, useState } from "react";
import { fetchStorage, signOutAction } from "@/app/(app)/inbox/actions";
import { formatBytes } from "@/lib/format";
import type { StorageQuota } from "@/lib/google/gmail";

export function StorageBar() {
  const [quota, setQuota] = useState<StorageQuota | null | "loading" | "error">(
    "loading",
  );

  useEffect(() => {
    let alive = true;
    fetchStorage()
      .then((q) => alive && setQuota(q))
      .catch(() => alive && setQuota("error"));
    return () => {
      alive = false;
    };
  }, []);

  if (quota === "loading") {
    return (
      <div className="mt-auto px-2 pt-4">
        <div className="h-1.5 w-full animate-pulse rounded-full bg-slate-200 dark:bg-neutral-800" />
        <div className="mt-2 h-2.5 w-28 animate-pulse rounded bg-slate-200 dark:bg-neutral-800" />
      </div>
    );
  }

  // No Drive scope granted yet (or request failed) -> prompt to reconnect.
  if (quota === "error" || quota === null) {
    return (
      <div className="mt-auto px-2 pt-4">
        <p className="text-[11px] leading-relaxed text-slate-400 dark:text-neutral-500">
          Sign in again to grant Drive access and see your storage.
        </p>
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-1.5 text-[11px] font-semibold text-accent hover:underline"
          >
            Reconnect account
          </button>
        </form>
      </div>
    );
  }

  // Workspace accounts report no limit => unlimited.
  if (quota.limit === null) {
    return (
      <div className="mt-auto px-2 pt-4">
        <p className="text-[11px] text-slate-400 dark:text-neutral-500">
          {formatBytes(quota.usage)} used &middot; unlimited
        </p>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((quota.usage / quota.limit) * 100));
  const near = pct >= 90;

  return (
    <div className="mt-auto px-2 pt-4">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-neutral-800">
        <span
          className={`block h-full rounded-full ${near ? "bg-red-500" : "bg-accent"}`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-slate-400 dark:text-neutral-500">
        {formatBytes(quota.usage)} / {formatBytes(quota.limit)} used
      </p>
    </div>
  );
}
