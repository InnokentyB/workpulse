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
        AUTH_SECRET: "auth-secret",
        DATABASE_URL: "postgresql://localhost/workpulse",
        CALENDAR_TOKEN_ENCRYPTION_KEY: Buffer.alloc(32).toString("base64"),
        GOOGLE_CALENDAR_CLIENT_ID: "client-id",
        GOOGLE_CALENDAR_CLIENT_SECRET: "client-secret",
        GOOGLE_CALENDAR_REDIRECT_URI:
          "http://localhost:3000/api/calendar/google/callback",
      })[0].status,
    ).toBe("configured");

    expect(
      getCalendarProviders({
        AUTH_SECRET: "auth-secret",
        DATABASE_URL: "postgresql://localhost/workpulse",
        CALENDAR_TOKEN_ENCRYPTION_KEY: Buffer.alloc(32).toString("base64"),
        GOOGLE_CALENDAR_CLIENT_ID: "client-id",
        GOOGLE_CALENDAR_CLIENT_SECRET: undefined,
        GOOGLE_CALENDAR_REDIRECT_URI:
          "http://localhost:3000/api/calendar/google/callback",
      })[0].status,
    ).toBe("configuration-required");
  });
});
