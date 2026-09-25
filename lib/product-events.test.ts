import { describe, expect, it } from "vitest";

import {
  PRODUCT_EVENT_STORAGE_KEY,
  createProductEventTracker,
  type ProductEventName,
  type StorageLike,
} from "./product-events";

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const eventNames: ProductEventName[] = [
  "recommendation_shown",
  "activity_started",
  "activity_completed",
  "activity_completed_manual",
  "camera_permission_denied",
  "camera_start_failed",
  "activity_skipped",
];

describe("product event tracker", () => {
  it.each(eventNames)("records %s in the versioned queue", (name) => {
    const storage = new MemoryStorage();
    const tracker = createProductEventTracker({
      storage,
      now: () => new Date("2026-09-25T09:30:00.000Z"),
    });

    const event = tracker.track(name, {
      activityId: "neck-reset",
      reason: "test",
      context: { meetingWindowMinutes: 10, cameraEnabled: true },
    });

    expect(event).toEqual({
      schemaVersion: 1,
      name,
      activityId: "neck-reset",
      timestamp: "2026-09-25T09:30:00.000Z",
      reason: "test",
      context: { meetingWindowMinutes: 10, cameraEnabled: true },
    });
    expect(JSON.parse(storage.getItem(PRODUCT_EVENT_STORAGE_KEY)!)).toEqual({
      version: 1,
      events: [event],
    });
  });

  it("keeps only the newest events when the queue reaches its bound", () => {
    const tracker = createProductEventTracker({
      storage: new MemoryStorage(),
      maxEvents: 2,
    });

    tracker.track("activity_started", { activityId: "first" });
    tracker.track("activity_started", { activityId: "second" });
    tracker.track("activity_started", { activityId: "third" });

    expect(tracker.getEvents().map((event) => event.activityId)).toEqual([
      "second",
      "third",
    ]);
  });

  it("recovers from malformed or incompatible stored data", () => {
    const storage = new MemoryStorage();
    storage.setItem(PRODUCT_EVENT_STORAGE_KEY, "not-json");

    const tracker = createProductEventTracker({ storage });
    expect(tracker.getEvents()).toEqual([]);

    tracker.track("recommendation_shown", { activityId: "shoulder-reset" });
    expect(tracker.getEvents()).toHaveLength(1);

    storage.setItem(
      PRODUCT_EVENT_STORAGE_KEY,
      JSON.stringify({ version: 999, events: [{ unsafe: true }] }),
    );
    expect(createProductEventTracker({ storage }).getEvents()).toEqual([]);
  });

  it("continues in memory when storage reads or writes fail", () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    const tracker = createProductEventTracker({ storage });

    expect(() =>
      tracker.track("camera_start_failed", {
        activityId: "neck-reset",
        reason: "unavailable",
      }),
    ).not.toThrow();
    expect(tracker.getEvents()).toMatchObject([
      { name: "camera_start_failed", activityId: "neck-reset" },
    ]);
    expect(() => tracker.clear()).not.toThrow();
    expect(tracker.getEvents()).toEqual([]);
  });

  it("drops non-primitive context values to avoid accidental rich payloads", () => {
    const tracker = createProductEventTracker();
    const unsafeContext = {
      stage: "left",
      confidence: 0.92,
      landmarks: [{ x: 1, y: 2 }],
      frame: new Uint8Array([1, 2]),
      empty: null,
      missing: undefined,
    } as unknown as Record<string, string | number | boolean | null>;

    const event = tracker.track("activity_completed", {
      activityId: "neck-reset",
      context: unsafeContext,
    });

    expect(event.context).toEqual({
      stage: "left",
      confidence: 0.92,
      empty: null,
    });
  });

  it("works without browser globals and returns defensive queue copies", () => {
    const tracker = createProductEventTracker();
    tracker.track("activity_skipped", { activityId: "full-body-reset" });

    const events = tracker.getEvents();
    events.length = 0;

    expect(tracker.getEvents()).toHaveLength(1);
  });
});
