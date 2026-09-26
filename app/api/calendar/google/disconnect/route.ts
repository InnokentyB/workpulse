import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  getGoogleOAuthConfiguration,
  revokeGoogleToken,
} from "@/lib/calendar/google-oauth";
import {
  GOOGLE_SESSION_COOKIE,
  googleCookieOptions,
  isGoogleCalendarSession,
  unsealCalendarValue,
  type GoogleCalendarSession,
} from "@/lib/calendar/google-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === request.nextUrl.origin);
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { status: "invalid-request" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const configuration = getGoogleOAuthConfiguration();
  let revocationConfirmed = false;
  if (configuration.configured) {
    const session = unsealCalendarValue<GoogleCalendarSession>(
      request.cookies.get(GOOGLE_SESSION_COOKIE)?.value,
      configuration.value.sessionSecret,
    );
    if (isGoogleCalendarSession(session)) {
      revocationConfirmed = await revokeGoogleToken(
        session.refreshToken ?? session.accessToken,
      );
    }
  }

  const response = NextResponse.json(
    {
      provider: "google",
      connected: false,
      status: "disconnected",
      revocationConfirmed,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set(GOOGLE_SESSION_COOKIE, "", googleCookieOptions(0));
  return response;
}
