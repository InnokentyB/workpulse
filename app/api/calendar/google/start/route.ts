import { NextRequest, NextResponse } from "next/server";
import { authorizeUrl, cookieOptions, FLOW_COOKIE, getGoogleConfig, randomUrlToken, seal } from "@/lib/calendar/google-oauth";

export async function GET(request: NextRequest) {
  const config = getGoogleConfig();
  if (!config) return NextResponse.redirect(new URL("/calendar?error=configuration", request.url));
  if (new URL(config.redirectUri).origin !== request.nextUrl.origin) return new Response("OAuth origin mismatch", { status: 400 });
  const state = randomUrlToken();
  const verifier = randomUrlToken();
  const response = NextResponse.redirect(authorizeUrl(config, state, verifier));
  response.cookies.set(FLOW_COOKIE, seal({ state, verifier, expiresAt: Date.now() + 600_000 }, config.sessionSecret),
    { ...cookieOptions(request.nextUrl.protocol === "https:"), maxAge: 600 });
  return response;
}
