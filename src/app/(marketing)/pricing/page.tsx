import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Pricing — tarnmail",
  description: "Pay for software, not with your inbox. Plans from free to unlimited.",
};

const tiers = [
  {
    name: "Tarn",
    price: "Free",
    note: "for one account",
    feats: [
      "1 connected account",
      "Unified timeline",
      "Full-text search",
      "Encrypted tokens",
    ],
    cta: "Start free",
    href: "/login",
    featured: false,
  },
  {
    name: "Deep",
    price: "$5",
    note: "per month",
    feats: [
      "Up to 5 accounts",
      "Cross-account search",
      "Send from any address",
      "Priority sync",
      "1 GB attachments",
    ],
    cta: "Purchase",
    href: "/settings?upgrade=deep",
    featured: true,
  },
  {
    name: "Fathom",
    price: "$12",
    note: "per month",
    feats: [
      "Unlimited accounts",
      "Team aliases",
      "10 GB attachments",
      "Audit log",
      "Priority support",
    ],
    cta: "Go Fathom",
    href: "/settings?upgrade=fathom",
    featured: false,
  },
];

const faqs = [
  [
    "Do you ever read my mail?",
    "No. We store an encrypted, scoped access token and render your mail in the client. There is no ad profiling or content mining.",
  ],
  [
    "Can I cancel anytime?",
    "Yes. Downgrade or disconnect whenever you like. Your tokens are purged the moment you do.",
  ],
  [
    "What providers are supported?",
    "Gmail, Outlook and Yahoo today, through their official OAuth flows. More are on the way.",
  ],
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Pay for software, not with your inbox."
        subtitle="Simple plans that scale with how many accounts you connect. No ads funding the free tier."
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={[
                "relative flex flex-col rounded-2xl border p-8",
                t.featured
                  ? "border-accent/50 bg-white shadow-xl shadow-accent/10"
                  : "border-slate-200 bg-white",
              ].join(" ")}
            >
              {t.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
                  most popular
                </span>
              )}
              <h3 className="font-display text-2xl tracking-tight">{t.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl tracking-tight text-accent">
                  {t.price}
                </span>
                <span className="text-sm text-slate-500">{t.note}</span>
              </div>
              <ul className="mt-7 flex-1 space-y-3 text-sm text-slate-500">
                {t.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-accent">-</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={t.href}
                className={[
                  "mt-8 rounded-full px-5 py-3 text-center text-sm font-medium transition-all hover:scale-[1.02]",
                  t.featured
                    ? "bg-accent text-white hover:bg-accent-dark"
                    : "border border-slate-200 text-slate-600 hover:border-accent/50 hover:text-accent",
                ].join(" ")}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-center font-display text-3xl tracking-tight">
            Common questions
          </h2>
          <dl className="mt-10 space-y-6">
            {faqs.map(([q, a]) => (
              <div
                key={q}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <dt className="font-semibold text-slate-900">{q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-500">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
