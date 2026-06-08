"use client";

import Link from "next/link";

const IconDot = ({ className }: { className?: string }) => <i className={`fa-solid fa-circle ${className ?? ""}`} aria-hidden />;
const IconGmail = ({ className }: { className?: string }) => <i className={`fa-brands fa-google ${className ?? ""}`} aria-hidden />;

export function InboxFooter() {
  return (
    <footer className="flex h-9 shrink-0 items-center gap-4 border-t border-slate-200 bg-slate-50/60 px-5 text-[11px] text-slate-500">
      <span className="flex items-center gap-1.5">
        <IconDot className="h-2 w-2 text-emerald-500" />
        Connected
      </span>
      <span className="flex items-center gap-1.5">
        <i className="fa-solid fa-envelope h-3.5 w-3.5 text-slate-400" aria-hidden />
        Mail
      </span>

      <nav className="ml-auto flex items-center gap-4">
        <Link href="/support" className="transition-colors hover:text-slate-900">
          Support
        </Link>
        <Link href="/privacy" className="transition-colors hover:text-slate-900">
          Privacy
        </Link>
        <Link href="/terms" className="transition-colors hover:text-slate-900">
          Terms
        </Link>
        <span className="text-slate-400">tarnmail v1.0</span>
      </nav>
    </footer>
  );
}
