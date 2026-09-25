export const ACTIVITY_PREFERENCES_STORAGE_KEY =
  "workpulse.activity-preferences";
const ACTIVITY_PREFERENCES_VERSION = 1;

export type ActivityPreferences = {
  cameraAllowed: boolean;
  canLeaveDesk: boolean;
  canStand: boolean;
  excludedActivityIds: string[];
};

export type ActivityPreferencesStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export const DEFAULT_ACTIVITY_PREFERENCES: ActivityPreferences = {
  cameraAllowed: true,
  canLeaveDesk: false,
  canStand: false,
  excludedActivityIds: [],
};

function isPreferences(value: unknown): value is ActivityPreferences {
  if (!value || typeof value !== "object") return false;
  const preferences = value as Partial<ActivityPreferences>;
  return (
    typeof preferences.cameraAllowed === "boolean" &&
    typeof preferences.canLeaveDesk === "boolean" &&
    typeof preferences.canStand === "boolean" &&
    Array.isArray(preferences.excludedActivityIds) &&
    preferences.excludedActivityIds.every(
      (id) => typeof id === "string" && id.trim().length > 0,
    )
  );
}

export function loadActivityPreferences(
  storage: ActivityPreferencesStorage,
): ActivityPreferences {
  try {
    const serialized = storage.getItem(ACTIVITY_PREFERENCES_STORAGE_KEY);
    if (!serialized) return { ...DEFAULT_ACTIVITY_PREFERENCES };
    const payload = JSON.parse(serialized) as {
      version?: unknown;
      preferences?: unknown;
    };
    return payload.version === ACTIVITY_PREFERENCES_VERSION &&
      isPreferences(payload.preferences)
      ? { ...payload.preferences }
      : { ...DEFAULT_ACTIVITY_PREFERENCES };
  } catch {
    return { ...DEFAULT_ACTIVITY_PREFERENCES };
  }
}

export function saveActivityPreferences(
  storage: ActivityPreferencesStorage,
  preferences: ActivityPreferences,
): void {
  if (!isPreferences(preferences)) return;
  try {
    storage.setItem(
      ACTIVITY_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        version: ACTIVITY_PREFERENCES_VERSION,
        preferences,
      }),
    );
  } catch {
    // The active session can continue if browser storage is unavailable.
  }
}
