// Shared helpers for rendering sender avatars / display names.

// "Dana Whitlock <dana@x.com>" -> "Dana Whitlock"; bare email -> local part
export function displayName(raw: string): string {
  const m = raw.match(/^\s*"?([^"<]+?)"?\s*<.+>\s*$/);
  if (m) return m[1].trim();
  const at = raw.indexOf("@");
  return at > 0 ? raw.slice(0, at) : raw || "Unknown";
}

// "Dana Whitlock <dana@x.com>" -> "x.com"; bare email -> domain part
export function domainOf(raw: string): string | null {
  const m = raw.match(/<([^>]+)>/);
  const addr = (m ? m[1] : raw).trim();
  const at = addr.lastIndexOf("@");
  if (at < 0) return null;
  const domain = addr.slice(at + 1).trim().toLowerCase();
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) ? domain : null;
}

// Sender's real site icon via Google's public favicon service.
export function faviconUrl(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
];

export function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
