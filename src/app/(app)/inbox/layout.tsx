"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Compose } from "@/components/inbox/Compose";
import { InboxHeader } from "@/components/inbox/InboxHeader";
import { StorageBar } from "@/components/inbox/StorageBar";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { SplitViewProvider } from "@/components/inbox/SplitViewProvider";
import { ThreadPanel } from "@/components/inbox/ThreadPanel";
import { fetchFolderCounts, type FolderCount } from "@/app/(app)/inbox/actions";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePrefs } from "@/lib/prefs/PreferencesProvider";
import type { Folder } from "@/lib/google/gmail";

type FolderItem = {
  folder: Folder;
  key: string;
  icon: (p: { className?: string }) => React.ReactNode;
};

const IconInbox = ({ className }: { className?: string }) => <i className={`fa-solid fa-inbox ${className ?? ""}`} aria-hidden />;
const IconDraft = ({ className }: { className?: string }) => <i className={`fa-solid fa-file-pen ${className ?? ""}`} aria-hidden />;
const IconSent = ({ className }: { className?: string }) => <i className={`fa-solid fa-paper-plane ${className ?? ""}`} aria-hidden />;
const IconStar = ({ className }: { className?: string }) => <i className={`fa-solid fa-star ${className ?? ""}`} aria-hidden />;
const IconArchive = ({ className }: { className?: string }) => <i className={`fa-solid fa-box-archive ${className ?? ""}`} aria-hidden />;
const IconSpam = ({ className }: { className?: string }) => <i className={`fa-solid fa-circle-exclamation ${className ?? ""}`} aria-hidden />;
const IconTrash = ({ className }: { className?: string }) => <i className={`fa-solid fa-trash ${className ?? ""}`} aria-hidden />;
const IconAll = ({ className }: { className?: string }) => <i className={`fa-solid fa-envelopes-bulk ${className ?? ""}`} aria-hidden />;
const IconChevron = ({ className }: { className?: string }) => <i className={`fa-solid fa-chevron-down ${className ?? ""}`} aria-hidden />;

const primary: FolderItem[] = [
  { folder: "inbox", key: "heroVisual.inbox", icon: IconInbox },
  { folder: "drafts", key: "heroVisual.drafts", icon: IconDraft },
  { folder: "sent", key: "heroVisual.sent", icon: IconSent },
  { folder: "starred", key: "heroVisual.starred", icon: IconStar },
];
const secondary: FolderItem[] = [
  { folder: "archive", key: "heroVisual.archive", icon: IconArchive },
  { folder: "spam", key: "heroVisual.spam", icon: IconSpam },
  { folder: "trash", key: "heroVisual.trash", icon: IconTrash },
  { folder: "all", key: "heroVisual.allMail", icon: IconAll },
];

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const { prefs } = usePrefs();
  const params = useSearchParams();
  const active = (params.get("folder") as Folder | null) ?? "inbox";
  const [showMore, setShowMore] = useState(true);
  const [counts, setCounts] = useState<FolderCount | null>(null);

  useEffect(() => {
    if (!prefs.showFolderCounts) return;
    fetchFolderCounts()
      .then(setCounts)
      .catch(() => {});
  }, [prefs.showFolderCounts]);

  const renderFolder = (f: FolderItem) => {
    const Icon = f.icon;
    const on = f.folder === active;
    const count = prefs.showFolderCounts && counts ? counts[f.folder] : undefined;
    return (
      <li key={f.folder}>
        <Link
          href={f.folder === "inbox" ? "/inbox" : `/inbox?folder=${f.folder}`}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            on
              ? "bg-accent/10 font-semibold text-accent"
              : "text-slate-600 hover:bg-slate-200/50 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
          }`}
        >
          <Icon className="h-4.5 w-4.5 shrink-0" />
          <span className="flex-1 truncate">{t(f.key)}</span>
          {count !== undefined && count > 0 && (
            <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-neutral-700 dark:text-neutral-300">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <SplitViewProvider>
      <div className="flex h-full flex-col overflow-hidden bg-white text-sm dark:bg-neutral-950">
        <InboxHeader />

        <div className="flex min-h-0 flex-1">
          {/* Rail */}
          <aside className="flex w-[260px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/60 px-3 py-4 dark:border-neutral-800 dark:bg-neutral-900/40">
            <div className="mb-4 px-1" data-onboarding="compose">
              <Compose
                renderTrigger={(open) => (
                  <button
                    onClick={open}
                    className="w-full rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark"
                  >
                    {t("inbox.new")}
                  </button>
                )}
              />
            </div>

            <ul className="space-y-0.5" data-onboarding="folders">{primary.map(renderFolder)}</ul>

            <button
              onClick={() => setShowMore((v) => !v)}
              className="my-3 flex w-full items-center gap-2 px-3 text-xs font-medium uppercase tracking-wide text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-neutral-300"
            >
              <IconChevron className={`h-3.5 w-3.5 transition-transform ${showMore ? "" : "-rotate-90"}`} />
              {t("inbox.more")}
              <span className="h-px flex-1 bg-slate-200 dark:bg-neutral-800" />
            </button>

            {showMore && <ul className="space-y-0.5">{secondary.map(renderFolder)}</ul>}

            {/* Storage (real Drive quota) */}
            <StorageBar />
          </aside>

          {/* Content */}
          <section className="min-h-0 flex-1 overflow-hidden bg-white dark:bg-neutral-950">
            <div className={`flex h-full ${prefs.splitView ? "divide-x divide-slate-200 dark:divide-neutral-800" : ""}`}>
              <div className={`min-h-0 flex-1 ${prefs.splitView ? "w-1/2" : ""}`}>{children}</div>
              {prefs.splitView && <ThreadPanel />}
            </div>
          </section>
        </div>

        <OnboardingTour />
      </div>
    </SplitViewProvider>
  );
}
