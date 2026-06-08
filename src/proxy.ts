import { NextResponse, type NextRequest } from "next/server";

// Next 16 `proxy` convention (formerly `middleware`).
// Handles:
// 1. Subdomain routing: admin.tarnmail.xyz → /admin/*
// 2. Auth gate: protected routes require a session cookie
//
// Two distinct admin surfaces:
//   /admin    — global SITE admin (operators). Cookie-gated here; the real
//               allowlist check (ADMIN_EMAILS) lives in app/admin/layout.tsx.
//   /business — per-owner BUSINESS workspace, scoped by ownerId. Not an admin
//               surface over other users.

const PROTECTED = [/^\/inbox/, /^\/admin/, /^\/business/];

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function getSubdomain(hostname: string): string | null {
  // Extract subdomain from hostname (e.g., "admin.tarnmail.xyz" → "admin")
  const parts = hostname.split(".");
  if (parts.length <= 2) return null;
  return parts[0];
}

export function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  const subdomain = getSubdomain(hostname);

  // Subdomain routing: admin.tarnmail.xyz → /admin/*
  if (subdomain === "admin") {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/" || pathname === "" ? "/admin/users" : `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Auth gate for protected routes
  const isProtected = PROTECTED.some((re) => re.test(pathname));
  if (!isProtected) return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((c) => request.cookies.has(c));
  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
