import { NextRequest } from "next/server";
import { getGoogleConfig, readSession, SESSION_COOKIE } from "@/lib/calendar/google-oauth";

export async function GET(request: NextRequest) {
  const config = getGoogleConfig();
  const session = config && readSession(request.cookies.get(SESSION_COOKIE)?.value, config);
  if (!session) return Response.json({ error: "Connect Google Calendar again." }, { status: 401 });
  try {
    const calendars: Array<{ id: string; name: string; primary: boolean }> = [];
    let pageToken: string | undefined;
    for (let page = 0; page < 4; page++) {
      const url = new URL("https://www.googleapis.com/calendar/v3/users/me/calendarList");
      url.searchParams.set("maxResults", "100");
      url.searchParams.set("minAccessRole", "freeBusyReader");
      if (pageToken) url.searchParams.set("pageToken", pageToken);
      const response = await fetch(url, { headers: { Authorization: `Bearer ${session.accessToken}` }, cache: "no-store" });
      if (!response.ok) return Response.json({ error: response.status === 401 ? "Google session expired." : "Google calendars unavailable." }, { status: response.status === 401 ? 401 : 502 });
      const body = await response.json() as { items?: Array<{ id?: unknown; summary?: unknown; primary?: unknown }>; nextPageToken?: unknown };
      if (!Array.isArray(body.items)) return Response.json({ error: "Invalid calendar response." }, { status: 502 });
      for (const item of body.items) if (typeof item.id === "string") calendars.push({ id: item.id,
        name: typeof item.summary === "string" ? item.summary : "Calendar", primary: item.primary === true });
      pageToken = typeof body.nextPageToken === "string" ? body.nextPageToken : undefined;
      if (!pageToken) break;
    }
    return Response.json({ calendars, truncated: !!pageToken }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Google calendars unavailable." }, { status: 502 }); }
}
