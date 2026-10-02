import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { GOOGLE_CALENDAR_FREEBUSY_SCOPE } from "./google";

export const GOOGLE_CALENDAR_LIST_SCOPE =
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly";
export const FLOW_COOKIE = "workpulse_google_flow";
export const SESSION_COOKIE = "workpulse_google_session";

export type GoogleConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sessionSecret: string;
};

export function getGoogleConfig(environment: Record<string, string | undefined> = process.env): GoogleConfig | null {
  const { GOOGLE_CALENDAR_CLIENT_ID: clientId, GOOGLE_CALENDAR_CLIENT_SECRET: clientSecret,
    GOOGLE_CALENDAR_REDIRECT_URI: redirectUri, CALENDAR_SESSION_SECRET: sessionSecret } = environment;
  if (!clientId || !clientSecret || !redirectUri || !sessionSecret || sessionSecret.length < 32) return null;
  let url: URL;
  try { url = new URL(redirectUri); } catch { return null; }
  if (url.pathname !== "/api/calendar/google/callback" || url.search || url.hash ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))) return null;
  return { clientId, clientSecret, redirectUri, sessionSecret };
}

export function randomUrlToken(): string {
  return randomBytes(32).toString("base64url");
}

export function challengeFor(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function authorizeUrl(config: GoogleConfig, state: string, verifier: string): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri,
    response_type: "code", scope: `${GOOGLE_CALENDAR_FREEBUSY_SCOPE} ${GOOGLE_CALENDAR_LIST_SCOPE}`,
    state, code_challenge: challengeFor(verifier), code_challenge_method: "S256",
    access_type: "online" }).toString();
  return url.toString();
}

export function seal<T>(value: T, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", createHash("sha256").update(secret).digest(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

export function unseal<T>(value: string | undefined, secret: string): T | null {
  if (!value) return null;
  try {
    const data = Buffer.from(value, "base64url");
    if (data.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", createHash("sha256").update(secret).digest(), data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    return JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString()) as T;
  } catch { return null; }
}

export type PendingFlow = { state: string; verifier: string; expiresAt: number };
export type AccessSession = { accessToken: string; expiresAt: number };

export function readSession(value: string | undefined, config: GoogleConfig): AccessSession | null {
  const session = unseal<AccessSession>(value, config.sessionSecret);
  return session && typeof session.accessToken === "string" && Number.isFinite(session.expiresAt)
    && session.expiresAt > Date.now() + 30_000 ? session : null;
}

export const cookieOptions = (secure: boolean) => ({ httpOnly: true, sameSite: "lax" as const,
  secure, path: "/api/calendar/google" });
