import { describe, expect, it } from "vitest";

import {
  getActivityPreferenceSignals,
  loadActivityFeedback,
  recordActivityFeedback,
  type ActivityFeedbackStorage,
} from "@/lib/activity-feedback";

function memoryStorage(): ActivityFeedbackStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe("activity feedback", () => {
  it("records optional load and repeat feedback locally", () => {
    const storage = memoryStorage();

    const record = recordActivityFeedback(
      storage,
      {
        activityId: "neck-reset",
        load: "just-right",
        repeat: "yes",
      },
      () => new Date("2026-09-26T10:30:00.000Z"),
    );

    expect(record).toEqual({
      activityId: "neck-reset",
      load: "just-right",
      repeat: "yes",
      submittedAt: "2026-09-26T10:30:00.000Z",
    });
    expect(loadActivityFeedback(storage)).toEqual([record]);
  });

  it("derives preference signals without permanently excluding an activity", () => {
    const storage = memoryStorage();
    recordActivityFeedback(storage, {
      activityId: "neck-reset",
      load: "just-right",
      repeat: "yes",
    });
    recordActivityFeedback(storage, {
      activityId: "shoulder-rolls",
      load: "too-hard",
      repeat: "not-sure",
    });
    recordActivityFeedback(storage, {
      activityId: "eye-care-break",
      load: "skipped",
      repeat: "no",
    });

    expect(getActivityPreferenceSignals(storage)).toEqual({
      preferredActivityIds: ["neck-reset"],
      deprioritizedActivityIds: ["shoulder-rolls", "eye-care-break"],
    });
  });

  it("ignores malformed stored feedback", () => {
    const storage = memoryStorage();
    storage.setItem("workpulse.activity-feedback", "not-json");

    expect(loadActivityFeedback(storage)).toEqual([]);
  });
});
