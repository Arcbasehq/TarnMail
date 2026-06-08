import type { Metadata } from "next";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Blog — tarnmail",
  description: "Notes on privacy, encryption and building a calmer inbox.",
};

const posts = [
  {
    title: "Why we never store your password",
    date: "May 28, 2026",
    tag: "Security",
    excerpt:
      "OAuth lets you authorize at Google or Microsoft directly. What that means for your account, and what tarnmail can and cannot see.",
  },
  {
    title: "One query, every inbox",
    date: "May 14, 2026",
    tag: "Product",
    excerpt:
      "How we index Gmail, Outlook and Yahoo into a single full-text search without keeping a copy of your mail we shouldn't.",
  },
  {
    title: "Encryption at rest, explained simply",
    date: "April 30, 2026",
    tag: "Engineering",
    excerpt:
      "Tokens are encrypted and row-isolated per user. How the keys are managed and the threat model behind it.",
  },
  {
    title: "Designing for calm, not engagement",
    date: "April 16, 2026",
    tag: "Design",
    excerpt:
      "Most mail apps want your attention. We wanted the opposite. Notes on building an inbox that lets you leave.",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes from the deep end."
        subtitle="Privacy, encryption and the craft of a calmer inbox."
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <ul className="divide-y divide-slate-200">
          {posts.map((p) => (
            <li key={p.title} className="py-8 first:pt-0">
              <a href="#" className="group block">
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono uppercase tracking-wide text-accent">
                    {p.tag}
                  </span>
                  <span className="text-slate-400">{p.date}</span>
                </div>
                <h2 className="mt-3 font-display text-2xl tracking-tight text-slate-900 transition-colors group-hover:text-accent">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {p.excerpt}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
