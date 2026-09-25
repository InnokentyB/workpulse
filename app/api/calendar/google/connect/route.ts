import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import { auth } from "@/auth";
import {
  getAccountConfiguration,
  getGoogleOAuthConfiguration,
} from "@/lib/auth/config";
import { buildGoogleCalendarAuthorizationUrl } from "@/lib/calendar/google-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const configuration = getAccountConfiguration();
  if (!configuration.calendarReady) {
    return Response.redirect(new URL("/account?calendar=unavailable", request.url));
  }

  const session = await auth();
  if (!session?.user.id) {
    return Response.redirect(new URL("/account?signin=required", request.url));
  }

  const state = randomBytes(32).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set("workpulse-calendar-oauth-state", state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/api/calendar/google/callback",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return Response.redirect(
    buildGoogleCalendarAuthorizationUrl(
      getGoogleOAuthConfiguration(),
      state,
    ),
  );
}
