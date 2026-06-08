import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Support — tarnmail",
  description: "Help connecting accounts, troubleshooting sync and managing access.",
};

const topics = [
  {
    t: "Connecting an account",
    d: "Walk through authorizing Gmail, Outlook or Yahoo over OAuth and what scopes we request.",
  },
  {
    t: "Sync and search",
    d: "Why a thread might be missing, how indexing works, and how to force a re-sync.",
  },
  {
    t: "Managing access",
    d: "Disconnect a provider, rotate tokens, and confirm everything was purged.",
  },
  {
    t: "Billing",
    d: "Change plans, update payment details, and read your invoices.",
  },
];

export default function SupportPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Help when you need it."
        subtitle="Browse common topics below, or reach a human directly. Most replies land within a day."
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {topics.map((t) => (
            <article
              key={t.t}
              className="rounded-xl border border-slate-200 bg-white p-7"
            >
              <h3 className="font-display text-xl tracking-tight text-slate-900">
                {t.t}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                {t.d}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <h2 className="font-display text-2xl tracking-tight">
            Still stuck?
          </h2>
          <p className="max-w-md text-slate-600">
            Send us the details and we will dig in with you.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-md bg-accent px-7 py-4 text-base font-semibold text-white shadow-lg transition-colors hover:bg-accent-dark"
          >
            Contact support
          </Link>
        </div>
      </section>
    </>
  );
}
