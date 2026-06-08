import type { Metadata } from "next";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Terms & Conditions — tarnmail",
  description: "The terms that govern your use of tarnmail.",
};

const sections = [
  [
    "Acceptance",
    "By creating an account or connecting an inbox you agree to these terms. If you are using tarnmail on behalf of an organization, you confirm you are authorized to do so.",
  ],
  [
    "Your accounts",
    "You are responsible for the provider accounts you connect and for keeping your tarnmail credentials secure. You may disconnect any account at any time.",
  ],
  [
    "Acceptable use",
    "Do not use tarnmail to send unlawful content, spam, or to violate the terms of the underlying mail providers. We may suspend access for abuse.",
  ],
  [
    "Availability",
    "We work to keep the service running but do not guarantee uninterrupted access. Planned maintenance is posted on the status page.",
  ],
  [
    "Liability",
    "tarnmail is provided as is. To the extent permitted by law, we are not liable for indirect or consequential damages arising from use of the service.",
  ],
  [
    "Changes",
    "We may update these terms; material changes will be announced in-app or by email. Continued use after changes means you accept them.",
  ],
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        subtitle="Last updated June 1, 2026."
      />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="space-y-10">
          {sections.map(([h, b]) => (
            <div key={h}>
              <h2 className="font-display text-2xl tracking-tight text-slate-900">
                {h}
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">{b}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
