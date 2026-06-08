# tarnmail

A privacy-first **unified email client**. Connect Gmail, Outlook, and Yahoo
mailboxes and read them in one timeline — without handing your mail to a third
party. OAuth tokens are encrypted at rest, remote images and trackers are
blocked by default, and your settings follow you across devices.

> **Note on the framework:** this app targets **Next.js 16** (App Router,
> Turbopack, the `proxy` convention that replaced `middleware`). APIs differ
> from older Next.js — consult `node_modules/next/dist/docs/` before changing
> framework-level code. See `AGENTS.md`.

## Tech stack

| Concern         | Choice                                                                       |
| --------------- | ---------------------------------------------------------------------------- |
| Framework       | Next.js 16 · React 19 · TypeScript                                           |
| Styling         | Tailwind CSS v4                                                              |
| Auth            | Auth.js (NextAuth v5) + Prisma adapter                                       |
| Database        | Prisma 6 → PostgreSQL (Supabase: pooled `DATABASE_URL`, direct `DIRECT_URL`) |
| Mail providers  | Google (Gmail), Microsoft Graph (Outlook), Yahoo                             |
| Billing         | RevenueCat (`FREE` · `DEEP` · `FATHOM` · `BUSINESS` plans)                   |
| Bot defense     | ALTCHA proof-of-work                                                         |
| Monitoring      | Sentry                                                                       |
| Marketing video | Remotion                                                                     |
| i18n            | i18next (English, French)                                                    |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npx prisma migrate dev       # apply the schema to your database
npm run dev                  # http://localhost:3000
```

> Prisma reads `.env`, **not** `.env.local`. Either keep `DATABASE_URL` /
> `DIRECT_URL` in `.env`, or preload before Prisma CLI commands:
> `set -a; . ./.env.local; set +a; npx prisma migrate dev`

### Scripts

| Script                    | Purpose                           |
| ------------------------- | --------------------------------- |
| `npm run dev`             | Dev server (Turbopack)            |
| `npm run build`           | Production build                  |
| `npm run start`           | Serve the production build        |
| `npm run lint`            | ESLint                            |
| `npm run remotion`        | Remotion Studio (marketing video) |
| `npm run remotion:render` | Render the hero preview           |

## Project layout

```
src/
  app/
    (marketing)/   Public site (pricing, features, blog, legal, …)
    (app)/         Authenticated app: inbox, settings, business workspace
    admin/         Global site-admin dashboard (operators only)
    api/           Auth, mailbox OAuth connect, RevenueCat webhook, ALTCHA
  lib/
    auth/          Session helpers, encrypted token store, admin allowlist
    google/ microsoft/ yahoo/   Per-provider mail clients
    mail/          Provider-agnostic dispatcher
    crypto.ts      Token encryption (TOKEN_ENC_KEY)
  proxy.ts         Subdomain routing + auth gate (Next 16 proxy)
prisma/            Schema + migrations
```

### Two admin surfaces (don't confuse them)

- **`/business`** — a _customer_ dashboard for `BUSINESS`-plan owners. Scoped to
  the owner's own workspace: invite employees, manage roles, see each employee's
  connected mailboxes. Never spans other customers.
- **`admin.tarnmail.xyz` → `/admin`** — the _operator_ dashboard. Gated by the
  `ADMIN_EMAILS` allowlist (not by plan). Non-admins get a 404.

## Deploying

Built for Vercel. Before promoting to production: set every env var above
(including `ADMIN_EMAILS` and `COOKIE_DOMAIN`), apply Prisma migrations against
the production database, and point `admin.tarnmail.xyz` DNS at the app.

## Conduct

Participation in this project is governed by our
[Code of Conduct](./CODE_OF_CONDUCT.md).
