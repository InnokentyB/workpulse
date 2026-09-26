import { describe, expect, it } from "vitest";

import {
  getActiveDismissal,
  loadDismissals,
  recordDismissal,
  type CooldownStorage,
} from "@/lib/intervention-cooldown";

function memoryStorage(): CooldownStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe("intervention cooldown", () => {
  it("records a dismissal with the canonical fifteen minute cooldown", () => {
    const storage = memoryStorage();

    const record = recordDismissal(
      storage,
      "neck-reset",
      () => new Date("2026-09-26T09:00:00.000Z"),
    );

    expect(record).toEqual({
      activityId: "neck-reset",
      dismissedAt: "2026-09-26T09:00:00.000Z",
      cooldownUntil: "2026-09-26T09:15:00.000Z",
    });
    expect(loadDismissals(storage)).toEqual([record]);
  });

  it("returns only a dismissal whose cooldown is still active", () => {
    const storage = memoryStorage();
    recordDismissal(
      storage,
      "neck-reset",
      () => new Date("2026-09-26T09:00:00.000Z"),
    );

    expect(
      getActiveDismissal(storage, () => new Date("2026-09-26T09:14:59.000Z")),
    ).not.toBeNull();
    expect(
      getActiveDismissal(storage, () => new Date("2026-09-26T09:15:00.000Z")),
    ).toBeNull();
  });

  it("treats malformed storage as empty", () => {
    const storage = memoryStorage();
    storage.setItem("workpulse.intervention-dismissals", "not-json");

    expect(loadDismissals(storage)).toEqual([]);
    expect(getActiveDismissal(storage)).toBeNull();
  });
});
