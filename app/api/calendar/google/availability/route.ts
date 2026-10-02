import { NextRequest } from "next/server";
import { deriveCalendarWorkContext } from "@/lib/calendar/context";
import { createGoogleCalendarAdapter } from "@/lib/calendar/google";
import { getGoogleConfig, readSession, SESSION_COOKIE } from "@/lib/calendar/google-oauth";
import { CalendarIntegrationError } from "@/lib/calendar/types";

export async function GET(request: NextRequest) {
  const config = getGoogleConfig();
  const session = config && readSession(request.cookies.get(SESSION_COOKIE)?.value, config);
  if (!session) return Response.json({ error: "Connect Google Calendar again." }, { status: 401 });
  const ids = request.nextUrl.searchParams.getAll("calendarId");
  if (ids.length < 1 || ids.length > 20 || ids.some((id) => !id || id.length > 256))
    return Response.json({ error: "Select 1–20 calendars." }, { status: 400 });
  // The OAuth token bounds access to calendars this Google account can read.
  // The FreeBusy adapter does not return meeting titles or attendees.
  const now = new Date();
  const timeMax = new Date(now.getTime() + 8 * 60 * 60_000);
  try {
    const snapshot = await createGoogleCalendarAdapter().readAvailability({
      credential: { accessToken: session.accessToken }, timeMin: now.toISOString(),
      timeMax: timeMax.toISOString(), calendarIds: ids,
    });
    return Response.json({ timeMin: snapshot.timeMin, timeMax: snapshot.timeMax,
      busy: snapshot.busy, context: deriveCalendarWorkContext(snapshot.busy, now) },
      { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const auth = error instanceof CalendarIntegrationError && error.code === "authentication-failed";
    return Response.json({ error: auth ? "Google session expired. Reconnect." : "Calendar availability unavailable." },
      { status: auth ? 401 : 502 });
  }
}
