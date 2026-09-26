import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ensureFreshGoogleSession } from "@/lib/calendar/google-connection";
import {
  GoogleOAuthError,
  getGoogleOAuthConfiguration,
} from "@/lib/calendar/google-oauth";
import {
  GOOGLE_SESSION_COOKIE,
  GOOGLE_SESSION_MAX_AGE_SECONDS,
  googleCookieOptions,
  isGoogleCalendarSession,
  sealCalendarValue,
  unsealCalendarValue,
  type GoogleCalendarSession,
} from "@/lib/calendar/google-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function statusResponse(
  body: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  const configuration = getGoogleOAuthConfiguration();
  if (!configuration.configured) {
    return statusResponse({
      provider: "google",
      configured: false,
      connected: false,
      status: "configuration-required",
    });
  }

  const session = unsealCalendarValue<GoogleCalendarSession>(
    request.cookies.get(GOOGLE_SESSION_COOKIE)?.value,
    configuration.value.sessionSecret,
  );
  if (!isGoogleCalendarSession(session)) {
    const response = statusResponse({
      provider: "google",
      configured: true,
      connected: false,
      status: "disconnected",
    });
    if (request.cookies.has(GOOGLE_SESSION_COOKIE)) {
      response.cookies.set(
        GOOGLE_SESSION_COOKIE,
        "",
        googleCookieOptions(0),
      );
    }
    return response;
  }

  try {
    const active = await ensureFreshGoogleSession(session, configuration.value);
    const response = statusResponse({
      provider: "google",
      configured: true,
      connected: true,
      status: "connected",
      expiresAt: new Date(active.session.expiresAt).toISOString(),
    });
    if (active.refreshed) {
      response.cookies.set(
        GOOGLE_SESSION_COOKIE,
        sealCalendarValue(active.session, configuration.value.sessionSecret),
        googleCookieOptions(GOOGLE_SESSION_MAX_AGE_SECONDS),
      );
    }
    return response;
  } catch (caught) {
    const authenticationFailed =
      caught instanceof GoogleOAuthError &&
      caught.code === "authentication-failed";
    const response = statusResponse(
      {
        provider: "google",
        configured: true,
        connected: !authenticationFailed,
        status: authenticationFailed
          ? "authentication-failed"
          : "provider-unavailable",
      },
      authenticationFailed ? 401 : 503,
    );
    if (authenticationFailed) {
      response.cookies.set(GOOGLE_SESSION_COOKIE, "", googleCookieOptions(0));
    }
    return response;
  }
}
