import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET as availability } from "@/app/api/calendar/google/availability/route";
import { GET as callback } from "@/app/api/calendar/google/callback/route";
import { GET as connect } from "@/app/api/calendar/google/connect/route";
import { POST as disconnect } from "@/app/api/calendar/google/disconnect/route";
import { GET as status } from "@/app/api/calendar/google/status/route";
import { GOOGLE_CALENDAR_FREEBUSY_SCOPE } from "@/lib/calendar/google";
import {
  GOOGLE_FLOW_COOKIE,
  GOOGLE_SESSION_COOKIE,
  createGoogleCalendarSession,
  sealCalendarValue,
} from "@/lib/calendar/google-session";

const sessionSecret = "a-secure-session-secret-that-is-long-enough";

function request(path: string, cookie?: string, init?: RequestInit): NextRequest {
  const headers = new Headers(init?.headers);
  if (cookie) headers.set("cookie", cookie);
  const { signal, ...requestInit } = init ?? {};
  return new NextRequest(`https://workpulse.example${path}`, {
    ...requestInit,
    ...(signal ? { signal } : {}),
    headers,
  });
}

function sessionCookie(expiresAt = Date.now() + 3_600_000): string {
  const session = createGoogleCalendarSession({
    accessToken: "private-access-token",
    refreshToken: "private-refresh-token",
    expiresAt,
    scope: GOOGLE_CALENDAR_FREEBUSY_SCOPE,
  });
  return `${GOOGLE_SESSION_COOKIE}=${sealCalendarValue(session, sessionSecret)}`;
}

describe("Google Calendar OAuth route handlers", () => {
  beforeEach(() => {
    vi.stubEnv("GOOGLE_CALENDAR_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_CALENDAR_CLIENT_SECRET", "client-secret");
    vi.stubEnv(
      "GOOGLE_CALENDAR_REDIRECT_URI",
      "https://workpulse.example/api/calendar/google/callback",
    );
    vi.stubEnv("CALENDAR_SESSION_SECRET", sessionSecret);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("starts a redirect flow with PKCE and an HttpOnly state cookie", async () => {
    const response = await connect();

    expect(response.status).toBe(307);
    const destination = new URL(response.headers.get("location") ?? "");
    expect(destination.origin).toBe("https://accounts.google.com");
    expect(destination.searchParams.get("scope")).toBe(
      GOOGLE_CALENDAR_FREEBUSY_SCOPE,
    );
    expect(destination.searchParams.get("code_challenge_method")).toBe("S256");
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${GOOGLE_FLOW_COOKIE}=`);
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
  });

  it("keeps manual mode available when OAuth is not configured", async () => {
    vi.stubEnv("CALENDAR_SESSION_SECRET", "");
    const response = await connect();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      status: "configuration-required",
    });
  });

  it("exchanges a valid callback and stores only an encrypted session", async () => {
    const state = "expected-state";
    const flow = sealCalendarValue(
      { state, codeVerifier: "pkce-verifier", createdAt: Date.now() },
      sessionSecret,
    );
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          access_token: "private-access-token",
          refresh_token: "private-refresh-token",
          expires_in: 3600,
          scope: GOOGLE_CALENDAR_FREEBUSY_SCOPE,
        }),
      ),
    );

    const response = await callback(
      request(
        `/api/calendar/google/callback?code=auth-code&state=${state}`,
        `${GOOGLE_FLOW_COOKIE}=${flow}`,
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://workpulse.example/?calendar=connected",
    );
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${GOOGLE_SESSION_COOKIE}=`);
    expect(cookie).not.toContain("private-access-token");
    expect(cookie).not.toContain("private-refresh-token");
  });

  it("rejects callbacks with an invalid state before contacting Google", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const flow = sealCalendarValue(
      { state: "expected", codeVerifier: "verifier", createdAt: Date.now() },
      sessionSecret,
    );

    const response = await callback(
      request(
        "/api/calendar/google/callback?code=auth-code&state=attacker",
        `${GOOGLE_FLOW_COOKIE}=${flow}`,
      ),
    );

    expect(response.headers.get("location")).toContain(
      "calendar=connection-failed",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns safe connection status without exposing credentials", async () => {
    const response = await status(
      request("/api/calendar/google/status", sessionCookie()),
    );
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(200);
    expect(serialized).toContain('"connected":true');
    expect(serialized).not.toContain("private-access-token");
    expect(serialized).not.toContain("private-refresh-token");
  });

  it("reads a bounded FreeBusy window through the server session", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        calendars: {
          primary: {
            busy: [
              {
                start: "2026-09-26T12:30:00.000Z",
                end: "2026-09-26T13:00:00.000Z",
              },
            ],
          },
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const response = await availability(
      request(
        "/api/calendar/google/availability?timeMin=2026-09-26T12%3A00%3A00.000Z&timeMax=2026-09-26T14%3A00%3A00.000Z",
        sessionCookie(Date.now() + 24 * 60 * 60 * 1_000),
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "available",
      snapshot: { providerId: "google" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes once and retries when Google rejects an apparently fresh token", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        Response.json({ access_token: "replacement-access", expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        Response.json({ calendars: { primary: { busy: [] } } }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const response = await availability(
      request(
        "/api/calendar/google/availability?timeMin=2026-09-26T12%3A00%3A00.000Z&timeMax=2026-09-26T14%3A00%3A00.000Z",
        sessionCookie(Date.now() + 24 * 60 * 60 * 1_000),
      ),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(response.headers.get("set-cookie")).toContain(
      `${GOOGLE_SESSION_COOKIE}=`,
    );
    expect(response.headers.get("set-cookie")).not.toContain(
      "replacement-access",
    );
  });

  it("requires same-origin POST but always deletes local tokens after disconnect", async () => {
    const rejected = await disconnect(
      request("/api/calendar/google/disconnect", sessionCookie(), {
        method: "POST",
        headers: { origin: "https://attacker.example" },
      }),
    );
    expect(rejected.status).toBe(403);

    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 500 })),
    );
    const response = await disconnect(
      request("/api/calendar/google/disconnect", sessionCookie(), {
        method: "POST",
        headers: { origin: "https://workpulse.example" },
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      connected: false,
      revocationConfirmed: false,
    });
    expect(response.headers.get("set-cookie")).toContain(
      `${GOOGLE_SESSION_COOKIE}=;`,
    );
  });
});
