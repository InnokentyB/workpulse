import { NextRequest, NextResponse } from "next/server";
import { cookieOptions, FLOW_COOKIE, getGoogleConfig, readSession, SESSION_COOKIE } from "@/lib/calendar/google-oauth";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return new Response("Invalid origin", { status: 403 });
  const config = getGoogleConfig();
  const session = config && readSession(request.cookies.get(SESSION_COOKIE)?.value, config);
  if (session) {
    try { await fetch("https://oauth2.googleapis.com/revoke", { method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: session.accessToken }), cache: "no-store" }); } catch { /* Local session still ends. */ }
  }
  const response = NextResponse.json({ connected: false }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(request.nextUrl.protocol === "https:"), maxAge: 0 });
  response.cookies.set(FLOW_COOKIE, "", { ...cookieOptions(request.nextUrl.protocol === "https:"), maxAge: 0 });
  return response;
}
