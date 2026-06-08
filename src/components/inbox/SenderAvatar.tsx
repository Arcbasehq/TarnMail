"use client";

import { useState } from "react";
import { initials, colorFor, domainOf, faviconUrl } from "@/lib/avatar";

/**
 * Sender avatar. When `showFavicons` is on and the sender has a real domain,
 * shows that site's actual icon (Google favicon service), falling back to the
 * colored initials badge if the domain is missing or the icon fails to load.
 */
export function SenderAvatar({
  from,
  sender,
  showFavicons,
  className = "h-9 w-9",
}: {
  from: string;
  sender: string;
  showFavicons: boolean;
  className?: string;
}) {
  const domain = showFavicons ? domainOf(from) : null;
  const [failed, setFailed] = useState(false);

  if (domain && !failed) {
    return (
      <span
        className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200 dark:bg-neutral-800 dark:ring-neutral-700 ${className}`}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl(domain)}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full text-xs font-semibold ${colorFor(sender)} ${className}`}
      aria-hidden
    >
      {initials(sender)}
    </span>
  );
}
