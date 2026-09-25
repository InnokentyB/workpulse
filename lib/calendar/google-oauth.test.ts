import { describe, expect, it, vi } from "vitest";

import {
  buildGoogleCalendarAuthorizationUrl,
  exchangeGoogleCalendarCode,
} from "@/lib/calendar/google-oauth";

const configuration = {
  clientId: "google-client-id",
  clientSecret: "google-client-secret",
  redirectUri: "https://workpulse.example/api/calendar/google/callback",
};

describe("Google Calendar OAuth", () => {
  it("builds a separate, minimal calendar consent request", () => {
    const url = new URL(
      buildGoogleCalendarAuthorizationUrl(configuration, "opaque-state"),
    );

    expect(url.origin + url.pathname).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(url.searchParams.get("scope")).toBe(
      "https://www.googleapis.com/auth/calendar.events.freebusy",
    );
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("include_granted_scopes")).toBe("true");
    expect(url.searchParams.get("state")).toBe("opaque-state");
  });

  it("exchanges an authorization code without exposing client credentials", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        access_token: "access-token",
        refresh_token: "refresh-token",
        expires_in: 3600,
        scope: "calendar.events.freebusy",
        token_type: "Bearer",
      }),
    );

    const tokens = await exchangeGoogleCalendarCode(
      configuration,
      "authorization-code",
      fetchMock,
      () => new Date("2026-09-25T10:00:00.000Z"),
    );

    expect(tokens).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresAt: "2026-09-25T11:00:00.000Z",
      scope: "calendar.events.freebusy",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = fetchMock.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("client_secret")).toBe("google-client-secret");
  });

  it("rejects incomplete provider responses", async () => {
    await expect(
      exchangeGoogleCalendarCode(
        configuration,
        "code",
        vi.fn<typeof fetch>().mockResolvedValue(
          Response.json({ access_token: "access-only", expires_in: 3600 }),
        ),
      ),
    ).rejects.toMatchObject({ code: "invalid-provider-response" });
  });
});
