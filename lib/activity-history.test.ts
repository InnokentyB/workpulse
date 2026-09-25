import { describe, expect, it } from "vitest";

import {
  ACTIVITY_HISTORY_STORAGE_KEY,
  ACTIVITY_HISTORY_VERSION,
  loadActivityHistory,
  recordActivityCompletion,
  type StorageLike,
} from "@/lib/activity-history";

function memoryStorage(initial?: string): StorageLike {
  const values = new Map<string, string>();
  if (initial) values.set(ACTIVITY_HISTORY_STORAGE_KEY, initial);

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

const completion = {
  activityId: "neck-reset",
  activityName: "Neck reset",
  completionMode: "camera" as const,
  durationSeconds: 45,
  movements: 4,
};

describe("activity history", () => {
  it("returns an empty history when local data is absent or malformed", () => {
    expect(loadActivityHistory(memoryStorage())).toEqual([]);
    expect(loadActivityHistory(memoryStorage("not-json"))).toEqual([]);
  });

  it("records and restores a completed activity", () => {
    const storage = memoryStorage();
    const history = recordActivityCompletion(
      storage,
      completion,
      () => new Date("2026-09-25T14:30:00.000Z"),
    );

    expect(history).toEqual([
      { ...completion, completedAt: "2026-09-25T14:30:00.000Z" },
    ]);
    expect(loadActivityHistory(storage)).toEqual(history);
  });

  it("ignores payloads from other versions and invalid entries", () => {
    const wrongVersion = JSON.stringify({
      entries: [],
      version: ACTIVITY_HISTORY_VERSION - 1,
    });
    expect(loadActivityHistory(memoryStorage(wrongVersion))).toEqual([]);

    const invalidEntry = JSON.stringify({
      entries: [{ ...completion, durationSeconds: -1, completedAt: "bad" }],
      version: ACTIVITY_HISTORY_VERSION,
    });
    expect(loadActivityHistory(memoryStorage(invalidEntry))).toEqual([]);
  });

  it("keeps the session result when browser storage cannot be written", () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error("storage unavailable");
      },
    };

    expect(recordActivityCompletion(storage, completion)).toHaveLength(1);
  });
});
