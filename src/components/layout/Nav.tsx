"use client";

import Link from "next/link";
import Wordmark from "@/components/layout/Wordmark";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const links = [
  { key: "nav.about", href: "/about" },
  { key: "nav.business", href: "/business" },
  { key: "nav.features", href: "/features" },
  { key: "nav.blog", href: "/blog" },
  { key: "nav.support", href: "/support" },
];

export default function Nav() {
  const { t, locale, setLocale } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <Wordmark />
          <nav className="hidden items-baseline gap-8 lg:flex">
            {links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                className="group relative text-lg font-extrabold leading-none text-slate-800 transition-colors hover:text-accent"
              >
                {t(l.key)}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-accent transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative hidden sm:block">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "fr")}
              className="appearance-none bg-white border border-slate-200 rounded-md px-3 py-1.5 pr-8 text-xs font-medium uppercase tracking-wide text-slate-700 transition-all outline-none cursor-pointer hover:border-slate-300 focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="en">English</option>
              <option value="fr">Fran\u00e7ais</option>
            </select>
            <i
              className="fa-solid fa-chevron-down pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
          </div>

          <span className="hidden h-7 w-px bg-slate-200 sm:block" />

          <Link
            href="/login"
            className="hidden rounded-md border border-accent px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 sm:block"
          >
            {t("nav.tryFree")}
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            {t("nav.login")}
          </Link>
        </div>
      </div>
    </header>
  );
}
