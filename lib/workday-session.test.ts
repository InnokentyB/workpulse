import { describe, expect, it } from "vitest";

import type { ActivityHistoryEntry } from "@/lib/activity-history";
import {
  DEFAULT_WORKDAY_SETTINGS,
  WORKDAY_SESSION_STORAGE_KEY,
  WORKDAY_SETTINGS_STORAGE_KEY,
  createManualWorkContext,
  endManualWorkSession,
  isWithinWorkday,
  loadManualWorkSession,
  loadWorkdaySettings,
  saveWorkdaySettings,
  startManualWorkSession,
  validateWorkdaySettings,
  type WorkdayStorage,
} from "@/lib/workday-session";

function memoryStorage(): WorkdayStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
}

describe("manual workday session", () => {
  it("persists workday settings and rejects an empty window", () => {
    const storage = memoryStorage();
    expect(loadWorkdaySettings(storage)).toEqual(DEFAULT_WORKDAY_SETTINGS);
    expect(validateWorkdaySettings({ startTime: "09:00", endTime: "09:00" })).toMatch(
      /different/i,
    );
    expect(saveWorkdaySettings(storage, { startTime: "08:30", endTime: "17:15" })).toBe(
      true,
    );
    expect(storage.values.has(WORKDAY_SETTINGS_STORAGE_KEY)).toBe(true);
    expect(loadWorkdaySettings(storage)).toEqual({
      startTime: "08:30",
      endTime: "17:15",
    });
  });

  it("starts, restores and ends a session", () => {
    const storage = memoryStorage();
    const started = startManualWorkSession(storage, new Date("2026-09-26T09:15:00Z"));
    expect(started?.persisted).toBe(true);
    expect(loadManualWorkSession(storage)).toEqual({
      startedAt: "2026-09-26T09:15:00.000Z",
    });
    expect(endManualWorkSession(storage)).toBe(true);
    expect(storage.values.has(WORKDAY_SESSION_STORAGE_KEY)).toBe(false);
  });

  it("builds live context from the session and latest completion", () => {
    const history: ActivityHistoryEntry[] = [
      {
        activityId: "neck-reset",
        activityName: "Neck reset",
        completedAt: "2026-09-26T10:05:00.000Z",
        completionMode: "manual",
        durationSeconds: 45,
        movements: 0,
      },
    ];
    const context = createManualWorkContext(
      { startedAt: "2026-09-26T09:00:00.000Z" },
      history,
      new Date("2026-09-26T10:37:30.000Z"),
    );
    expect(context).toMatchObject({
      sedentaryMinutes: 32,
      minutesSinceLastActivity: 32,
      minutesToNextMeeting: null,
    });
  });

  it("recognizes daytime and overnight work windows", () => {
    expect(
      isWithinWorkday(
        { startTime: "09:00", endTime: "18:00" },
        new Date("2026-09-26T12:00:00"),
      ),
    ).toBe(true);
    expect(
      isWithinWorkday(
        { startTime: "22:00", endTime: "06:00" },
        new Date("2026-09-26T23:00:00"),
      ),
    ).toBe(true);
  });
});
