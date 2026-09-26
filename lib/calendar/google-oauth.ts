import { createHash, randomBytes } from "node:crypto";

import { GOOGLE_CALENDAR_FREEBUSY_SCOPE } from "@/lib/calendar/google";

const GOOGLE_AUTHORIZATION_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOCATION_ENDPOINT = "https://oauth2.googleapis.com/revoke";

export const GOOGLE_OAUTH_FLOW_TTL_SECONDS = 10 * 60;

type Environment = Readonly<Record<string, string | undefined>>;
type FetchLike = typeof fetch;

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sessionSecret: string;
};

export type GoogleOAuthConfiguration =
  | { configured: true; value: GoogleOAuthConfig }
  | { configured: false; reason: "missing" | "invalid" };

export type GoogleOAuthTokens = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  scope: string;
};

type GoogleTokenPayload = {
  access_token?: unknown;
  expires_in?: unknown;
  refresh_token?: unknown;
  scope?: unknown;
};

export class GoogleOAuthError extends Error {
  constructor(
    readonly code:
      | "configuration-required"
      | "invalid-flow"
      | "authentication-failed"
      | "provider-unavailable",
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "GoogleOAuthError";
  }
}

function isValidRedirectUri(value: string): boolean {
  try {
    const url = new URL(value);
    const secureScheme =
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        (url.hostname === "localhost" || url.hostname === "127.0.0.1"));
    return (
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname === "/api/calendar/google/callback" &&
      secureScheme
    );
  } catch {
    return false;
  }
}

export function getGoogleOAuthConfiguration(
  environment: Environment = process.env,
): GoogleOAuthConfiguration {
  const clientId = environment.GOOGLE_CALENDAR_CLIENT_ID?.trim();
  const clientSecret = environment.GOOGLE_CALENDAR_CLIENT_SECRET?.trim();
  const redirectUri = environment.GOOGLE_CALENDAR_REDIRECT_URI?.trim();
  const sessionSecret = environment.CALENDAR_SESSION_SECRET?.trim();

  if (!clientId || !clientSecret || !redirectUri || !sessionSecret) {
    return { configured: false, reason: "missing" };
  }

  if (!isValidRedirectUri(redirectUri) || sessionSecret.length < 32) {
    return { configured: false, reason: "invalid" };
  }

  return {
    configured: true,
    value: { clientId, clientSecret, redirectUri, sessionSecret },
  };
}

export function requireGoogleOAuthConfig(
  environment: Environment = process.env,
): GoogleOAuthConfig {
  const configuration = getGoogleOAuthConfiguration(environment);
  if (!configuration.configured) {
    throw new GoogleOAuthError(
      "configuration-required",
      "Google Calendar is not configured.",
    );
  }
  return configuration.value;
}

export function createOAuthState(): string {
  return randomBytes(32).toString("base64url");
}

export function createPkceVerifier(): string {
  return randomBytes(48).toString("base64url");
}

export function createPkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function createGoogleAuthorizationUrl(
  config: GoogleOAuthConfig,
  state: string,
  codeChallenge: string,
): URL {
  const url = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);
  url.search = new URLSearchParams({
    access_type: "offline",
    client_id: config.clientId,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    include_granted_scopes: "false",
    prompt: "consent",
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: GOOGLE_CALENDAR_FREEBUSY_SCOPE,
    state,
  }).toString();
  return url;
}

function parseTokenPayload(
  payload: GoogleTokenPayload,
  now: Date,
  fallbackScope?: string,
): GoogleOAuthTokens {
  if (
    typeof payload.access_token !== "string" ||
    !payload.access_token ||
    typeof payload.expires_in !== "number" ||
    !Number.isFinite(payload.expires_in) ||
    payload.expires_in <= 0
  ) {
    throw new GoogleOAuthError(
      "authentication-failed",
      "Google Calendar authorization did not return usable credentials.",
    );
  }

  const scope =
    typeof payload.scope === "string" ? payload.scope : (fallbackScope ?? "");
  if (!scope.split(/\s+/).includes(GOOGLE_CALENDAR_FREEBUSY_SCOPE)) {
    throw new GoogleOAuthError(
      "authentication-failed",
      "Google Calendar did not grant the required availability permission.",
    );
  }

  return {
    accessToken: payload.access_token,
    refreshToken:
      typeof payload.refresh_token === "string" && payload.refresh_token
        ? payload.refresh_token
        : null,
    expiresAt: now.getTime() + payload.expires_in * 1_000,
    scope,
  };
}

async function requestTokens(
  body: URLSearchParams,
  fetchImplementation: FetchLike,
  now: () => Date,
  fallbackScope?: string,
): Promise<GoogleOAuthTokens> {
  let response: Response;
  try {
    response = await fetchImplementation(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
  } catch (error) {
    throw new GoogleOAuthError(
      "provider-unavailable",
      "Google Calendar authorization is temporarily unavailable.",
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new GoogleOAuthError(
      response.status >= 500 ? "provider-unavailable" : "authentication-failed",
      response.status >= 500
        ? "Google Calendar authorization is temporarily unavailable."
        : "Google Calendar authorization was rejected.",
    );
  }

  let payload: GoogleTokenPayload;
  try {
    payload = (await response.json()) as GoogleTokenPayload;
  } catch (error) {
    throw new GoogleOAuthError(
      "provider-unavailable",
      "Google Calendar authorization returned an invalid response.",
      { cause: error },
    );
  }
  return parseTokenPayload(payload, now(), fallbackScope);
}

export function exchangeGoogleAuthorizationCode(
  config: GoogleOAuthConfig,
  code: string,
  codeVerifier: string,
  fetchImplementation: FetchLike = fetch,
  now: () => Date = () => new Date(),
): Promise<GoogleOAuthTokens> {
  return requestTokens(
    new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }),
    fetchImplementation,
    now,
  );
}

export async function refreshGoogleAccessToken(
  config: GoogleOAuthConfig,
  refreshToken: string,
  fetchImplementation: FetchLike = fetch,
  now: () => Date = () => new Date(),
): Promise<GoogleOAuthTokens> {
  const tokens = await requestTokens(
    new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    fetchImplementation,
    now,
    GOOGLE_CALENDAR_FREEBUSY_SCOPE,
  );
  return { ...tokens, refreshToken };
}

export async function revokeGoogleToken(
  token: string,
  fetchImplementation: FetchLike = fetch,
): Promise<boolean> {
  try {
    const response = await fetchImplementation(GOOGLE_REVOCATION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
