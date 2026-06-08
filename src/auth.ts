import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { Adapter, AdapterAccount } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import { upsertPrimaryMailbox } from "@/lib/auth/tokens";
import { encrypt } from "@/lib/crypto";
import type { OAuthConfig } from "next-auth/providers";

// Wrap the Prisma adapter so OAuth tokens are encrypted at rest on the Account
// table too (the ConnectedMailbox copy is encrypted separately). Mail access
// reads from ConnectedMailbox, so these stay write-mostly.
function YahooProvider(): OAuthConfig<unknown> {
  return {
    id: "yahoo",
    name: "Yahoo",
    type: "oauth",
    // Yahoo's authorization endpoint rejects PKCE (code_challenge) for web
    // apps — the default ["pkce","state"] makes Yahoo show its generic error
    // page. Use state-only for CSRF protection.
    checks: ["state"],
    // Yahoo does not publish a standard OIDC discovery document,
    // so we define every endpoint explicitly.
    authorization: {
      url: "https://api.login.yahoo.com/oauth2/request_auth",
      params: {
        scope: "openid email profile mail-r mail-w",
      },
    },
    token: {
      url: "https://api.login.yahoo.com/oauth2/get_token",
      async request(context: { params: Record<string, string>; provider: unknown }) {
        const res = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.YAHOO_CLIENT_ID!,
            client_secret: process.env.YAHOO_CLIENT_SECRET!,
            redirect_uri: context.params.redirect_uri,
            grant_type: "authorization_code",
            code: context.params.code,
          }),
        });
        const tokens = await res.json();
        return { tokens };
      },
    },
    userinfo: {
      url: "https://api.login.yahoo.com/openid/v1/userinfo",
      async request(context: { tokens: { access_token: string }; provider: unknown }) {
        const res = await fetch("https://api.login.yahoo.com/openid/v1/userinfo", {
          headers: { Authorization: `Bearer ${context.tokens.access_token}` },
        });
        return await res.json();
      },
    },
    profile(profile) {
      const p = profile as { sub: string; email: string; name?: string | null };
      return {
        id: p.sub,
        email: p.email,
        name: p.name ?? p.email,
        image: null,
      };
    },
    clientId: process.env.YAHOO_CLIENT_ID,
    clientSecret: process.env.YAHOO_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  };
}

function encryptingAdapter(): Adapter {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
    linkAccount: (account: AdapterAccount) =>
      base.linkAccount!({
        ...account,
        access_token: encrypt(account.access_token) ?? undefined,
        refresh_token: encrypt(account.refresh_token) ?? undefined,
        id_token: encrypt(account.id_token) ?? undefined,
      }),
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: encryptingAdapter(),
  // Database-backed sessions (not JWT-only). Session row lives in Postgres.
  session: { strategy: "database" },
  trustHost: true,
  pages: { signIn: "/login" },
  // Share session cookie across subdomains (admin.tarnmail.xyz, tarnmail.xyz).
  // Only set domain in production — localhost rejects custom domain cookies.
  cookies: process.env.COOKIE_DOMAIN
    ? {
        sessionToken: {
          options: {
            domain: process.env.COOKIE_DOMAIN,
          },
        },
      }
    : undefined,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // offline access + forced consent => Google returns a refresh_token,
      // which the Prisma adapter stores on the Account row.
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/drive.metadata.readonly",
        },
      },
      // Link to an existing user with the same email (Supabase migration).
      allowDangerousEmailAccountLinking: true,
    }),

    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${
        process.env.MICROSOFT_TENANT_ID ?? "common"
      }/v2.0`,
      authorization: {
        params: {
          scope:
            "openid email profile offline_access Mail.ReadWrite Mail.Send Files.Read",
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),

    YahooProvider(),
  ],

  callbacks: {
    // With the database strategy, `session.user.id` isn't set by default.
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },

  events: {
    // Mirror the login account into a primary ConnectedMailbox so the unified
    // timeline (src/lib/auth/tokens.ts) treats it like any other mailbox.
    async linkAccount({ user, account }) {
      if (!user.id) return;
      await upsertPrimaryMailbox(user.id, user.email ?? "", {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        scope: account.scope,
      });
    },
    // linkAccount only fires the first time an account is linked. This refreshes
    // the primary mailbox's tokens + granted scopes on every sign-in, so
    // re-consenting (e.g. to grant Drive for storage) actually takes effect.
    async signIn({ user, account }) {
      if (!user.id || !account?.access_token) return;
      await upsertPrimaryMailbox(user.id, user.email ?? "", {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        scope: account.scope,
      });
    },
  },
});
