import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Features — tarnmail",
  description:
    "Unified inbox, native replies, password-free connect, full-text search and encryption at rest.",
};

const features = [
  {
    t: "Unified inbox",
    d: "Gmail, Outlook and Yahoo threaded together in one timeline, or filtered per account in a click.",
  },
  {
    t: "Reply natively",
    d: "Compose and send through each provider's own pipeline, so your mail still lands from your real address.",
  },
  {
    t: "Password-free connect",
    d: "We use OAuth. You authorize at Google or Microsoft directly. tarnmail never sees your password.",
  },
  {
    t: "Search everything",
    d: "Full-text search across every connected account at once. One query, every inbox.",
  },
  {
    t: "Encrypted at rest",
    d: "Access tokens are encrypted in storage and scoped to exactly what's needed. Revoke in one tap.",
  },
  {
    t: "No surveillance",
    d: "No ad profiling, no content mining, no selling. The product is the client, not your attention.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Every inbox, gathered into still water."
        subtitle="One encrypted client for all your mail. Fast search, native send, built to stay out of the way."
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <article
              key={f.t}
              className="group rounded-xl border border-slate-200 bg-white p-7 transition-all hover:border-accent/20 hover:shadow-md hover:border-full"
            >
              <span className="font-mono text-xs text-slate-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-2xl tracking-tight text-slate-900">
                {f.t}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                {f.d}
              </p>
              <span className="mt-5 block h-px w-0 bg-accent transition-all duration-500 group-hover:w-12" />
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/login"
            className="inline-block rounded-md bg-accent px-7 py-4 text-base font-semibold text-white shadow-lg transition-colors hover:bg-accent-dark"
          >
            Connect your inbox
          </Link>
        </div>
      </section>
    </>
  );
}
