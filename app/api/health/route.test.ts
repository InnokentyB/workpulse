import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/health/route";

describe("health API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a non-cached, credential-free service status", async () => {
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "1234567890abcdef");
    vi.stubEnv("GOOGLE_CALENDAR_CLIENT_SECRET", "must-not-leak");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(body).toMatchObject({
      status: "ok",
      service: "workpulse",
      revision: "1234567890ab",
    });
    expect(Number.isNaN(Date.parse(body.checkedAt))).toBe(false);
    expect(JSON.stringify(body)).not.toContain("must-not-leak");
  });
});
