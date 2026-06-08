"use client";

import Wordmark from "@/components/layout/Wordmark";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const columns = [
  {
    titleKey: "footer.product",
    links: [
      { labelKey: "footer.features", href: "/features" },
      { labelKey: "footer.pricing", href: "/pricing" },
      { labelKey: "footer.changelog", href: "/changelog" },
      { labelKey: "footer.status", href: "/status" },
    ],
  },
  {
    titleKey: "footer.company",
    links: [
      { labelKey: "footer.about", href: "/about" },
      { labelKey: "footer.blog", href: "/blog" },
      { labelKey: "footer.contact", href: "/contact" },
    ],
  },
  {
    titleKey: "footer.legal",
    links: [
      { labelKey: "footer.privacy", href: "/privacy" },
      { labelKey: "footer.terms", href: "/terms" },
      { labelKey: "footer.security", href: "/security" },
    ],
  },
];

const socials = [
  { label: "GitHub", href: "https://github.com/tarnmail/", icon: "fa-brands fa-github" },
  { label: "Instagram", href: "https://instagram.com/tarnmail/", icon: "fa-brands fa-instagram" },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="-mt-16 rounded-t-[5rem] border-x border-t border-slate-200 bg-slate-50 pt-16">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm text-slate-500">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 flex gap-4 text-sm text-slate-500">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900"
                >
                  <i className={`${s.icon} text-base`} aria-hidden />
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.titleKey}>
              <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400">
                {t(col.titleKey)}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.labelKey}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {t(link.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="font-mono text-xs text-slate-500">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="font-mono text-xs text-slate-400">
            {t("footer.madeFor")}
          </p>
        </div>
      </div>
    </footer>
  );
}
