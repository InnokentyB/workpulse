import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  GOOGLE_OAUTH_FLOW_TTL_SECONDS,
  GoogleOAuthError,
  exchangeGoogleAuthorizationCode,
  getGoogleOAuthConfiguration,
} from "@/lib/calendar/google-oauth";
import {
  GOOGLE_FLOW_COOKIE,
  GOOGLE_SESSION_COOKIE,
  GOOGLE_SESSION_MAX_AGE_SECONDS,
  createGoogleCalendarSession,
  googleCookieOptions,
  sealCalendarValue,
  statesMatch,
  unsealCalendarValue,
  type GoogleOAuthFlow,
} from "@/lib/calendar/google-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function resultRedirect(appOrigin: string, result: string): NextResponse {
  const destination = new URL("/", appOrigin);
  destination.searchParams.set("calendar", result);
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(
    GOOGLE_FLOW_COOKIE,
    "",
    googleCookieOptions(0, "/api/calendar/google/callback"),
  );
  return response;
}

function validFlow(flow: GoogleOAuthFlow | null, now: number): flow is GoogleOAuthFlow {
  return Boolean(
    flow &&
      typeof flow.state === "string" &&
      typeof flow.codeVerifier === "string" &&
      typeof flow.createdAt === "number" &&
      flow.createdAt <= now + 60_000 &&
      now - flow.createdAt <= GOOGLE_OAUTH_FLOW_TTL_SECONDS * 1_000,
  );
}

export async function GET(request: NextRequest) {
  const configuration = getGoogleOAuthConfiguration();
  if (!configuration.configured) {
    return NextResponse.json(
      { provider: "google", status: "configuration-required" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const appOrigin = new URL(configuration.value.redirectUri).origin;

  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const flow = unsealCalendarValue<GoogleOAuthFlow>(
    request.cookies.get(GOOGLE_FLOW_COOKIE)?.value,
    configuration.value.sessionSecret,
  );

  if (!state || !validFlow(flow, Date.now()) || !statesMatch(flow.state, state)) {
    return resultRedirect(appOrigin, "connection-failed");
  }

  if (error || !code) {
    return resultRedirect(
      appOrigin,
      error === "access_denied" ? "permission-declined" : "connection-failed",
    );
  }

  try {
    const tokens = await exchangeGoogleAuthorizationCode(
      configuration.value,
      code,
      flow.codeVerifier,
    );
    const session = createGoogleCalendarSession(tokens);
    const response = resultRedirect(appOrigin, "connected");
    response.cookies.set(
      GOOGLE_SESSION_COOKIE,
      sealCalendarValue(session, configuration.value.sessionSecret),
      googleCookieOptions(GOOGLE_SESSION_MAX_AGE_SECONDS),
    );
    return response;
  } catch (caught) {
    return resultRedirect(
      appOrigin,
      caught instanceof GoogleOAuthError && caught.code === "provider-unavailable"
        ? "provider-unavailable"
        : "connection-failed",
    );
  }
}
