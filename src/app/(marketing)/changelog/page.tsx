import type { Metadata } from "next";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Changelog — tarnmail",
  description: "What's new in tarnmail.",
};

const entries = [
  {
    version: "1.0",
    date: "June 7, 2026",
    items: [
      "tarnmail is here. Connect Gmail, Outlook, and Yahoo and read them in one unified timeline.",
      "Privacy by default: remote images and tracking pixels are blocked out of the box.",
      "Your preferences and signatures follow you across every device you sign in on.",
      "Business workspaces: invite employees, manage roles, and see their connected mailboxes from one dashboard.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <PageHero
        eyebrow="Changelog"
        title="What's new in tarnmail."
        subtitle="Every shipped change, newest first."
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <ol className="space-y-12">
          {entries.map((e) => (
            <li key={e.version} className="relative border-l border-slate-200 pl-8">
              <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-accent" />
              <div className="flex items-baseline gap-3">
                <span className="font-display text-xl tracking-tight text-slate-900">
                  v{e.version}
                </span>
                <span className="text-xs text-slate-400">{e.date}</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                {e.items.map((it) => (
                  <li key={it} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-accent">-</span>
                    {it}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
