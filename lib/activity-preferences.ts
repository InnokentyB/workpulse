export const ACTIVITY_PREFERENCES_STORAGE_KEY =
  "workpulse.activity-preferences";
const ACTIVITY_PREFERENCES_VERSION = 1;

export type Workplace = "home" | "office" | "other";
export type WorkplaceVisibility = "private" | "people-nearby" | "on-video";
export type BreakSpace = "desk-only" | "room" | "balcony" | "outside";
export type PreferredActivityFormat =
  | "walk"
  | "stretch"
  | "dance"
  | "strength"
  | "desk";

export type OnboardingAnswers = {
  workplace: Workplace;
  visibility: WorkplaceVisibility;
  breakSpace: BreakSpace;
  hasDistantView: boolean;
  preferredFormats: PreferredActivityFormat[];
  avoidJumpsOrFloor: boolean;
};

export type ActivityPreferences = {
  cameraAllowed: boolean;
  canLeaveDesk: boolean;
  canStand: boolean;
  excludedActivityIds: string[];
  onboardingStatus?: "new" | "completed" | "skipped";
  onboardingAnswers?: OnboardingAnswers | null;
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
  onboardingStatus: "new",
  onboardingAnswers: null,
};

const ACTIVITY_IDS_BY_FORMAT: Record<
  PreferredActivityFormat,
  readonly string[]
> = {
  walk: ["purposeful-walk"],
  stretch: ["neck-reset", "shoulder-rolls"],
  dance: [],
  strength: ["wall-push-ups"],
  desk: ["eye-care-break", "neck-reset", "shoulder-rolls"],
};

function isOnboardingAnswers(value: unknown): value is OnboardingAnswers {
  if (!value || typeof value !== "object") return false;
  const answers = value as Partial<OnboardingAnswers>;
  return (
    ["home", "office", "other"].includes(answers.workplace ?? "") &&
    ["private", "people-nearby", "on-video"].includes(
      answers.visibility ?? "",
    ) &&
    ["desk-only", "room", "balcony", "outside"].includes(
      answers.breakSpace ?? "",
    ) &&
    typeof answers.hasDistantView === "boolean" &&
    Array.isArray(answers.preferredFormats) &&
    answers.preferredFormats.length <= 2 &&
    answers.preferredFormats.every((format) =>
      ["walk", "stretch", "dance", "strength", "desk"].includes(format),
    ) &&
    typeof answers.avoidJumpsOrFloor === "boolean"
  );
}

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
    ) &&
    (preferences.onboardingStatus === undefined ||
      ["new", "completed", "skipped"].includes(
        preferences.onboardingStatus,
      )) &&
    (preferences.onboardingAnswers === undefined ||
      preferences.onboardingAnswers === null ||
      isOnboardingAnswers(preferences.onboardingAnswers))
  );
}

export function applyOnboardingAnswers(
  preferences: ActivityPreferences,
  answers: OnboardingAnswers,
): ActivityPreferences {
  const canMoveAway = answers.breakSpace !== "desk-only";
  const isOnVideo = answers.visibility === "on-video";
  return {
    ...preferences,
    canLeaveDesk: canMoveAway && !isOnVideo,
    canStand: !isOnVideo,
    onboardingStatus: "completed",
    onboardingAnswers: answers,
  };
}

export function preferredActivityIds(
  preferences: ActivityPreferences,
): string[] {
  const formats = preferences.onboardingAnswers?.preferredFormats ?? [];
  return [...new Set(formats.flatMap((format) => ACTIVITY_IDS_BY_FORMAT[format]))];
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
      ? {
          ...DEFAULT_ACTIVITY_PREFERENCES,
          ...payload.preferences,
          onboardingAnswers: payload.preferences.onboardingAnswers ?? null,
        }
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
