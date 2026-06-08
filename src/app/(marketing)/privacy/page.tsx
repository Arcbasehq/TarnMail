import type { Metadata } from "next";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Privacy Policy — tarnmail",
  description: "What tarnmail collects, what it never touches, and your controls.",
};

const sections = [
  [
    "The short version",
    "We do not read, profile, or sell your mail. We store a scoped, encrypted access token so the client can render your inbox, and nothing more than that.",
  ],
  [
    "What we collect",
    "Your account email and the OAuth tokens you authorize, encrypted at rest. Basic operational logs (sign-ins, connects, disconnects) for security. Payment details are handled by our processor, not stored by us.",
  ],
  [
    "What we never collect",
    "We do not build advertising profiles, mine message content, or share your data with third parties for marketing. The contents of your mail are rendered to you and not retained beyond what the client needs to function.",
  ],
  [
    "Your controls",
    "Disconnect any provider at any time and the associated tokens are purged immediately. You can revoke tarnmail's access directly from your Google, Microsoft or Yahoo account as well.",
  ],
  [
    "Data requests",
    "Email info@libresearch.ca to request a copy of your data or its deletion. We respond within 30 days.",
  ],
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Last updated June 7, 2026."
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
