import { describe, expect, it } from "vitest";

import {
  ACTIVITY_HISTORY_STORAGE_KEY,
  ACTIVITY_HISTORY_VERSION,
  loadActivityHistory,
  minutesSinceLastCompletion,
  recentActivityIds,
  recordActivityCompletion,
  saveActivityHistory,
  type ActivityHistoryEntry,
  type StorageLike,
} from "@/lib/activity-history";

function memoryStorage(initial?: Record<string, string>): StorageLike {
  const values = new Map(Object.entries(initial ?? {}));

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

const entries: ActivityHistoryEntry[] = [
  {
    activityId: "neck-reset",
    completedAt: "2026-09-25T08:00:00.000Z",
    completionMode: "camera",
  },
  {
    activityId: "shoulder-reset",
    completedAt: "2026-09-25T09:00:00.000Z",
    completionMode: "timer",
  },
];

describe("activity history", () => {
  it("returns an empty history when storage is absent or malformed", () => {
    expect(loadActivityHistory(memoryStorage())).toEqual([]);
    expect(
      loadActivityHistory(
        memoryStorage({ [ACTIVITY_HISTORY_STORAGE_KEY]: "not-json" }),
      ),
    ).toEqual([]);
    expect(
      loadActivityHistory(
        memoryStorage({
          [ACTIVITY_HISTORY_STORAGE_KEY]: JSON.stringify({
            version: ACTIVITY_HISTORY_VERSION + 1,
            entries,
          }),
        }),
      ),
    ).toEqual([]);
  });

  it("loads only valid entries from the current payload version", () => {
    const storage = memoryStorage({
      [ACTIVITY_HISTORY_STORAGE_KEY]: JSON.stringify({
        version: ACTIVITY_HISTORY_VERSION,
        entries: [
          ...entries,
          { activityId: "", completedAt: "bad-date", completionMode: "camera" },
          {
            activityId: "full-body-reset",
            completedAt: "2026-09-25T10:00:00.000Z",
            completionMode: "unknown",
          },
        ],
      }),
    });

    expect(loadActivityHistory(storage)).toEqual(entries);
  });

  it("records a completion with an injected clock and persists it", () => {
    const storage = memoryStorage();

    const updated = recordActivityCompletion(
      storage,
      { activityId: "neck-reset", completionMode: "manual" },
      () => new Date("2026-09-25T12:34:56.000Z"),
    );

    expect(updated).toEqual([
      {
        activityId: "neck-reset",
        completedAt: "2026-09-25T12:34:56.000Z",
        completionMode: "manual",
      },
    ]);
    expect(loadActivityHistory(storage)).toEqual(updated);
  });

  it("keeps the newest completions when history exceeds its limit", () => {
    const storage = memoryStorage();
    const history = Array.from({ length: 5 }, (_, index) => ({
      activityId: `activity-${index}`,
      completedAt: new Date(Date.UTC(2026, 8, 25, 10, index)).toISOString(),
      completionMode: "timer" as const,
    }));

    expect(saveActivityHistory(storage, history, { limit: 3 })).toBe(true);
    expect(loadActivityHistory(storage)).toEqual(history.slice(-3));
  });

  it("calculates minutes since the latest completion", () => {
    expect(
      minutesSinceLastCompletion(
        entries,
        new Date("2026-09-25T09:45:00.000Z"),
      ),
    ).toBe(45);
    expect(minutesSinceLastCompletion([], new Date())).toBeNull();
  });

  it("returns unique recent activity ids inside the cooldown", () => {
    const history: ActivityHistoryEntry[] = [
      ...entries,
      {
        activityId: "neck-reset",
        completedAt: "2026-09-25T09:40:00.000Z",
        completionMode: "manual",
      },
      {
        activityId: "full-body-reset",
        completedAt: "2026-09-25T07:00:00.000Z",
        completionMode: "timer",
      },
    ];

    expect(
      recentActivityIds(
        history,
        60,
        new Date("2026-09-25T10:00:00.000Z"),
      ),
    ).toEqual(["neck-reset", "shoulder-reset"]);
  });

  it("survives storage access failures", () => {
    const brokenStorage: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("full");
      },
    };

    expect(loadActivityHistory(brokenStorage)).toEqual([]);
    expect(saveActivityHistory(brokenStorage, entries)).toBe(false);
    expect(() =>
      recordActivityCompletion(
        brokenStorage,
        { activityId: "neck-reset", completionMode: "camera" },
        () => new Date("2026-09-25T10:00:00.000Z"),
      ),
    ).not.toThrow();
  });
});
