import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "About us — tarnmail",
  description:
    "tarnmail gathers every inbox into one private, encrypted client. Why we built it.",
};

const values = [
  {
    icon: "fa-solid fa-shield-halved",
    t: "Privacy is the product",
    d: "We make money from software. No ad profiling, no content mining, no selling.",
  },
  {
    icon: "fa-solid fa-lock",
    t: "Least privilege by default",
    d: "Provider OAuth, scoped encrypted token. We never store your password or request more access than you grant.",
  },
  {
    icon: "fa-solid fa-key",
    t: "Open over locked-in",
    d: "We build on each provider's official API so your mail stays yours. Revoke our access from your account at any time.",
  },
];

const stats = [
  { value: "0", label: "Ads served" },
  { value: "0", label: "Emails scanned for data" },
  { value: "256-bit", label: "Encryption at rest" },
  { value: "100%", label: "OAuth-only auth" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Your mail, kept deep and quiet."
        subtitle="tarnmail started with a simple frustration: inboxes scattered across Gmail, Outlook and Yahoo, each one watching what you read. We built the calm, encrypted client we wanted to use."
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-lg leading-relaxed text-slate-600">
          tarnmail is a mail client that puts all your accounts in one place.
          Encrypted by default, searchable everywhere, no tracking.
        </p>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          We are a small team building the tool we wanted. No ads, no data
          collection, no bullshit.
        </p>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          We think a mail client should work for you, not mine your inbox for
          ad targeting. tarnmail doesn't profile you, build advertising
          segments, or sell anything about your mail.
        </p>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          OAuth-only sign-in means we never see your password. We connect
          through each provider's official API and store only a scoped access
          token, encrypted at rest with AES-256-GCM. Your mail isn't kept in our
          database — it's fetched on demand to show it to you, and you can revoke
          our access from your provider at any time.
        </p>
      </section>

      <section className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-4xl font-bold tracking-tight text-accent">
                  {s.value}
                </div>
                <div className="mt-2 text-sm font-medium text-slate-600">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl tracking-tight">
            What we stand for
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {values.map((v) => (
              <article
                key={v.t}
                className="group rounded-xl border border-slate-200 bg-white p-7 transition-all hover:border-accent/20 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <i className={`${v.icon} h-6 w-6`} aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-xl tracking-tight text-slate-900">
                  {v.t}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {v.d}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl tracking-tight">
            Try tarnmail free.
          </h2>
          <p className="mt-4 text-slate-600">
            One encrypted client for every inbox.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-accent-dark hover:shadow-xl"
          >
            Get started free
          </Link>
          <p className="mt-4 text-sm text-slate-500">No credit card required</p>
        </div>
      </section>
    </>
  );
}
