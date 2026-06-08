import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Security — tarnmail",
  description:
    "OAuth-only access, encrypted tokens, least-privilege scopes and instant revocation.",
};

const model = [
  ["auth", "OAuth 2.0 authorized at the provider, never on our forms"],
  ["store", "Tokens encrypted at rest, row-level isolated per user"],
  ["scope", "Least-privilege scopes: read and send only what you grant"],
  ["transport", "TLS everywhere, signed and short-lived download URLs"],
  ["control", "Disconnect any account instantly. Tokens purged"],
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security"
        title="OAuth access, encrypted tokens, least privilege."
        subtitle="tarnmail connects through official OAuth flows and stores a scoped, encrypted token. Never your password."
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <ul className="space-y-4 font-mono text-sm">
          {model.map(([k, v]) => (
            <li
              key={k}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4"
            >
              <span className="w-24 shrink-0 text-accent">{k}</span>
              <span className="text-slate-600">{v}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="font-display text-2xl tracking-tight">
            Report a vulnerability
          </h2>
          <p className="mt-3 leading-relaxed text-slate-600">
            Found something? Email{" "}
            <a
              href="mailto:security@tarnmail.com"
              className="font-semibold text-accent hover:underline"
            >
              security@tarnmail.com
            </a>{" "}
            with details and steps to reproduce. We acknowledge reports within
            48 hours.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
