import { describe, expect, it } from "vitest";

import {
  ACTIVITY_PREFERENCES_STORAGE_KEY,
  DEFAULT_ACTIVITY_PREFERENCES,
  applyOnboardingAnswers,
  loadActivityPreferences,
  preferredActivityIds,
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
      ...DEFAULT_ACTIVITY_PREFERENCES,
      cameraAllowed: false,
      canLeaveDesk: true,
      canStand: true,
      excludedActivityIds: ["wall-push-ups"],
    };

    saveActivityPreferences(storage, preferences);
    expect(loadActivityPreferences(storage)).toEqual(preferences);
  });

  it("maps onboarding answers into current workspace constraints", () => {
    const next = applyOnboardingAnswers(DEFAULT_ACTIVITY_PREFERENCES, {
      workplace: "office",
      visibility: "on-video",
      breakSpace: "outside",
      hasDistantView: true,
      preferredFormats: ["walk", "desk"],
      avoidJumpsOrFloor: true,
    });

    expect(next.onboardingStatus).toBe("completed");
    expect(next.canStand).toBe(false);
    expect(next.canLeaveDesk).toBe(false);
    expect(preferredActivityIds(next)).toEqual([
      "purposeful-walk",
      "eye-care-break",
      "neck-reset",
      "shoulder-rolls",
    ]);
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
