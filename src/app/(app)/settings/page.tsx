"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  currentUserEmail,
  signOutAction,
  fetchStorage,
  fetchMailboxes,
  disconnectMailbox,
  type MailboxOverview,
} from "@/app/(app)/inbox/actions";
// Paid features disabled — billing UI hidden. Re-enable with BILLING_ENABLED.
// import { BillingCard } from "@/components/billing/BillingCard";

// Plan display names (kept local so this client component doesn't import the
// server-only src/lib/plans.ts module).
const PLAN_LABEL: Record<string, string> = {
  FREE: "Tarn",
  DEEP: "Deep",
  FATHOM: "Fathom",
};
import { formatBytes } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { locales, type Locale } from "@/lib/i18n/translations";
import { usePrefs, ACCENTS } from "@/lib/prefs/PreferencesProvider";
import type { StorageQuota } from "@/lib/google/gmail";

const LOCALE_LABEL: Record<Locale, string> = { en: "English", fr: "Français" };

/* ---------------------------------- icons --------------------------------- */
type IP = { className?: string };
const IconHome = (p: IP) => <i className={`fa-solid fa-house ${p.className ?? ""}`} aria-hidden />;
const IconUser = (p: IP) => <i className={`fa-solid fa-user ${p.className ?? ""}`} aria-hidden />;
const IconLang = (p: IP) => <i className={`fa-solid fa-language ${p.className ?? ""}`} aria-hidden />;
const IconBrush = (p: IP) => <i className={`fa-solid fa-paintbrush ${p.className ?? ""}`} aria-hidden />;
const IconShield = (p: IP) => <i className={`fa-solid fa-shield-halved ${p.className ?? ""}`} aria-hidden />;
const IconMail = (p: IP) => <i className={`fa-solid fa-envelope ${p.className ?? ""}`} aria-hidden />;
const IconSearch = (p: IP) => <i className={`fa-solid fa-magnifying-glass ${p.className ?? ""}`} aria-hidden />;
const IconBack = (p: IP) => <i className={`fa-solid fa-chevron-left ${p.className ?? ""}`} aria-hidden />;
const IconLogo = (p: IP) => <i className={`fa-solid fa-envelope ${p.className ?? ""}`} aria-hidden />;
const IconKey = (p: IP) => <i className={`fa-solid fa-key ${p.className ?? ""}`} aria-hidden />;
const IconLock = (p: IP) => <i className={`fa-solid fa-lock ${p.className ?? ""}`} aria-hidden />;
const IconEye = (p: IP) => <i className={`fa-solid fa-eye ${p.className ?? ""}`} aria-hidden />;

type SectionId = "home" | "account" | "language" | "appearance" | "privacy" | "mail";
type NavItem = { id: SectionId; labelKey: string; icon: (p: IP) => React.ReactNode; group: "groupAccount" | "groupMail" };

const NAV: NavItem[] = [
  { id: "home", labelKey: "settings.home", icon: IconHome, group: "groupAccount" },
  { id: "account", labelKey: "settings.account", icon: IconUser, group: "groupAccount" },
  { id: "language", labelKey: "settings.language", icon: IconLang, group: "groupAccount" },
  { id: "appearance", labelKey: "settings.appearance", icon: IconBrush, group: "groupAccount" },
  { id: "privacy", labelKey: "settings.privacy", icon: IconShield, group: "groupAccount" },
  { id: "mail", labelKey: "settings.messages", icon: IconMail, group: "groupMail" },
];

const FOLDERS = ["inbox", "starred", "archive", "all"] as const;

/* -------------------------------- controls -------------------------------- */
function Card({ title, desc, children }: { title?: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      {title && <h2 className="text-base font-semibold text-slate-900 dark:text-neutral-100">{title}</h2>}
      {desc && <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{desc}</p>}
      <div className={title || desc ? "mt-4" : ""}>{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-neutral-100">{title}</p>
        <p className="text-sm text-slate-500 dark:text-neutral-400">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-slate-300 dark:bg-neutral-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-slate-200 p-0.5 dark:border-neutral-700">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            value === o.value ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AccountRow({ email, initial, t }: { email: string | null; initial: string; t: (k: string) => string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-base font-semibold text-white">
        {initial}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-neutral-100">{email ?? "…"}</p>
        <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("settings.connectedGoogle")}
        </p>
      </div>
      <form action={signOutAction} className="ml-auto">
        <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
          {t("settings.signOut")}
        </button>
      </form>
    </div>
  );
}

function StorageView({ quota, t }: { quota: StorageQuota | null | "loading"; t: (k: string, p?: Record<string, string | number>) => string }) {
  if (quota === "loading")
    return (
      <div className="space-y-2">
        <div className="h-2 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
      </div>
    );
  if (quota === null)
    return (
      <div className="text-sm text-slate-500 dark:text-neutral-400">
        {t("settings.storageUnavailable")}{" "}
        <form action={signOutAction} className="inline">
          <button className="font-semibold text-accent hover:underline">{t("settings.signInAgain")}</button>
        </form>{" "}
        {t("settings.grantDrive")}
      </div>
    );
  if (quota.limit === null)
    return <p className="text-sm text-slate-700 dark:text-neutral-300">{t("settings.usedUnlimited", { used: formatBytes(quota.usage) })}</p>;
  const pct = Math.max(2, Math.min(100, Math.round((quota.usage / quota.limit) * 100)));
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-neutral-800">
        <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-neutral-300">
        {t("settings.usedOf", { used: formatBytes(quota.usage), total: formatBytes(quota.limit) })}
      </p>
    </div>
  );
}

function ProviderIcon({ provider }: { provider: string }) {
  const cls =
    provider === "google"
      ? "fa-brands fa-google"
      : provider === "yahoo"
        ? "fa-brands fa-yahoo"
        : "fa-brands fa-microsoft";
  return <i className={`${cls} h-4 w-4`} aria-hidden />;
}

/**
 * Lists the user's connected mailboxes, lets them connect another (gated by
 * their plan limit) or disconnect a non-primary one. Connect kicks off the
 * OAuth route at /api/mailboxes/[provider]/start; the callback redirects back
 * here with ?connect=ok|limit|error.
 */
function MailboxManager() {
  const params = useSearchParams();
  const connect = params.get("connect");
  const [data, setData] = useState<MailboxOverview | null>(null);
  const [busy, startTransition] = useTransition();

  const load = () => fetchMailboxes().then(setData).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  function remove(id: string) {
    if (!window.confirm("Disconnect this account? Its mail will stop appearing in your timeline.")) return;
    startTransition(async () => {
      try {
        await disconnectMailbox(id);
        await load();
      } catch {
        /* ignore */
      }
    });
  }

  const plan = data?.plan;
  const canConnect = plan?.canConnect ?? false;
  const limitLabel = plan ? (plan.limit === Infinity ? "∞" : plan.limit) : "…";

  return (
    <Card title="Connected accounts" desc="Mail from every connected account is merged into one timeline.">
      {connect === "ok" && (
        <p className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          Account connected.
        </p>
      )}
      {connect === "limit" && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          You&apos;ve reached your plan&apos;s account limit. Upgrade to connect more.
        </p>
      )}
      {connect === "error" && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          Couldn&apos;t connect that account. Please try again.
        </p>
      )}

      <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
        {(data?.mailboxes ?? []).map((m) => (
          <li key={m.id} className="flex items-center gap-3 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
              <ProviderIcon provider={m.provider} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-neutral-100">{m.email}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {m.isPrimary ? "Primary account" : "Connected account"}
              </p>
            </div>
            {m.isPrimary ? (
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">Primary</span>
            ) : (
              <button
                onClick={() => remove(m.id)}
                disabled={busy}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Disconnect
              </button>
            )}
          </li>
        ))}
        {!data && (
          <li className="py-3">
            <div className="h-9 w-48 animate-pulse rounded bg-slate-200 dark:bg-neutral-800" />
          </li>
        )}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canConnect ? (
          <>
            <a
              href="/api/mailboxes/google/start"
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              <i className="fa-brands fa-google" aria-hidden /> Connect Google
            </a>
            <a
              href="/api/mailboxes/microsoft/start"
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <i className="fa-brands fa-microsoft" aria-hidden /> Connect Outlook
            </a>
            <a
              href="/api/mailboxes/yahoo/start"
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <i className="fa-brands fa-yahoo" aria-hidden /> Connect Yahoo
            </a>
          </>
        ) : (
          <a
            href="#billing"
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            <i className="fa-solid fa-arrow-up" aria-hidden /> Upgrade to connect more
          </a>
        )}
      </div>
    </Card>
  );
}

/* ---------------------------------- page ---------------------------------- */
export default function SettingsPage() {
  const { t, locale, setLocale } = useLanguage();
  const { prefs, setPref, reset } = usePrefs();
  const [section, setSection] = useState<SectionId>("home");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [quota, setQuota] = useState<StorageQuota | null | "loading">("loading");
  const [sig, setSig] = useState(prefs.signature);
  const [sigSaved, setSigSaved] = useState(false);

  useEffect(() => {
    currentUserEmail().then(setEmail);
    fetchStorage().then(setQuota).catch(() => setQuota(null));
  }, []);
  useEffect(() => setSig(prefs.signature), [prefs.signature]);

  const initial = email ? email[0]?.toUpperCase() : "?";
  const name = email ? email.split("@")[0] : "";

  const facts: [(p: IP) => React.ReactNode, string, string][] = [
    [IconKey, "settings.factOauth", "settings.factOauthDesc"],
    [IconLock, "settings.factTokens", "settings.factTokensDesc"],
    [IconEye, "settings.factTracker", "settings.factTrackerDesc"],
    [IconShield, "settings.factNoSurv", "settings.factNoSurvDesc"],
  ];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV;
    return NAV.filter((n) => t(n.labelKey).toLowerCase().includes(q));
  }, [query, t]);

  const groups = useMemo(() => {
    const g: Record<string, NavItem[]> = {};
    for (const n of visible) (g[n.group] ??= []).push(n);
    return g;
  }, [visible]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50 text-sm dark:bg-neutral-950">
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex w-[260px] shrink-0 items-center gap-2 px-5 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-neutral-100">
          <IconLogo className="h-6 w-6 text-accent" />
          tarnmail
        </div>
        <div className="flex flex-1 items-center gap-4 px-4">
          <div className="relative max-w-2xl flex-1">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("settings.search")}
              className="w-full rounded-xl border border-slate-200 bg-slate-100/70 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-accent focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>
          <div className="ml-auto hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100">{name || " "}</p>
            <p className="text-xs text-slate-400 dark:text-neutral-500">{email ?? ""}</p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-white">
            {initial}
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="flex w-[260px] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-slate-50/60 px-3 py-4 dark:border-neutral-800 dark:bg-neutral-900/40">
          <Link
            href="/inbox"
            className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/15"
          >
            <IconBack className="h-4 w-4" /> {t("settings.inbox")}
          </Link>

          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-4">
              <p className="px-3 pb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                {t(`settings.${group}`)}
              </p>
              <ul className="space-y-0.5">
                {items.map((n) => {
                  const Icon = n.icon;
                  const on = n.id === section;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => setSection(n.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          on ? "bg-accent/10 font-semibold text-accent" : "text-slate-600 hover:bg-slate-200/50 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        <span className="flex-1 truncate">{t(n.labelKey)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-5 px-6 py-8">
            {section === "home" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">{t("settings.home")}</h1>
                <Card title={t("settings.yourAccount")}>
                  <AccountRow email={email} initial={initial} t={t} />
                </Card>
                <MailboxManager />
                {/* <BillingCard /> paid features disabled */}
                <Card title={t("settings.storage")} desc={t("settings.storageDesc")}>
                  <StorageView quota={quota} t={t} />
                </Card>
                <Card title={t("settings.privacyGlance")}>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {facts.map(([Icon, tk, dk]) => (
                      <li key={tk} className="flex gap-3">
                        <span className="mt-0.5 text-accent"><Icon className="h-5 w-5" /></span>
                        <span>
                          <span className="block text-sm font-medium text-slate-900 dark:text-neutral-100">{t(tk)}</span>
                          <span className="block text-sm text-slate-500 dark:text-neutral-400">{t(dk)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </>
            )}

            {section === "account" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">{t("settings.account")}</h1>
                <Card title={t("settings.security")} desc={t("settings.securityDesc")}>
                  <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                    <Toggle checked={prefs.confirmUnsubscribe} onChange={(v) => setPref("confirmUnsubscribe", v)} title={t("settings.confirmUnsub")} desc={t("settings.confirmUnsubDesc")} />
                    <Toggle checked={prefs.confirmSend} onChange={(v) => setPref("confirmSend", v)} title={t("settings.confirmSend")} desc={t("settings.confirmSendDesc")} />
                    <Toggle checked={prefs.confirmDelete} onChange={(v) => setPref("confirmDelete", v)} title={t("settings.confirmDelete")} desc={t("settings.confirmDeleteDesc")} />
                  </div>
                </Card>
                <Card title={t("settings.permissions")} desc={t("settings.permissionsDesc")}>
                  <form action={signOutAction}>
                    <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                      {t("settings.reconnect")}
                    </button>
                  </form>
                </Card>
                <Card title={t("settings.reset")} desc={t("settings.resetDesc")}>
                  <button
                    onClick={reset}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    {t("settings.resetBtn")}
                  </button>
                </Card>
              </>
            )}

            {section === "language" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">{t("settings.language")}</h1>
                <Card title={t("settings.interfaceLang")} desc={t("settings.interfaceLangDesc")}>
                  <div className="flex flex-wrap gap-2">
                    {locales.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLocale(l)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                          locale === l
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {LOCALE_LABEL[l] ?? l}
                      </button>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {section === "appearance" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">{t("settings.appearance")}</h1>
                <Card title={t("settings.theme")} desc={t("settings.themeDesc")}>
                  <Segmented
                    value={prefs.theme}
                    onChange={(v) => setPref("theme", v)}
                    options={[
                      { value: "light", label: t("settings.themeLight") },
                      { value: "dark", label: t("settings.themeDark") },
                      { value: "system", label: t("settings.themeSystem") },
                    ]}
                  />
                </Card>
                <Card title={t("settings.accentColor")} desc={t("settings.accentColorDesc")}>
                  <div className="flex flex-wrap gap-3">
                    {ACCENTS.map((a) => {
                      const on = prefs.accent === a.accent;
                      return (
                        <button
                          key={a.accent}
                          title={a.name}
                          onClick={() => {
                            setPref("accent", a.accent);
                            setPref("accentDark", a.dark);
                          }}
                          className={`grid h-9 w-9 place-items-center rounded-full ring-2 ring-offset-2 transition-all ${
                            on ? "ring-slate-400" : "ring-transparent"
                          }`}
                          style={{ backgroundColor: a.accent }}
                        >
                          {on && <i className="fa-solid fa-check h-4 w-4 text-white" aria-hidden />}
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card title={t("settings.fontSize")} desc={t("settings.fontSizeDesc")}>
                  <Segmented
                    value={prefs.fontSize}
                    onChange={(v) => setPref("fontSize", v)}
                    options={[
                      { value: "sm", label: t("settings.fontSmall") },
                      { value: "base", label: t("settings.fontDefault") },
                      { value: "lg", label: t("settings.fontLarge") },
                    ]}
                  />
                </Card>

                <Card title={t("settings.density")} desc={t("settings.densityDesc")}>
                  <Segmented
                    value={prefs.density}
                    onChange={(v) => setPref("density", v)}
                    options={[
                      { value: "comfortable", label: t("settings.comfortable") },
                      { value: "compact", label: t("settings.compact") },
                    ]}
                  />
                </Card>

                <Card>
                  <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                    <Toggle checked={prefs.showAvatars} onChange={(v) => setPref("showAvatars", v)} title={t("settings.showAvatars")} desc={t("settings.showAvatarsDesc")} />
                    <Toggle checked={prefs.showFavicons} onChange={(v) => setPref("showFavicons", v)} title={t("settings.showFavicons")} desc={t("settings.showFaviconsDesc")} />
                    <Toggle checked={prefs.showSnippets} onChange={(v) => setPref("showSnippets", v)} title={t("settings.snippets")} desc={t("settings.snippetsDesc")} />
                    <Toggle checked={prefs.unreadBold} onChange={(v) => setPref("unreadBold", v)} title={t("settings.unreadBold")} desc={t("settings.unreadBoldDesc")} />
                    <Toggle checked={prefs.clock12h} onChange={(v) => setPref("clock12h", v)} title={t("settings.clock12h")} desc={t("settings.clock12hDesc")} />
                    <Toggle checked={prefs.showFolderCounts} onChange={(v) => setPref("showFolderCounts", v)} title={t("settings.showFolderCounts")} desc={t("settings.showFolderCountsDesc")} />
                    <Toggle checked={prefs.splitView} onChange={(v) => setPref("splitView", v)} title={t("settings.splitView")} desc={t("settings.splitViewDesc")} />
                  </div>
                </Card>
              </>
            )}

            {section === "privacy" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">{t("settings.privacy")}</h1>
                <Card title={t("settings.privacyTracking")} desc={t("settings.privacyTrackingDesc")}>
                  <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                    <Toggle checked={prefs.blockRemoteImages} onChange={(v) => setPref("blockRemoteImages", v)} title={t("settings.blockImages")} desc={t("settings.blockImagesDesc")} />
                    <Toggle checked={prefs.stripTrackingParams} onChange={(v) => setPref("stripTrackingParams", v)} title={t("settings.stripTracking")} desc={t("settings.stripTrackingDesc")} />
                    <Toggle checked={prefs.hideSenderEmail} onChange={(v) => setPref("hideSenderEmail", v)} title={t("settings.hideSenderEmail")} desc={t("settings.hideSenderEmailDesc")} />
                    <Toggle checked={prefs.markReadOnOpen} onChange={(v) => setPref("markReadOnOpen", v)} title={t("settings.markRead")} desc={t("settings.markReadDesc")} />
                  </div>
                </Card>
                <Card title={t("settings.security")} desc={t("settings.securityDesc")}>
                  <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                    <Toggle checked={prefs.openLinksNewTab} onChange={(v) => setPref("openLinksNewTab", v)} title={t("settings.openLinksNewTab")} desc={t("settings.openLinksNewTabDesc")} />
                    <Toggle checked={prefs.warnExternalLinks} onChange={(v) => setPref("warnExternalLinks", v)} title={t("settings.warnLinks")} desc={t("settings.warnLinksDesc")} />
                    <Toggle checked={prefs.confirmUnsubscribe} onChange={(v) => setPref("confirmUnsubscribe", v)} title={t("settings.confirmUnsub")} desc={t("settings.confirmUnsubDesc")} />
                    <Toggle checked={prefs.confirmSend} onChange={(v) => setPref("confirmSend", v)} title={t("settings.confirmSend")} desc={t("settings.confirmSendDesc")} />
                    <Toggle checked={prefs.confirmDelete} onChange={(v) => setPref("confirmDelete", v)} title={t("settings.confirmDelete")} desc={t("settings.confirmDeleteDesc")} />
                  </div>
                </Card>
                <Card title={t("settings.howProtect")}>
                  <ul className="space-y-4">
                    {facts.map(([Icon, tk, dk]) => (
                      <li key={tk} className="flex gap-3">
                        <span className="mt-0.5 text-accent"><Icon className="h-5 w-5" /></span>
                        <span>
                          <span className="block text-sm font-medium text-slate-900 dark:text-neutral-100">{t(tk)}</span>
                          <span className="block text-sm text-slate-500 dark:text-neutral-400">{t(dk)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </>
            )}

            {section === "mail" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">{t("settings.messages")}</h1>
                <Card title={t("settings.perPage")} desc={t("settings.perPageDesc")}>
                  <Segmented
                    value={prefs.messagesPerPage}
                    onChange={(v) => setPref("messagesPerPage", v)}
                    options={[
                      { value: 25, label: "25" },
                      { value: 50, label: "50" },
                      { value: 100, label: "100" },
                    ]}
                  />
                </Card>

                <Card title={t("settings.defaultFolder")} desc={t("settings.defaultFolderDesc")}>
                  <Segmented
                    value={prefs.defaultFolder}
                    onChange={(v) => setPref("defaultFolder", v)}
                    options={FOLDERS.map((f) => ({
                      value: f,
                      label: t(
                        f === "inbox" ? "heroVisual.inbox" : f === "starred" ? "heroVisual.starred" : f === "archive" ? "heroVisual.archive" : "heroVisual.allMail",
                      ),
                    }))}
                  />
                </Card>

                <Card title={t("settings.signature")} desc={t("settings.signatureDesc")}>
                  <textarea
                    value={sig}
                    onChange={(e) => {
                      setSig(e.target.value);
                      setSigSaved(false);
                    }}
                    rows={4}
                    placeholder={t("settings.signaturePlaceholder")}
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-accent dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => {
                        setPref("signature", sig);
                        setSigSaved(true);
                      }}
                      className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
                    >
                      {t("settings.save")}
                    </button>
                    {sigSaved && <span className="text-sm text-emerald-600">{t("settings.saved")}</span>}
                  </div>
                </Card>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
