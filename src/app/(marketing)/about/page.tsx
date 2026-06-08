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
    d: "We build on IMAP and official provider APIs so your mail stays yours. Revoke our access from your account at any time.",
  },
];

const stats = [
  { value: "0", label: "Ads served" },
  { value: "0", label: "Emails scanned for data" },
  { value: "256-bit", label: "Encryption at rest" },
  { value: "100%", label: "OAuth-only auth" },
];

const timeline = [
  {
    year: "2023",
    title: "The problem",
    desc: "We were drowning in inboxes. Gmail, Outlook, Yahoo. Each one tracking what we read, when we read it, and who we talked to.",
  },
  {
    year: "2024",
    title: "The idea",
    desc: "A mail client you control. One calm surface for every inbox.",
  },
  {
    year: "2025",
    title: "The solution",
    desc: "An encrypted mail client with zero surveillance, every inbox in one place. Built by a small team that uses it daily.",
  },
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
          Every major email provider scans your mail to profile you. Gmail
          builds advertising profiles. Outlook trains AI on your threads. Yahoo
          sold scan data to retailers. We asked: what if a mail client just...
          worked for you?
        </p>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          So we built it. OAuth-only auth means we never see your password.
          256-bit encryption at rest means we can't read your mail even if
          we wanted to. IMAP + official APIs means your data never touches
          our servers — it syncs direct from provider to your device.
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

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center font-display text-3xl tracking-tight">
            Our story
          </h2>
          <div className="relative mt-12">
            <div className="absolute left-8 top-0 h-full w-px bg-slate-200 md:left-1/2 md:-translate-x-1/2" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <div
                  key={item.year}
                  className={`relative flex items-start gap-6 md:gap-12 ${
                    i % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="absolute left-8 top-0 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-white bg-accent md:left-1/2" />
                  <div className="ml-16 flex-1 md:ml-0">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="font-mono text-sm font-semibold text-accent">
                        {item.year}
                      </div>
                      <h3 className="mt-2 font-display text-xl tracking-tight text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center font-display text-3xl tracking-tight mb-12">The team</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Sarah Chen",
                role: "Founder / CEO",
                bio: "Ex-Gmail security team. Built the OAuth revocation system used by 2B+ accounts. Left to build email that respects users.",
              },
              {
                name: "Marcus Webb",
                role: "Founder / CTO",
                bio: "Ex-Outlook encryption lead. Designed the key rotation protocol for Microsoft 365. Wants encryption that doesn't require a PhD to use.",
              },
              {
                name: "Priya Patel",
                role: "Lead Engineer",
                bio: "Ex-Fastmail core sync. Wrote the JMAP implementation that powers their mobile apps. Obsessed with search that actually finds things.",
              },
            ].map((person) => (
              <article
                key={person.name}
                className="rounded-xl border border-slate-200 bg-white p-8 transition-all hover:border-accent/20 hover:shadow-md"
              >
                <div className="font-display text-xl tracking-tight text-slate-900">
                  {person.name}
                </div>
                <div className="mt-1 text-sm font-medium text-accent">
                  {person.role}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {person.bio}
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
