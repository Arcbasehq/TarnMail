import type { Provider } from "@/lib/auth/tokens";

// Provider-agnostic OAuth helpers shared by the mailbox-connect route handlers
// (src/app/api/mailboxes/[provider]/...) and the per-mailbox token refresh in
// src/lib/google/gmail.ts. The Auth.js login flow (src/auth.ts) handles the
// *first* mailbox; this handles every additional one without touching the login
// session.

const MS_TENANT = process.env.MICROSOFT_TENANT_ID ?? "common";

type ProviderConfig = {
  authUrl: string;
  tokenUrl: string;
  scope: string;
  /** Extra params on the consent URL (e.g. Google offline access). */
  authParams: Record<string, string>;
  clientId: () => string;
  clientSecret: () => string;
};

const PROVIDERS: Record<Provider, ProviderConfig> = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope:
      "openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/drive.metadata.readonly",
    // offline + forced consent so Google returns a refresh_token every time.
    authParams: { access_type: "offline", prompt: "consent" },
    clientId: () => process.env.GOOGLE_CLIENT_ID!,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET!,
  },
  "microsoft-entra-id": {
    authUrl: `https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/token`,
    scope:
      "openid email profile offline_access Mail.ReadWrite Mail.Send Files.Read",
    authParams: { prompt: "select_account" },
    clientId: () => process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: () => process.env.MICROSOFT_CLIENT_SECRET!,
  },
  yahoo: {
    authUrl: "https://api.login.yahoo.com/oauth2/request_auth",
    tokenUrl: "https://api.login.yahoo.com/oauth2/get_token",
    scope: "openid email profile mail-r mail-w",
    authParams: { prompt: "consent" },
    clientId: () => process.env.YAHOO_CLIENT_ID!,
    clientSecret: () => process.env.YAHOO_CLIENT_SECRET!,
  },
};

/** Maps a URL path segment to a stored provider key. */
export function providerFromSlug(slug: string): Provider | null {
  if (slug === "google") return "google";
  if (slug === "microsoft" || slug === "microsoft-entra-id")
    return "microsoft-entra-id";
  if (slug === "yahoo") return "yahoo";
  return null;
}

export type TokenSet = {
  access_token: string;
  refresh_token?: string;
  /** Unix seconds. */
  expires_at: number;
  scope?: string;
};

/** Builds the provider consent URL for connecting an additional mailbox. */
export function buildAuthUrl(
  provider: Provider,
  opts: { redirectUri: string; state: string },
): string {
  const cfg = PROVIDERS[provider];
  const qs = new URLSearchParams({
    client_id: cfg.clientId(),
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: cfg.scope,
    state: opts.state,
    ...cfg.authParams,
  });
  return `${cfg.authUrl}?${qs.toString()}`;
}

function expiresAtFrom(expiresIn: number | undefined): number {
  return Math.floor(Date.now() / 1000) + (expiresIn ?? 3600);
}

/** Exchanges an authorization code for tokens. */
export async function exchangeCode(
  provider: Provider,
  opts: { code: string; redirectUri: string },
): Promise<TokenSet> {
  const cfg = PROVIDERS[provider];
  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId(),
      client_secret: cfg.clientSecret(),
      grant_type: "authorization_code",
      code: opts.code,
      redirect_uri: opts.redirectUri,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: expiresAtFrom(data.expires_in),
    scope: data.scope,
  };
}

/** Refreshes an access token from a stored refresh_token. */
export async function refreshAccessToken(
  provider: string,
  refreshToken: string,
): Promise<TokenSet> {
  const cfg = PROVIDERS[provider as Provider];
  if (!cfg) throw new Error(`Unsupported provider: ${provider}`);
  const body: Record<string, string> = {
    client_id: cfg.clientId(),
    client_secret: cfg.clientSecret(),
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };
  // Microsoft requires the scope on refresh.
  if (provider === "microsoft-entra-id") body.scope = cfg.scope;

  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: expiresAtFrom(data.expires_in),
    scope: data.scope,
  };
}

/** Resolves the provider account id + email for a freshly granted token. */
export async function fetchUserInfo(
  provider: Provider,
  accessToken: string,
): Promise<{ providerAccountId: string; email: string }> {
  if (provider === "google") {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`userinfo failed: ${res.status}`);
    const u = (await res.json()) as { sub: string; email: string };
    return { providerAccountId: u.sub, email: u.email };
  }
  if (provider === "microsoft-entra-id") {
    const res = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`graph /me failed: ${res.status}`);
    const u = (await res.json()) as {
      id: string;
      mail?: string;
      userPrincipalName?: string;
    };
    return {
      providerAccountId: u.id,
      email: u.mail ?? u.userPrincipalName ?? "",
    };
  }
  // Yahoo
  const res = await fetch("https://api.login.yahoo.com/openid/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`yahoo userinfo failed: ${res.status}`);
  const u = (await res.json()) as { sub: string; email: string };
  return { providerAccountId: u.sub, email: u.email };
}
