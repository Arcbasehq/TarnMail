"use client";

import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import HeroPreviewPlayer from "@/components/marketing/HeroPreviewPlayer";
import HowItWorks from "@/components/marketing/HowItWorks";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-white text-slate-900 font-sans selection:bg-accent/20">
      <div className="relative z-10">
        <Nav />
        <Hero />
        <TrustBand />
        <Features />
        <SecurityPanel />
        <HowItWorks />
        <FinalCta />
        <Footer />
      </div>
    </main>
  );
}

function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50/70 via-white to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 pb-16 pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:pt-16">
        <div>
          <h1
            className="rise text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl"
            style={{ animationDelay: "120ms" }}
          >
            {t("hero.heading1")}
            <br />
            {t("hero.heading2")}
          </h1>

          <p
            className="rise mt-5 max-w-lg text-base leading-relaxed text-slate-600"
            style={{ animationDelay: "220ms" }}
          >
            {t("hero.subtext")}
          </p>

          <p
            className="rise mt-5 text-base text-slate-600"
            style={{ animationDelay: "300ms" }}
          >
            {t("hero.passwordless")}{" "}
            <a
              href="#security"
              className="font-semibold text-accent hover:underline"
            >
              {t("hero.howWeProtect")}
            </a>
            .
          </p>

          <div className="rise mt-9" style={{ animationDelay: "360ms" }}>
            <Link
              href="/login"
              className="inline-block rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-accent-dark"
            >
              {t("hero.cta")}
            </Link>
          </div>
        </div>

        <HeroPreviewPlayer />
      </div>
    </section>
  );
}

function TrustBand() {
  const { t } = useLanguage();
  const items: [React.ReactNode, string][] = [
    [<IconBan key="i" />, t("trust.noTracking")],
    [<IconInbox key="i" />, t("trust.allInOne")],
    [<IconLock key="i" />, t("trust.oauthOnly")],
    [<IconShield key="i" />, t("trust.encryptedTokens")],
  ];
  return (
    <div className="border-b border-slate-200 bg-white py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6">
        {items.map(([icon, text]) => (
          <span
            key={text}
            className="flex items-center gap-2.5 text-base font-bold text-slate-900"
          >
            <span className="text-accent">{icon}</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const { t } = useLanguage();
  const feats = [
    { t: "features.unifiedInbox", d: "features.unifiedDesc" },
    { t: "features.replyNatively", d: "features.replyDesc" },
    { t: "features.passwordFree", d: "features.passwordFreeDesc" },
    { t: "features.searchEverything", d: "features.searchDesc" },
    { t: "features.encrypted", d: "features.encryptedDesc" },
    { t: "features.noSurveillance", d: "features.noSurveillanceDesc" },
  ];
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <header className="mb-14 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          {t("features.sectionLabel")}
        </p>
        <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
          {t("features.heading")}
        </h2>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {feats.map((f, i) => (
          <article
            key={f.t}
            className="group rounded-xl border border-slate-200 bg-white p-7 transition-all hover:border-accent/20 hover:shadow-md"
          >
            <span className="font-mono text-xs text-slate-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 font-display text-2xl tracking-tight text-slate-900">
              {t(f.t)}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
              {t(f.d)}
            </p>
            <span className="mt-5 block h-px w-0 bg-accent transition-all duration-500 group-hover:w-12" />
          </article>
        ))}
      </div>
    </section>
  );
}

function SecurityPanel() {
  const { t } = useLanguage();
  const items = [
    ["auth", t("security.auth")],
    ["store", t("security.store")],
    ["scope", t("security.scope")],
    ["transport", t("security.transport")],
    ["control", t("security.control")],
  ];
  return (
    <section id="security" className="mx-auto max-w-6xl px-6 py-12">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-10 sm:p-14">
        <div className="relative grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              {t("security.sectionLabel")}
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight">
              {t("security.heading")}
            </h2>
            <p className="mt-5 max-w-md text-slate-500">{t("security.desc")}</p>
          </div>
          <ul className="space-y-4 font-mono text-sm">
            {items.map(([k, v]) => (
              <li
                key={k}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <span className="w-20 shrink-0 text-accent">{k}</span>
                <span className="text-slate-500">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-blue-700 px-8 py-20 text-center">
        <h2 className="relative font-display text-4xl tracking-tight text-white sm:text-6xl">
          {t("cta.heading")}
        </h2>
        <p className="relative mx-auto mt-5 max-w-md text-blue-100">
          {t("cta.subtext")}
        </p>
        <Link
          href="/login"
          className="relative mt-9 inline-block rounded-full bg-white px-8 py-4 text-base font-medium text-accent transition-all hover:bg-blue-50 hover:shadow-lg"
        >
          {t("cta.button")}
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------ icons -------------------------- */
type IconProps = { className?: string };
const cx = (className?: string) => className ?? "h-5 w-5";

function IconBan({ className }: IconProps) {
  return <i className={`fa-solid fa-ban ${cx(className)}`} aria-hidden />;
}
function IconInbox({ className }: IconProps) {
  return <i className={`fa-solid fa-inbox ${cx(className)}`} aria-hidden />;
}
function IconLock({ className }: IconProps) {
  return <i className={`fa-solid fa-lock ${cx(className)}`} aria-hidden />;
}
function IconShield({ className }: IconProps) {
  return <i className={`fa-solid fa-shield-halved ${cx(className)}`} aria-hidden />;
}
