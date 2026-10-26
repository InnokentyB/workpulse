import {
  CalendarIntegrationError,
  type CalendarProviderAdapter,
  type CalendarReadRequest,
  type CalendarSnapshot,
} from "@/lib/calendar/types";

export const GOOGLE_CALENDAR_FREEBUSY_SCOPE =
  "https://www.googleapis.com/auth/calendar.events.freebusy";

const GOOGLE_FREEBUSY_ENDPOINT =
  "https://www.googleapis.com/calendar/v3/freeBusy";

type FetchLike = typeof fetch;

type GoogleFreeBusyResponse = {
  calendars?: Record<
    string,
    {
      busy?: Array<{ start?: unknown; end?: unknown }>;
      errors?: unknown[];
    }
  >;
};

function parseInstant(value: string, field: string): number {
  const instant = Date.parse(value);
  if (!Number.isFinite(instant)) {
    throw new CalendarIntegrationError(
      "invalid-request",
      `${field} must be an ISO date-time string.`,
    );
  }
  return instant;
}

function isDateTime(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export function createGoogleCalendarAdapter(
  fetchImplementation: FetchLike = fetch,
  now: () => Date = () => new Date(),
): CalendarProviderAdapter {
  return {
    id: "google",
    async readAvailability(
      request: CalendarReadRequest,
    ): Promise<CalendarSnapshot> {
      const timeMin = parseInstant(request.timeMin, "timeMin");
      const timeMax = parseInstant(request.timeMax, "timeMax");
      if (timeMax <= timeMin) {
        throw new CalendarIntegrationError(
          "invalid-request",
          "timeMax must be later than timeMin.",
        );
      }
      if (!request.credential.accessToken.trim()) {
        throw new CalendarIntegrationError(
          "invalid-request",
          "A Google access token is required.",
        );
      }

      const calendarIds = request.calendarIds?.length
        ? [...new Set(request.calendarIds)]
        : ["primary"];
      let response: Response;

      try {
        response = await fetchImplementation(GOOGLE_FREEBUSY_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${request.credential.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timeMin: request.timeMin,
            timeMax: request.timeMax,
            items: calendarIds.map((id) => ({ id })),
          }),
        });
      } catch (error) {
        throw new CalendarIntegrationError(
          "provider-unavailable",
          "Google Calendar is temporarily unavailable.",
          { cause: error },
        );
      }

      if (!response.ok) {
        throw new CalendarIntegrationError(
          response.status === 401 || response.status === 403
            ? "authentication-failed"
            : "provider-unavailable",
          response.status === 401 || response.status === 403
            ? "Google Calendar authorization is no longer valid."
            : "Google Calendar could not return availability.",
        );
      }

      let payload: GoogleFreeBusyResponse;
      try {
        payload = (await response.json()) as GoogleFreeBusyResponse;
      } catch (error) {
        throw new CalendarIntegrationError(
          "invalid-provider-response",
          "Google Calendar returned an invalid response.",
          { cause: error },
        );
      }

      if (!payload || typeof payload !== "object" || Array.isArray(payload) || !payload.calendars || typeof payload.calendars !== "object" || Array.isArray(payload.calendars)) {
        throw new CalendarIntegrationError(
          "invalid-provider-response",
          "Google Calendar returned an invalid response.",
        );
      }

      const busy = calendarIds.flatMap((calendarId) => {
        const calendar = payload.calendars?.[calendarId];
        if (!calendar || typeof calendar !== "object" || Array.isArray(calendar) || (calendar.errors !== undefined && !Array.isArray(calendar.errors))) {
          throw new CalendarIntegrationError("invalid-provider-response", "Google Calendar returned an invalid calendar entry.");
        }
        if (calendar.errors?.length) {
          throw new CalendarIntegrationError(
            "provider-unavailable",
            "Google Calendar could not read one of the selected calendars.",
          );
        }

        if (!Array.isArray(calendar.busy)) {
          throw new CalendarIntegrationError("invalid-provider-response", "Google Calendar did not return busy intervals for a selected calendar.");
        }
        return calendar.busy.map((period) => {
          if (!period || typeof period !== "object" || Array.isArray(period) || !isDateTime(period.start) || !isDateTime(period.end)) {
            throw new CalendarIntegrationError(
              "invalid-provider-response",
              "Google Calendar returned an invalid busy period.",
            );
          }
          if (Date.parse(period.end) <= Date.parse(period.start)) {
            throw new CalendarIntegrationError(
              "invalid-provider-response",
              "Google Calendar returned an invalid busy period.",
            );
          }
          return {
            start: period.start,
            end: period.end,
            calendarId,
          };
        });
      });

      return {
        providerId: "google",
        timeMin: request.timeMin,
        timeMax: request.timeMax,
        busy: busy.sort(
          (left, right) => Date.parse(left.start) - Date.parse(right.start),
        ),
        fetchedAt: now().toISOString(),
      };
    },
  };
}
