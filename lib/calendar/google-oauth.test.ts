import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as start } from "@/app/api/calendar/google/start/route";
import { GET as callback } from "@/app/api/calendar/google/callback/route";
import { GET as session } from "@/app/api/calendar/google/session/route";
import { GET as calendars } from "@/app/api/calendar/google/calendars/route";
import { GET as availability } from "@/app/api/calendar/google/availability/route";
import { POST as disconnect } from "@/app/api/calendar/google/disconnect/route";
import { challengeFor, getGoogleConfig, readSession, seal, unseal } from "./google-oauth";

const origin = "http://localhost:3000";
const secret = "this-is-a-local-test-secret-with-more-than-32-characters";
const keys = ["GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET", "GOOGLE_CALENDAR_REDIRECT_URI", "CALENDAR_SESSION_SECRET"] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

function configured() {
  process.env.GOOGLE_CALENDAR_CLIENT_ID = "test-client";
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET = "test-secret";
  process.env.GOOGLE_CALENDAR_REDIRECT_URI = `${origin}/api/calendar/google/callback`;
  process.env.CALENDAR_SESSION_SECRET = secret;
}
function request(path: string, cookie?: string, init?: RequestInit) {
  return new NextRequest(`${origin}${path}`, { method: init?.method,
    headers: { ...(cookie ? { cookie } : {}), ...(init?.headers && !Array.isArray(init.headers) ? Object.fromEntries(new Headers(init.headers)) : {}) } });
}
function cookieOf(response: Response, name: string) {
  return response.headers.get("set-cookie")?.match(new RegExp(`${name}=([^;]+)`))?.[1];
}

afterEach(() => {
  for (const key of keys) if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key];
  vi.unstubAllGlobals();
});

describe("local Google Calendar connection", () => {
  it("rejects missing config and encrypts/tamper-protects cookie payloads", () => {
    expect(getGoogleConfig({})).toBeNull();
    expect(getGoogleConfig({ GOOGLE_CALENDAR_CLIENT_ID: "x", GOOGLE_CALENDAR_CLIENT_SECRET: "y",
      GOOGLE_CALENDAR_REDIRECT_URI: "not-a-url", CALENDAR_SESSION_SECRET: secret })).toBeNull();
    const encrypted = seal({ accessToken: "private" }, secret);
    expect(encrypted).not.toContain("private");
    expect(unseal(encrypted, secret)).toEqual({ accessToken: "private" });
    expect(unseal(encrypted.slice(0, -3) + "abc", secret)).toBeNull();
    expect(challengeFor("verifier")).toHaveLength(43);
  });

  it("starts a state and PKCE flow and rejects missing or wrong callback state", async () => {
    configured();
    const response = await start(request("/api/calendar/google/start"));
    const target = new URL(response.headers.get("location")!);
    expect(target.hostname).toBe("accounts.google.com");
    expect(target.searchParams.get("code_challenge_method")).toBe("S256");
    expect(target.searchParams.get("access_type")).toBe("online");
    const flow = cookieOf(response, "workpulse_google_flow");
    expect(flow).toBeTruthy();
    const wrong = await callback(request("/api/calendar/google/callback?state=wrong&code=x", `workpulse_google_flow=${flow}`));
    expect(wrong.headers.get("location")).toContain("error=state");
    expect(await session(request("/api/calendar/google/session"))).toHaveProperty("status", 200);
    expect(await (await session(request("/api/calendar/google/session"))).json()).toMatchObject({ configured: true, connected: false });
  });

  it("exchanges a valid code, reads calendar list/freebusy, and disconnects", async () => {
    configured();
    const started = await start(request("/api/calendar/google/start"));
    const target = new URL(started.headers.get("location")!);
    const flow = cookieOf(started, "workpulse_google_flow")!;
    const googleFetch = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/token")) {
        const form = init?.body as URLSearchParams;
        expect(form.get("code_verifier")).toBeTruthy();
        return Response.json({ access_token: "private-access-token", token_type: "Bearer", expires_in: 3600,
          scope: "https://www.googleapis.com/auth/calendar.events.freebusy https://www.googleapis.com/auth/calendar.calendarlist.readonly" });
      }
      expect(init?.headers).toMatchObject({ Authorization: "Bearer private-access-token" });
      if (url.includes("calendarList")) return Response.json({ items: [{ id: "primary", summary: "Main", primary: true }] });
      if (url.includes("freeBusy")) return Response.json({ calendars: { primary: { busy: [] } } });
      return new Response(null, { status: 200 });
    });
    vi.stubGlobal("fetch", googleFetch);
    const result = await callback(request(`/api/calendar/google/callback?state=${target.searchParams.get("state")}&code=valid`, `workpulse_google_flow=${flow}`));
    expect(result.headers.get("location")).toContain("connected=1");
    const sessionCookie = cookieOf(result, "workpulse_google_session")!;
    expect(sessionCookie).not.toContain("private-access-token");
    const header = `workpulse_google_session=${sessionCookie}`;
    expect((await (await session(request("/api/calendar/google/session", header))).json()).connected).toBe(true);
    expect((await (await calendars(request("/api/calendar/google/calendars", header))).json()).calendars).toEqual([{ id: "primary", name: "Main", primary: true }]);
    const freebusy = await availability(request("/api/calendar/google/availability?calendarId=primary", header));
    expect((await freebusy.json()).context.isBusy).toBe(false);
    expect((await disconnect(request("/api/calendar/google/disconnect", header, { method: "POST", headers: { origin } }))).status).toBe(200);
  });

  it("rejects expired sessions, missing calendar selection, and cross-origin disconnect", async () => {
    configured();
    const config = getGoogleConfig()!;
    const expired = seal({ accessToken: "old", expiresAt: Date.now() - 1000 }, secret);
    expect(readSession(expired, config)).toBeNull();
    expect((await availability(request("/api/calendar/google/availability"))).status).toBe(401);
    const current = seal({ accessToken: "valid", expiresAt: Date.now() + 3600_000 }, secret);
    expect((await availability(request("/api/calendar/google/availability", `workpulse_google_session=${current}`))).status).toBe(400);
    expect((await disconnect(request("/api/calendar/google/disconnect", undefined, { method: "POST", headers: { origin: "https://evil.example" } }))).status).toBe(403);
  });
});
