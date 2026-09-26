import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createGoogleCalendarAdapter } from "@/lib/calendar/google";
import { ensureFreshGoogleSession } from "@/lib/calendar/google-connection";
import {
  GoogleOAuthError,
  getGoogleOAuthConfiguration,
  refreshGoogleAccessToken,
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
import { CalendarIntegrationError } from "@/lib/calendar/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_WINDOW_MS = 7 * 24 * 60 * 60 * 1_000;

function json(body: Record<string, unknown>, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function validRange(timeMin: string | null, timeMax: string | null) {
  if (!timeMin || !timeMax) return null;
  const min = Date.parse(timeMin);
  const max = Date.parse(timeMax);
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    max <= min ||
    max - min > MAX_WINDOW_MS
  ) {
    return null;
  }
  return { timeMin: new Date(min).toISOString(), timeMax: new Date(max).toISOString() };
}

export async function GET(request: NextRequest) {
  const range = validRange(
    request.nextUrl.searchParams.get("timeMin"),
    request.nextUrl.searchParams.get("timeMax"),
  );
  if (!range) {
    return json(
      { status: "invalid-request", message: "Use a valid window of up to 7 days." },
      400,
    );
  }

  const configuration = getGoogleOAuthConfiguration();
  if (!configuration.configured) {
    return json({ status: "configuration-required" }, 503);
  }

  const session = unsealCalendarValue<GoogleCalendarSession>(
    request.cookies.get(GOOGLE_SESSION_COOKIE)?.value,
    configuration.value.sessionSecret,
  );
  if (!isGoogleCalendarSession(session)) {
    return json({ status: "authentication-required" }, 401);
  }

  try {
    let active = await ensureFreshGoogleSession(session, configuration.value);
    const adapter = createGoogleCalendarAdapter();
    let snapshot;
    try {
      snapshot = await adapter.readAvailability({
        credential: { accessToken: active.session.accessToken },
        ...range,
      });
    } catch (caught) {
      if (
        !(caught instanceof CalendarIntegrationError) ||
        caught.code !== "authentication-failed" ||
        active.refreshed ||
        !active.session.refreshToken
      ) {
        throw caught;
      }
      const tokens = await refreshGoogleAccessToken(
        configuration.value,
        active.session.refreshToken,
      );
      active = {
        refreshed: true,
        session: {
          ...active.session,
          ...tokens,
          refreshToken: active.session.refreshToken,
        },
      };
      snapshot = await adapter.readAvailability({
        credential: { accessToken: active.session.accessToken },
        ...range,
      });
    }
    const response = NextResponse.json(
      { status: "available", snapshot },
      { headers: { "Cache-Control": "no-store" } },
    );
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
      (caught instanceof GoogleOAuthError &&
        caught.code === "authentication-failed") ||
      (caught instanceof CalendarIntegrationError &&
        caught.code === "authentication-failed");
    const response = json(
      {
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
