export const ACTIVITY_FEEDBACK_STORAGE_KEY = "workpulse.activity-feedback";
const ACTIVITY_FEEDBACK_VERSION = 1;
const ACTIVITY_FEEDBACK_LIMIT = 200;

export type ActivityLoadFeedback =
  | "too-light"
  | "just-right"
  | "too-hard"
  | "skipped";
export type ActivityRepeatFeedback = "yes" | "no" | "not-sure";

export type ActivityFeedbackInput = {
  activityId: string;
  load: ActivityLoadFeedback;
  repeat: ActivityRepeatFeedback;
};

export type ActivityFeedbackRecord = ActivityFeedbackInput & {
  submittedAt: string;
};

export type ActivityFeedbackStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const loadValues: readonly ActivityLoadFeedback[] = [
  "too-light",
  "just-right",
  "too-hard",
  "skipped",
];
const repeatValues: readonly ActivityRepeatFeedback[] = [
  "yes",
  "no",
  "not-sure",
];

function isFeedback(value: unknown): value is ActivityFeedbackRecord {
  if (!value || typeof value !== "object") return false;
  const feedback = value as Partial<ActivityFeedbackRecord>;
  return (
    typeof feedback.activityId === "string" &&
    feedback.activityId.trim().length > 0 &&
    typeof feedback.load === "string" &&
    loadValues.includes(feedback.load as ActivityLoadFeedback) &&
    typeof feedback.repeat === "string" &&
    repeatValues.includes(feedback.repeat as ActivityRepeatFeedback) &&
    typeof feedback.submittedAt === "string" &&
    !Number.isNaN(new Date(feedback.submittedAt).getTime())
  );
}

export function loadActivityFeedback(
  storage: ActivityFeedbackStorage,
): ActivityFeedbackRecord[] {
  try {
    const serialized = storage.getItem(ACTIVITY_FEEDBACK_STORAGE_KEY);
    if (!serialized) return [];
    const payload = JSON.parse(serialized) as {
      version?: unknown;
      records?: unknown;
    };
    if (
      payload.version !== ACTIVITY_FEEDBACK_VERSION ||
      !Array.isArray(payload.records)
    ) {
      return [];
    }
    return payload.records.filter(isFeedback);
  } catch {
    return [];
  }
}

export function recordActivityFeedback(
  storage: ActivityFeedbackStorage,
  feedback: ActivityFeedbackInput,
  now: () => Date = () => new Date(),
): ActivityFeedbackRecord {
  const record = { ...feedback, submittedAt: now().toISOString() };
  const records = [...loadActivityFeedback(storage), record].slice(
    -ACTIVITY_FEEDBACK_LIMIT,
  );
  try {
    storage.setItem(
      ACTIVITY_FEEDBACK_STORAGE_KEY,
      JSON.stringify({ version: ACTIVITY_FEEDBACK_VERSION, records }),
    );
  } catch {
    // Feedback remains optional if browser storage is unavailable.
  }
  return record;
}

export function getActivityPreferenceSignals(storage: ActivityFeedbackStorage) {
  const latestByActivity = new Map<string, ActivityFeedbackRecord>();
  for (const feedback of loadActivityFeedback(storage)) {
    latestByActivity.set(feedback.activityId, feedback);
  }

  const preferredActivityIds: string[] = [];
  const deprioritizedActivityIds: string[] = [];
  for (const feedback of latestByActivity.values()) {
    if (feedback.repeat === "yes" && feedback.load !== "too-hard") {
      preferredActivityIds.push(feedback.activityId);
    }
    if (feedback.repeat === "no" || feedback.load === "too-hard") {
      deprioritizedActivityIds.push(feedback.activityId);
    }
  }

  return { preferredActivityIds, deprioritizedActivityIds };
}
