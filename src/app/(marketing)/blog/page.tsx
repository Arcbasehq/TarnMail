import type { Metadata } from "next";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Blog — tarnmail",
  description: "Notes on privacy, encryption and building a calmer inbox.",
};

const posts: { title: string; date: string; tag: string; excerpt: string }[] = [];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes from the deep end."
        subtitle="Privacy, encryption and the craft of a calmer inbox."
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        {posts.length === 0 && (
          <p className="text-center text-slate-500">
            No posts yet — we just launched. Check back soon.
          </p>
        )}
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
