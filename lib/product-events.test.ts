import { describe, expect, it } from "vitest";

import {
  loadProductEvents,
  recordProductEvent,
  summarizeProductEvents,
  type ProductEventStorage,
} from "@/lib/product-events";

function memoryStorage(): ProductEventStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe("privacy-preserving product events", () => {
  it("stores only an allow-listed event name, time, and optional activity id", () => {
    const storage = memoryStorage();
    const event = recordProductEvent(
      storage,
      { name: "activity_completed", activityId: "neck-reset" },
      () => new Date("2026-09-26T12:00:00.000Z"),
    );

    expect(event).toEqual({
      name: "activity_completed",
      activityId: "neck-reset",
      occurredAt: "2026-09-26T12:00:00.000Z",
    });
    expect(loadProductEvents(storage)).toEqual([event]);
  });

  it("summarizes the local decision funnel", () => {
    const storage = memoryStorage();
    recordProductEvent(storage, { name: "decision_shown" });
    recordProductEvent(storage, { name: "activity_started", activityId: "neck-reset" });
    recordProductEvent(storage, { name: "activity_completed", activityId: "neck-reset" });
    recordProductEvent(storage, { name: "feedback_submitted", activityId: "neck-reset" });

    expect(summarizeProductEvents(storage)).toMatchObject({
      decision_shown: 1,
      activity_started: 1,
      activity_completed: 1,
      feedback_submitted: 1,
      activity_dismissed: 0,
    });
  });

  it("ignores malformed local event data", () => {
    const storage = memoryStorage();
    storage.setItem("workpulse.product-events", "not-json");
    expect(loadProductEvents(storage)).toEqual([]);
  });
});
