"use client";

import { useState } from "react";
import Link from "next/link";
import { useConsent } from "@/lib/consent/ConsentProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CookieBanner() {
  const { consent, ready, save } = useConsent();
  const { t } = useLanguage();
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  // Don't render server-side or before a stored choice is known, and hide
  // once the user has decided.
  if (!ready || consent !== null) return null;

  return (
    <>
      {/* Bottom bar */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label={t("cookies.title")}
        className="fade-in fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-[0_-1px_12px_rgba(15,23,42,0.06)]"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <p className="flex-1 text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-900">{t("cookies.title")}.</span>{" "}
            {t("cookies.body")}{" "}
            <Link
              href="/privacy"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              {t("cookies.learnMore")}
            </Link>
          </p>
          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setCustomizing(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              {t("cookies.customize")}
            </button>
            <button
              type="button"
              onClick={() => save({ analytics: false })}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t("cookies.essential")}
            </button>
            <button
              type="button"
              onClick={() => save({ analytics: true })}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t("cookies.acceptAll")}
            </button>
          </div>
        </div>
      </div>

      {/* Customize modal */}
      {customizing && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("cookies.customizeTitle")}
        >
          <div
            className="fade-in absolute inset-0 bg-slate-900/40"
            onClick={() => setCustomizing(false)}
          />
          <div className="scale-in relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("cookies.customizeTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("cookies.customizeBody")}
            </p>

            <div className="mt-5 space-y-3">
              {/* Essential — always on, locked */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t("cookies.cat.essential")}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t("cookies.cat.essentialDesc")}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {t("cookies.alwaysOn")}
                </span>
              </div>

              {/* Analytics — toggle */}
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t("cookies.cat.analytics")}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t("cookies.cat.analyticsDesc")}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analytics}
                  onClick={() => setAnalytics((v) => !v)}
                  className={[
                    "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                    analytics ? "bg-accent" : "bg-slate-300",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                      analytics ? "translate-x-5" : "translate-x-0.5",
                    ].join(" ")}
                  />
                </button>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCustomizing(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
              >
                {t("cookies.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  save({ analytics });
                  setCustomizing(false);
                }}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {t("cookies.savePrefs")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
