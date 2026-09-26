import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { GOOGLE_CALENDAR_FREEBUSY_SCOPE } from "@/lib/calendar/google";
import type { GoogleOAuthTokens } from "@/lib/calendar/google-oauth";

export const GOOGLE_FLOW_COOKIE = "workpulse_google_oauth";
export const GOOGLE_SESSION_COOKIE = "workpulse_google_session";
export const GOOGLE_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export type GoogleOAuthFlow = {
  state: string;
  codeVerifier: string;
  createdAt: number;
};

export type GoogleCalendarSession = GoogleOAuthTokens & {
  version: 1;
  createdAt: number;
};

type CookieOptions = {
  httpOnly: true;
  maxAge: number;
  path: string;
  sameSite: "lax";
  secure: boolean;
};

export function googleCookieOptions(
  maxAge: number,
  path = "/api/calendar/google",
): CookieOptions {
  return {
    httpOnly: true,
    maxAge,
    path,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

function encryptionKey(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function sealCalendarValue(value: unknown, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

function decodeCanonicalBase64Url(value: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const decoded = Buffer.from(value, "base64url");
  return decoded.toString("base64url") === value ? decoded : null;
}

export function unsealCalendarValue<T>(
  sealed: string | undefined,
  secret: string,
): T | null {
  if (!sealed) return null;
  try {
    const [ivValue, tagValue, encryptedValue, extra] = sealed.split(".");
    if (!ivValue || !tagValue || !encryptedValue || extra) return null;
    const iv = decodeCanonicalBase64Url(ivValue);
    const tag = decodeCanonicalBase64Url(tagValue);
    const encrypted = decodeCanonicalBase64Url(encryptedValue);
    if (!iv || iv.length !== 12 || !tag || tag.length !== 16 || !encrypted) {
      return null;
    }
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(secret),
      iv,
    );
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(decrypted) as T;
  } catch {
    return null;
  }
}

export function createGoogleCalendarSession(
  tokens: GoogleOAuthTokens,
  now: Date = new Date(),
): GoogleCalendarSession {
  return { ...tokens, version: 1, createdAt: now.getTime() };
}

export function isGoogleCalendarSession(
  value: GoogleCalendarSession | null,
): value is GoogleCalendarSession {
  return Boolean(
    value &&
      value.version === 1 &&
      typeof value.accessToken === "string" &&
      value.accessToken &&
      (value.refreshToken === null || typeof value.refreshToken === "string") &&
      typeof value.expiresAt === "number" &&
      Number.isFinite(value.expiresAt) &&
      typeof value.scope === "string" &&
      value.scope.split(/\s+/).includes(GOOGLE_CALENDAR_FREEBUSY_SCOPE) &&
      typeof value.createdAt === "number" &&
      Number.isFinite(value.createdAt),
  );
}

export function statesMatch(expected: string, actual: string): boolean {
  const expectedBytes = Buffer.from(expected);
  const actualBytes = Buffer.from(actual);
  return (
    expectedBytes.length === actualBytes.length &&
    timingSafeEqual(expectedBytes, actualBytes)
  );
}
