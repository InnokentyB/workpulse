import { describe, expect, it, vi } from "vitest";

import {
  GOOGLE_CALENDAR_FREEBUSY_SCOPE,
  createGoogleCalendarAdapter,
} from "@/lib/calendar/google";
import { CalendarIntegrationError } from "@/lib/calendar/types";

const request = {
  credential: { accessToken: "private-access-token" },
  timeMin: "2026-09-25T09:00:00.000Z",
  timeMax: "2026-09-25T18:00:00.000Z",
};

describe("Google Calendar availability adapter", () => {
  it("requests minimal free/busy data and normalizes the response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          calendars: {
            primary: {
              busy: [
                {
                  start: "2026-09-25T14:00:00.000Z",
                  end: "2026-09-25T14:30:00.000Z",
                },
                {
                  start: "2026-09-25T10:00:00.000Z",
                  end: "2026-09-25T10:45:00.000Z",
                },
              ],
            },
          },
        }),
        { status: 200 },
      ),
    );
    const adapter = createGoogleCalendarAdapter(
      fetchMock,
      () => new Date("2026-09-25T08:59:00.000Z"),
    );

    const result = await adapter.readAvailability(request);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.googleapis.com/calendar/v3/freeBusy",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer private-access-token",
          "Content-Type": "application/json",
        },
      }),
    );
    const call = fetchMock.mock.calls[0];
    expect(JSON.parse(call[1]?.body as string)).toEqual({
      timeMin: request.timeMin,
      timeMax: request.timeMax,
      items: [{ id: "primary" }],
    });
    expect(result.busy.map((period) => period.start)).toEqual([
      "2026-09-25T10:00:00.000Z",
      "2026-09-25T14:00:00.000Z",
    ]);
    expect(result).toMatchObject({
      providerId: "google",
      fetchedAt: "2026-09-25T08:59:00.000Z",
    });
    expect(GOOGLE_CALENDAR_FREEBUSY_SCOPE).toContain("events.freebusy");
  });

  it("maps expired authorization without exposing provider response details", async () => {
    const adapter = createGoogleCalendarAdapter(
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response("sensitive provider details", { status: 401 }),
      ),
    );

    await expect(adapter.readAvailability(request)).rejects.toMatchObject({
      code: "authentication-failed",
      message: "Google Calendar authorization is no longer valid.",
    });
  });

  it("rejects invalid ranges before contacting Google", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    const adapter = createGoogleCalendarAdapter(fetchMock);

    await expect(
      adapter.readAvailability({ ...request, timeMax: request.timeMin }),
    ).rejects.toBeInstanceOf(CalendarIntegrationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed busy periods", async () => {
    const adapter = createGoogleCalendarAdapter(
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          calendars: { primary: { busy: [{ start: "not-a-date" }] } },
        }),
      ),
    );

    await expect(adapter.readAvailability(request)).rejects.toMatchObject({
      code: "invalid-provider-response",
    });
  });
});
