import type { Metadata } from "next";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Status — tarnmail",
  description: "Live status of tarnmail services and provider connections.",
};

const services = [
  ["Web client", "Operational"],
  ["Gmail sync", "Operational"],
  ["Outlook sync", "Operational"],
  ["Yahoo sync", "Operational"],
  ["Search index", "Operational"],
  ["Authentication", "Operational"],
];

const history = [
  ["June 2, 2026", "Outlook sync delayed", "Resolved in 22 min"],
  ["May 19, 2026", "Search reindexing", "Resolved in 1 hr 4 min"],
  ["May 3, 2026", "Scheduled maintenance", "Completed as planned"],
];

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Status"
        title="All systems operational."
        subtitle="Live health of every tarnmail service. Updated continuously."
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {services.map(([name, state]) => (
              <li
                key={name}
                className="flex items-center justify-between px-6 py-4"
              >
                <span className="text-slate-700">{name}</span>
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {state}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="mt-12 font-display text-2xl tracking-tight">
          Recent history
        </h2>
        <ul className="mt-6 space-y-3">
          {history.map(([date, title, outcome]) => (
            <li
              key={date}
              className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="font-medium text-slate-800">{title}</span>
                <span className="ml-3 text-xs text-slate-400">{date}</span>
              </div>
              <span className="text-sm text-slate-500">{outcome}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
