import { describe, expect, it } from "vitest";

import { getAccountConfiguration } from "@/lib/auth/config";

const completeEnvironment = {
  AUTH_SECRET: "session-secret",
  CALENDAR_TOKEN_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
  DATABASE_URL: "postgresql://localhost/workpulse",
  GOOGLE_CALENDAR_CLIENT_ID: "google-client",
  GOOGLE_CALENDAR_CLIENT_SECRET: "google-secret",
  GOOGLE_CALENDAR_REDIRECT_URI:
    "http://localhost:3000/api/calendar/google/callback",
};

describe("account configuration", () => {
  it("requires every server-side dependency for a live account", () => {
    expect(getAccountConfiguration(completeEnvironment)).toEqual({
      authReady: true,
      calendarReady: true,
      missing: [],
    });
  });

  it("reports safe variable names instead of secret values", () => {
    const configuration = getAccountConfiguration({
      ...completeEnvironment,
      AUTH_SECRET: undefined,
      CALENDAR_TOKEN_ENCRYPTION_KEY: "invalid",
    });

    expect(configuration).toEqual({
      authReady: false,
      calendarReady: false,
      missing: ["AUTH_SECRET", "CALENDAR_TOKEN_ENCRYPTION_KEY"],
    });
    expect(JSON.stringify(configuration)).not.toContain("google-secret");
  });
});
