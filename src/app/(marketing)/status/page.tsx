import type { Metadata } from "next";
import PageHero from "@/components/marketing/PageHero";
import { getServiceHealth } from "@/lib/status/health";

export const metadata: Metadata = {
  title: "Status — tarnmail",
  description: "Live status of tarnmail services and provider connections.",
};

// Re-probe at most every 30s so the page reflects live health without hammering
// the providers on every visit.
export const revalidate = 30;

export default async function StatusPage() {
  const services = await getServiceHealth();
  const allOperational = services.every((s) => s.state === "operational");
  const downCount = services.filter((s) => s.state === "down").length;

  return (
    <>
      <PageHero
        eyebrow="Status"
        title={
          allOperational
            ? "All systems operational."
            : downCount === services.length
            ? "Major service disruption."
            : "Some systems are degraded."
        }
        subtitle="Live health of every tarnmail service. Checked continuously."
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {services.map((s) => {
              const up = s.state === "operational";
              return (
                <li
                  key={s.name}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <span className="text-slate-700">{s.name}</span>
                  <span
                    className={`flex items-center gap-2 text-sm font-medium ${
                      up ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        up ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    {up ? "Operational" : "Down"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Last checked {new Date().toLocaleString()}
        </p>
      </section>
    </>
  );
}
