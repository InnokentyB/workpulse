import { describe, expect, it, vi } from "vitest";

import { GOOGLE_CALENDAR_FREEBUSY_SCOPE } from "@/lib/calendar/google";
import { ensureFreshGoogleSession } from "@/lib/calendar/google-connection";
import type { GoogleOAuthConfig } from "@/lib/calendar/google-oauth";
import type { GoogleCalendarSession } from "@/lib/calendar/google-session";

const config: GoogleOAuthConfig = {
  clientId: "client-id",
  clientSecret: "client-secret",
  redirectUri: "https://workpulse.example/api/calendar/google/callback",
  sessionSecret: "a-secure-session-secret-that-is-long-enough",
};

const session: GoogleCalendarSession = {
  version: 1,
  accessToken: "old-access",
  refreshToken: "refresh-token",
  expiresAt: Date.parse("2026-09-26T12:00:30.000Z"),
  scope: GOOGLE_CALENDAR_FREEBUSY_SCOPE,
  createdAt: Date.parse("2026-09-20T12:00:00.000Z"),
};

describe("Google Calendar session refresh", () => {
  it("refreshes an access token shortly before expiry", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ access_token: "new-access", expires_in: 3600 }),
    );

    const result = await ensureFreshGoogleSession(
      session,
      config,
      fetchMock,
      () => new Date("2026-09-26T12:00:00.000Z"),
    );

    expect(result.refreshed).toBe(true);
    expect(result.session).toMatchObject({
      accessToken: "new-access",
      refreshToken: "refresh-token",
    });
  });

  it("does not contact Google while the access token is fresh", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    const result = await ensureFreshGoogleSession(
      { ...session, expiresAt: Date.parse("2026-09-26T14:00:00.000Z") },
      config,
      fetchMock,
      () => new Date("2026-09-26T12:00:00.000Z"),
    );

    expect(result.refreshed).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires reconnection when no refresh token remains", async () => {
    await expect(
      ensureFreshGoogleSession(
        { ...session, refreshToken: null },
        config,
        vi.fn<typeof fetch>(),
        () => new Date("2026-09-26T12:00:00.000Z"),
      ),
    ).rejects.toMatchObject({ code: "authentication-failed" });
  });
});
