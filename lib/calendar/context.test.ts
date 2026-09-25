import { describe, expect, it } from "vitest";

import { deriveCalendarWorkContext } from "@/lib/calendar/context";
import type { CalendarBusyPeriod } from "@/lib/calendar/types";

function period(start: string, end: string): CalendarBusyPeriod {
  return { calendarId: "primary", start, end };
}

describe("calendar work context", () => {
  it("reports a clear free window before the next meeting", () => {
    expect(
      deriveCalendarWorkContext(
        [period("2026-09-25T10:30:00.000Z", "2026-09-25T11:00:00.000Z")],
        new Date("2026-09-25T10:00:00.000Z"),
      ),
    ).toEqual({
      isBusy: false,
      minutesToNextMeeting: 30,
      freeWindowMinutes: 30,
      nextBusyStart: "2026-09-25T10:30:00.000Z",
      currentBusyEnd: null,
    });
  });

  it("merges overlapping calendars while the user is busy", () => {
    expect(
      deriveCalendarWorkContext(
        [
          period("2026-09-25T09:45:00.000Z", "2026-09-25T10:15:00.000Z"),
          period("2026-09-25T10:00:00.000Z", "2026-09-25T10:45:00.000Z"),
        ],
        new Date("2026-09-25T10:05:00.000Z"),
      ),
    ).toMatchObject({
      isBusy: true,
      minutesToNextMeeting: 0,
      freeWindowMinutes: 0,
      currentBusyEnd: "2026-09-25T10:45:00.000Z",
    });
  });

  it("ignores malformed periods and represents an open-ended free window", () => {
    expect(
      deriveCalendarWorkContext(
        [period("invalid", "2026-09-25T10:00:00.000Z")],
        new Date("2026-09-25T09:00:00.000Z"),
      ),
    ).toEqual({
      isBusy: false,
      minutesToNextMeeting: null,
      freeWindowMinutes: null,
      nextBusyStart: null,
      currentBusyEnd: null,
    });
  });
});
