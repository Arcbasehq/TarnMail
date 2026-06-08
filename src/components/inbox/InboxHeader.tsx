"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOutAction, currentUserEmail } from "@/app/(app)/inbox/actions";

const IconLogo = ({ className }: { className?: string }) => (
  <i className={`fa-solid fa-envelope ${className ?? ""}`} aria-hidden />
);
const IconSearch = ({ className }: { className?: string }) => (
  <i
    className={`fa-solid fa-magnifying-glass ${className ?? ""}`}
    aria-hidden
  />
);
const IconGear = ({ className }: { className?: string }) => (
  <i className={`fa-solid fa-gear ${className ?? ""}`} aria-hidden />
);

export function InboxHeader() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    currentUserEmail().then(setEmail);
  }, []);

  function onSearch(v: string) {
    setQ(v);
    const next = v.trim()
      ? `/inbox?q=${encodeURIComponent(v.trim())}`
      : "/inbox";
    router.replace(next, { scroll: false });
  }

  const name = email ? email.split("@")[0] : "";
  const initial = email ? email[0]?.toUpperCase() : "?";

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {/* Logo (sits above the rail) */}
      <div className="flex w-[260px] shrink-0 items-center gap-2 px-5 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-neutral-100">
        <IconLogo className="h-6 w-6 text-accent" />
        tarnmail
      </div>

      {/* Search */}
      <div className="flex flex-1 items-center gap-4 px-4">
        <div className="relative max-w-2xl flex-1" data-onboarding="search">
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search messages"
            className="w-full rounded-xl border text-slate-900 border-slate-200 bg-slate-100/70 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-accent focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/settings"
            title="Settings"
            className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <IconGear className="h-5 w-5" />
          </Link>

          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
              {name || " "}
            </p>
            <p className="text-xs text-slate-400 dark:text-neutral-500">
              {email ?? ""}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenu((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full bg-accent text-sm font-semibold text-white"
              aria-label="Account"
            >
              {initial}
            </button>

            {menu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenu(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-60 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  <div className="px-3 py-2">
                    <p className="text-xs text-slate-400 dark:text-neutral-500">
                      Signed in as
                    </p>
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-neutral-100">
                      {email ?? "…"}
                    </p>
                  </div>
                  <div className="my-1 h-px bg-slate-100 dark:bg-neutral-700" />
                  <Link href={"/settings"}>
                    <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-700">
                      Settings
                    </button>
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
