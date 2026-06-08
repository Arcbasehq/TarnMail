"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { usePrefs } from "@/lib/prefs/PreferencesProvider";

const URL_RE = /(https?:\/\/[^\s<]+)/g;

// Query params commonly used to track opens / clicks across the web.
const TRACKING_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id",
  "gclid", "gclsrc", "dclid", "fbclid", "msclkid", "yclid", "twclid",
  "mc_eid", "mc_cid", "_hsenc", "_hsmi", "hsCtaTracking", "vero_id", "vero_conv",
  "igshid", "oly_anon_id", "oly_enc_id", "ml_subscriber", "ml_subscriber_hash",
  "ck_subscriber_id", "_ga", "wickedid", "s_cid",
];

// Remove tracking query params from a URL, leaving the destination intact.
function stripTracking(url: string): string {
  try {
    const u = new URL(url);
    for (const p of TRACKING_PARAMS) u.searchParams.delete(p);
    return u.toString();
  } catch {
    return url;
  }
}

// Apply tracking-param stripping to every href in an HTML string.
function stripTrackingHtml(html: string): string {
  return html.replace(/(\shref\s*=\s*)(["'])(https?:\/\/[^"']*)\2/gi, (_m, pre, q, url) => {
    return `${pre}${q}${stripTracking(url).replace(/"/g, "&quot;")}${q}`;
  });
}

function linkify(
  text: string,
  opts: { strip: boolean; newTab: boolean; warn: boolean },
): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const raw = m[0];
    const href = opts.strip ? stripTracking(raw) : raw;
    out.push(
      <a
        key={m.index}
        href={href}
        target={opts.newTab ? "_blank" : undefined}
        rel="noopener noreferrer"
        onClick={(e) => {
          if (opts.warn && !window.confirm(`Open external link?\n\n${href}`)) e.preventDefault();
        }}
        className="break-all text-accent hover:underline"
      >
        {raw.length > 60 ? raw.slice(0, 60) + "…" : raw}
      </a>,
    );
    last = m.index + raw.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Neutralize remote images so trackers don't fire until the user opts in.
function blockRemoteImages(html: string): { html: string; blocked: number } {
  let blocked = 0;
  const out = html
    .replace(/(<img\b[^>]*?)\ssrc\s*=\s*(["'])(https?:\/\/[^"']*)\2/gi, (_m, pre, _q, url) => {
      blocked++;
      return `${pre} data-src="${url}"`;
    })
    .replace(/(<img\b[^>]*?)\ssrcset\s*=\s*(["'])[^"']*\2/gi, "$1");
  return { html: out, blocked };
}

export function EmailBody({ html, text }: { html: string; text: string }) {
  const { prefs } = usePrefs();
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(120);
  const [showImages, setShowImages] = useState(!prefs.blockRemoteImages);

  const processed = useMemo(
    () => (prefs.blockRemoteImages ? blockRemoteImages(html) : { html, blocked: 0 }),
    [html, prefs.blockRemoteImages],
  );

  const linkOpts = {
    strip: prefs.stripTrackingParams,
    newTab: prefs.openLinksNewTab,
    warn: prefs.warnExternalLinks,
  };

  if (!html) {
    return (
      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
        {linkify(text, linkOpts)}
      </div>
    );
  }

  let bodyHtml = showImages ? html : processed.html;
  if (prefs.stripTrackingParams) bodyHtml = stripTrackingHtml(bodyHtml);

  // Sandboxed: no allow-scripts -> email JS cannot run. allow-same-origin lets
  // us measure content height; allow-popups lets links open in a new tab.
  const srcDoc = `<!doctype html><html><head>${prefs.openLinksNewTab ? '<base target="_blank">' : ""}<meta name="viewport" content="width=device-width,initial-scale=1"><style>
    html,body{margin:0;padding:0;}
    body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.5;color:#334155;word-break:break-word;-webkit-text-size-adjust:100%;}
    img{max-width:100%;height:auto;}
    a{color:#1a73e8;}
    table{max-width:100%!important;}
    blockquote{margin:0 0 0 .8em;padding-left:.8em;border-left:2px solid #e2e8f0;color:#64748b;}
  </style></head><body>${bodyHtml}</body></html>`;

  return (
    <div>
      {!showImages && processed.blocked > 0 && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300">
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-circle-info h-4 w-4 text-slate-400 dark:text-neutral-500" aria-hidden />
            Tracker protection blocked {processed.blocked} image
            {processed.blocked > 1 ? "s" : ""}. Load them if you trust the sender.
          </span>
          <button
            onClick={() => setShowImages(true)}
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-white dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            Load
          </button>
        </div>
      )}

      <iframe
        ref={ref}
        title="Email content"
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        srcDoc={srcDoc}
        onLoad={() => {
          const doc = ref.current?.contentDocument;
          if (doc?.body) setHeight(doc.body.scrollHeight + 8);
        }}
        style={{ height }}
        className="w-full border-0"
      />
    </div>
  );
}
