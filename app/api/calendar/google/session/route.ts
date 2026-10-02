import { NextRequest } from "next/server";
import { getGoogleConfig, readSession, SESSION_COOKIE } from "@/lib/calendar/google-oauth";

export async function GET(request: NextRequest) {
  const config = getGoogleConfig();
  return Response.json({ configured: !!config,
    connected: !!config && !!readSession(request.cookies.get(SESSION_COOKIE)?.value, config) },
    { headers: { "Cache-Control": "no-store" } });
}
