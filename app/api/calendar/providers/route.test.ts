import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/calendar/providers/route";

describe("calendar provider discovery API", () => {
  it("returns public metadata without leaking server credentials", async () => {
    vi.stubEnv("GOOGLE_CALENDAR_CLIENT_ID", "secret-client-id");
    vi.stubEnv("GOOGLE_CALENDAR_CLIENT_SECRET", "secret-client-value");
    vi.stubEnv("AUTH_SECRET", "session-secret");
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/workpulse");
    vi.stubEnv("CALENDAR_TOKEN_ENCRYPTION_KEY", Buffer.alloc(32).toString("base64"));
    vi.stubEnv(
      "GOOGLE_CALENDAR_REDIRECT_URI",
      "http://localhost:3000/api/calendar/google/callback",
    );

    const response = await GET();
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.providers[0]).toMatchObject({
      id: "google",
      status: "configured",
    });
    expect(serialized).not.toContain("secret-client-id");
    expect(serialized).not.toContain("secret-client-value");

    vi.unstubAllEnvs();
  });
});
