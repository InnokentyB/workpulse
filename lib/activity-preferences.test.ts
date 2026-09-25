import { describe, expect, it } from "vitest";

import {
  ACTIVITY_PREFERENCES_STORAGE_KEY,
  DEFAULT_ACTIVITY_PREFERENCES,
  loadActivityPreferences,
  saveActivityPreferences,
  type ActivityPreferencesStorage,
} from "@/lib/activity-preferences";

function memoryStorage(initial?: string): ActivityPreferencesStorage {
  const values = new Map<string, string>();
  if (initial) values.set(ACTIVITY_PREFERENCES_STORAGE_KEY, initial);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe("activity preferences", () => {
  it("uses desk-safe defaults when no settings are saved", () => {
    expect(loadActivityPreferences(memoryStorage())).toEqual(
      DEFAULT_ACTIVITY_PREFERENCES,
    );
  });

  it("persists workspace constraints and exclusions", () => {
    const storage = memoryStorage();
    const preferences = {
      cameraAllowed: false,
      canLeaveDesk: true,
      canStand: true,
      excludedActivityIds: ["wall-push-ups"],
    };

    saveActivityPreferences(storage, preferences);
    expect(loadActivityPreferences(storage)).toEqual(preferences);
  });

  it("falls back safely for malformed or unknown settings", () => {
    expect(loadActivityPreferences(memoryStorage("not-json"))).toEqual(
      DEFAULT_ACTIVITY_PREFERENCES,
    );
    expect(
      loadActivityPreferences(
        memoryStorage(
          JSON.stringify({
            cameraAllowed: true,
            canLeaveDesk: "yes",
            canStand: false,
            excludedActivityIds: [],
          }),
        ),
      ),
    ).toEqual(DEFAULT_ACTIVITY_PREFERENCES);
  });
});
