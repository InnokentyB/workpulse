import { describe, expect, it } from "vitest";

import { GOOGLE_CALENDAR_FREEBUSY_SCOPE } from "@/lib/calendar/google";
import {
  createGoogleCalendarSession,
  isGoogleCalendarSession,
  sealCalendarValue,
  statesMatch,
  unsealCalendarValue,
} from "@/lib/calendar/google-session";

const secret = "a-secure-session-secret-that-is-long-enough";

describe("Google Calendar encrypted session", () => {
  it("round-trips credentials without leaving plaintext in the cookie", () => {
    const session = createGoogleCalendarSession(
      {
        accessToken: "private-access-token",
        refreshToken: "private-refresh-token",
        expiresAt: 123456,
        scope: GOOGLE_CALENDAR_FREEBUSY_SCOPE,
      },
      new Date(1000),
    );
    const sealed = sealCalendarValue(session, secret);

    expect(sealed).not.toContain("private-access-token");
    expect(unsealCalendarValue(sealed, secret)).toEqual(session);
    expect(isGoogleCalendarSession(unsealCalendarValue(sealed, secret))).toBe(true);
  });

  it("rejects tampering, wrong keys, and malformed sessions", () => {
    const sealed = sealCalendarValue({ accessToken: "secret" }, secret);
    const [iv, tag, encrypted] = sealed.split(".");
    const tampered = `${iv}.${tag}.${encrypted.startsWith("A") ? "B" : "A"}${encrypted.slice(1)}`;
    expect(unsealCalendarValue(tampered, secret)).toBeNull();
    expect(unsealCalendarValue(`${sealed}x`, secret)).toBeNull();
    expect(unsealCalendarValue(sealed, `${secret}-other`)).toBeNull();
    expect(isGoogleCalendarSession({} as never)).toBe(false);
  });

  it("compares OAuth state without accepting different values", () => {
    expect(statesMatch("same-state", "same-state")).toBe(true);
    expect(statesMatch("same-state", "other-state")).toBe(false);
  });
});
