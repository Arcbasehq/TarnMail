# Auth migration — Supabase Auth → Auth.js (NextAuth v5)

## What changed

| Before (Supabase Auth)                | After (Auth.js v5 + Prisma)                  |
| ------------------------------------- | -------------------------------------------- |
| `supabase.auth.signInWithOAuth()`     | `signIn("google" \| "microsoft-entra-id")`   |
| `supabase.auth.getUser()`             | `auth()`                                      |
| `@supabase/ssr` cookie session        | Database session (`Session` table)            |
| provider tokens in `connected_accounts` | `Account` table (`access_token`/`refresh_token`) |
| `src/lib/supabase/*`, `src/app/auth/*`  | `src/auth.ts`, `src/app/api/auth/[...nextauth]` |
| `middleware` calling `updateSession`  | `proxy` optimistic cookie gate + `auth()` in page |

Deleted: `src/lib/supabase/`, `src/lib/auth/providers.ts`, `src/lib/auth/store-tokens.ts`,
`src/app/auth/` (actions + callback), `supabase/migrations/0002_connected_accounts.sql`.

## Database is the source of truth

Auth.js Prisma adapter owns `User`, `Account`, `Session`, `VerificationToken`.
The `Account` row stores `access_token` + `refresh_token` per provider — read it
via `getProviderAccount(userId, provider)` in `src/lib/auth/tokens.ts` for the
future Gmail / Microsoft Graph calls. `offline_access` (Google `access_type=offline`
+ `prompt=consent`, Microsoft `offline_access` scope) guarantees a refresh_token.

## Preserving existing Supabase users (map by email)

1. Run the Auth.js migration so the new tables exist:
   ```bash
   npx prisma migrate deploy        # or: npx prisma db push
   ```
2. Backfill identities from the old Supabase `auth.users` into the new `User`
   table, matching on email:
   ```sql
   insert into "User" (id, email, "emailVerified", "createdAt")
   select gen_random_uuid()::text, u.email, u.email_confirmed_at, u.created_at
   from auth.users u
   where u.email is not null
   on conflict (email) do nothing;
   ```
3. `allowDangerousEmailAccountLinking: true` (set on both providers) links the
   first OAuth sign-in to the pre-seeded `User` row with the same email — so the
   user keeps their identity and any rows referencing their id. No data loss.

> Safe here because Google/Microsoft return verified emails. Do not enable email
> linking for unverified providers.

## Setup

```bash
npx auth secret                 # writes AUTH_SECRET
npx prisma generate
npx prisma migrate dev -n init  # creates the Auth.js tables
```

Redirect URIs to register:
- Google:    `http://localhost:3000/api/auth/callback/google`
- Microsoft: `http://localhost:3000/api/auth/callback/microsoft-entra-id`

## Protected routes

- `proxy.ts` redirects unauthenticated requests to `/inbox` and `/admin/*` → `/login`.
- The page/layout then calls `auth()` and redirects if no session (authoritative).
  See `src/app/(app)/layout.tsx` and `src/app/admin/users/page.tsx`.
