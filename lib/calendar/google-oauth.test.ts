import { describe, expect, it, vi } from "vitest";

import { GOOGLE_CALENDAR_FREEBUSY_SCOPE } from "@/lib/calendar/google";
import {
  createGoogleAuthorizationUrl,
  createPkceChallenge,
  exchangeGoogleAuthorizationCode,
  getGoogleOAuthConfiguration,
  refreshGoogleAccessToken,
  revokeGoogleToken,
  type GoogleOAuthConfig,
} from "@/lib/calendar/google-oauth";

const config: GoogleOAuthConfig = {
  clientId: "client-id",
  clientSecret: "client-secret",
  redirectUri: "https://workpulse.example/api/calendar/google/callback",
  sessionSecret: "a-secure-session-secret-that-is-long-enough",
};

describe("Google Calendar OAuth", () => {
  it("requires a complete, HTTPS production configuration", () => {
    expect(getGoogleOAuthConfiguration({})).toEqual({
      configured: false,
      reason: "missing",
    });
    expect(
      getGoogleOAuthConfiguration({
        GOOGLE_CALENDAR_CLIENT_ID: config.clientId,
        GOOGLE_CALENDAR_CLIENT_SECRET: config.clientSecret,
        GOOGLE_CALENDAR_REDIRECT_URI: "http://public.example/callback",
        CALENDAR_SESSION_SECRET: config.sessionSecret,
      }),
    ).toEqual({ configured: false, reason: "invalid" });
    expect(
      getGoogleOAuthConfiguration({
        GOOGLE_CALENDAR_CLIENT_ID: config.clientId,
        GOOGLE_CALENDAR_CLIENT_SECRET: config.clientSecret,
        GOOGLE_CALENDAR_REDIRECT_URI: config.redirectUri,
        CALENDAR_SESSION_SECRET: config.sessionSecret,
      }),
    ).toMatchObject({ configured: true });
  });

  it("builds a PKCE redirect with only the free/busy scope", () => {
    const challenge = createPkceChallenge("verifier");
    const url = createGoogleAuthorizationUrl(config, "state", challenge);

    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("scope")).toBe(GOOGLE_CALENDAR_FREEBUSY_SCOPE);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe(challenge);
    expect(url.searchParams.get("state")).toBe("state");
  });

  it("exchanges a code server-side without returning client credentials", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        access_token: "access-token",
        refresh_token: "refresh-token",
        expires_in: 3600,
        scope: GOOGLE_CALENDAR_FREEBUSY_SCOPE,
      }),
    );

    const tokens = await exchangeGoogleAuthorizationCode(
      config,
      "authorization-code",
      "pkce-verifier",
      fetchMock,
      () => new Date("2026-09-26T12:00:00.000Z"),
    );

    expect(tokens).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresAt: Date.parse("2026-09-26T13:00:00.000Z"),
      scope: GOOGLE_CALENDAR_FREEBUSY_SCOPE,
    });
    const request = fetchMock.mock.calls[0][1];
    const body = request?.body as URLSearchParams;
    expect(body.get("client_secret")).toBe(config.clientSecret);
    expect(body.get("code_verifier")).toBe("pkce-verifier");
  });

  it("preserves the refresh token when Google rotates only the access token", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ access_token: "new-access", expires_in: 3600 }),
    );

    await expect(
      refreshGoogleAccessToken(
        config,
        "existing-refresh",
        fetchMock,
        () => new Date(0),
      ),
    ).resolves.toMatchObject({
      accessToken: "new-access",
      refreshToken: "existing-refresh",
      scope: GOOGLE_CALENDAR_FREEBUSY_SCOPE,
    });
  });

  it("does not expose provider error bodies and tolerates failed revocation", async () => {
    const providerError = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("token and private provider details", { status: 400 }));

    await expect(
      exchangeGoogleAuthorizationCode(
        config,
        "bad-code",
        "verifier",
        providerError,
      ),
    ).rejects.toMatchObject({
      code: "authentication-failed",
      message: "Google Calendar authorization was rejected.",
    });
    await expect(
      revokeGoogleToken("private-token", vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"))),
    ).resolves.toBe(false);
  });
});
