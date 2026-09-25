import { describe, expect, it } from "vitest";

import {
  decryptCalendarToken,
  encryptCalendarToken,
} from "@/lib/auth/token-crypto";

describe("calendar token encryption", () => {
  const key = Buffer.alloc(32, 11).toString("base64");

  it("round-trips a token without storing it as plaintext", () => {
    const encrypted = encryptCalendarToken("refresh-token-value", key);

    expect(encrypted).not.toContain("refresh-token-value");
    expect(decryptCalendarToken(encrypted, key)).toBe("refresh-token-value");
  });

  it("uses a fresh initialization vector for every value", () => {
    expect(encryptCalendarToken("same-token", key)).not.toBe(
      encryptCalendarToken("same-token", key),
    );
  });

  it("rejects malformed keys and tampered ciphertext", () => {
    expect(() => encryptCalendarToken("token", "not-a-key")).toThrow(
      "32-byte",
    );

    const encrypted = encryptCalendarToken("token", key);
    expect(() => decryptCalendarToken(`${encrypted}broken`, key)).toThrow();
  });
});
