import { describe, expect, it } from "vitest";

import { getCalendarProviders } from "@/lib/calendar/providers";

describe("calendar provider registry", () => {
  it("keeps Google first and exposes future providers through one contract", () => {
    const providers = getCalendarProviders({
      GOOGLE_CALENDAR_CLIENT_ID: undefined,
      GOOGLE_CALENDAR_CLIENT_SECRET: undefined,
    });

    expect(providers.map((provider) => provider.id)).toEqual([
      "google",
      "microsoft",
      "apple",
      "caldav",
    ]);
    expect(providers[0]).toMatchObject({
      primary: true,
      status: "configuration-required",
      connectionKind: "oauth2",
      capabilities: { availability: true, eventDetails: false },
    });
    expect(providers.slice(1).every((provider) => provider.status === "planned")).toBe(
      true,
    );
  });

  it("marks Google configured only when both server credentials exist", () => {
    expect(
      getCalendarProviders({
        GOOGLE_CALENDAR_CLIENT_ID: "client-id",
        GOOGLE_CALENDAR_CLIENT_SECRET: "client-secret",
      })[0].status,
    ).toBe("configured");

    expect(
      getCalendarProviders({
        GOOGLE_CALENDAR_CLIENT_ID: "client-id",
        GOOGLE_CALENDAR_CLIENT_SECRET: undefined,
      })[0].status,
    ).toBe("configuration-required");
  });
});
