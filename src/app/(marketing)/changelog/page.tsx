import type { Metadata } from "next";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Changelog — tarnmail",
  description: "What's new in tarnmail.",
};

const entries = [
  {
    version: "1.4",
    date: "June 4, 2026",
    items: [
      "Cross-account search is now up to 3x faster on large mailboxes.",
      "Added per-account filtering to the unified timeline.",
    ],
  },
  {
    version: "1.3",
    date: "May 20, 2026",
    items: [
      "Yahoo Mail is now supported over OAuth.",
      "Attachments can be previewed inline before download.",
    ],
  },
  {
    version: "1.2",
    date: "May 6, 2026",
    items: [
      "Reply now sends through each provider's native pipeline.",
      "Tokens are re-encrypted on a rotating key schedule.",
    ],
  },
  {
    version: "1.1",
    date: "April 22, 2026",
    items: [
      "One-tap disconnect with immediate token purge.",
      "Dark mode for the reading pane.",
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
