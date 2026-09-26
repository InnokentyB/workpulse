import { NextResponse } from "next/server";

import {
  GOOGLE_OAUTH_FLOW_TTL_SECONDS,
  createGoogleAuthorizationUrl,
  createOAuthState,
  createPkceChallenge,
  createPkceVerifier,
  getGoogleOAuthConfiguration,
} from "@/lib/calendar/google-oauth";
import {
  GOOGLE_FLOW_COOKIE,
  googleCookieOptions,
  sealCalendarValue,
} from "@/lib/calendar/google-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const configuration = getGoogleOAuthConfiguration();
  if (!configuration.configured) {
    return NextResponse.json(
      {
        provider: "google",
        status: "configuration-required",
        message: "Google Calendar is not available yet. Manual mode still works.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const state = createOAuthState();
  const codeVerifier = createPkceVerifier();
  const authorizationUrl = createGoogleAuthorizationUrl(
    configuration.value,
    state,
    createPkceChallenge(codeVerifier),
  );
  const response = NextResponse.redirect(authorizationUrl);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(
    GOOGLE_FLOW_COOKIE,
    sealCalendarValue(
      { state, codeVerifier, createdAt: Date.now() },
      configuration.value.sessionSecret,
    ),
    googleCookieOptions(
      GOOGLE_OAUTH_FLOW_TTL_SECONDS,
      "/api/calendar/google/callback",
    ),
  );
  return response;
}
