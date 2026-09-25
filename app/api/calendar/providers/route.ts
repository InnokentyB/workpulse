import { getCalendarProviders } from "@/lib/calendar/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { providers: getCalendarProviders() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
