export const ACTIVITY_HISTORY_STORAGE_KEY = "workpulse.activity-history";
export const ACTIVITY_HISTORY_VERSION = 2;
export const ACTIVITY_HISTORY_LIMIT = 100;

export type ActivityCompletionMode = "camera" | "guided" | "manual";

export type ActivityHistoryEntry = {
  activityId: string;
  activityName: string;
  completedAt: string;
  completionMode: ActivityCompletionMode;
  durationSeconds: number;
  movements: number;
};

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

type HistoryPayload = {
  version: typeof ACTIVITY_HISTORY_VERSION;
  entries: ActivityHistoryEntry[];
};

const completionModes = new Set<ActivityCompletionMode>([
  "camera",
  "guided",
  "manual",
]);

function isHistoryEntry(value: unknown): value is ActivityHistoryEntry {
  if (!value || typeof value !== "object") return false;

  const entry = value as Partial<ActivityHistoryEntry>;
  const completedAt =
    typeof entry.completedAt === "string" ? new Date(entry.completedAt) : null;

  return (
    typeof entry.activityId === "string" &&
    entry.activityId.trim().length > 0 &&
    typeof entry.activityName === "string" &&
    entry.activityName.trim().length > 0 &&
    completedAt !== null &&
    !Number.isNaN(completedAt.getTime()) &&
    typeof entry.completionMode === "string" &&
    completionModes.has(entry.completionMode as ActivityCompletionMode) &&
    typeof entry.durationSeconds === "number" &&
    Number.isFinite(entry.durationSeconds) &&
    entry.durationSeconds > 0 &&
    typeof entry.movements === "number" &&
    Number.isInteger(entry.movements) &&
    entry.movements >= 0
  );
}

function bounded(entries: readonly ActivityHistoryEntry[]) {
  return entries.filter(isHistoryEntry).slice(-ACTIVITY_HISTORY_LIMIT);
}

export function loadActivityHistory(storage: StorageLike): ActivityHistoryEntry[] {
  try {
    const serialized = storage.getItem(ACTIVITY_HISTORY_STORAGE_KEY);
    if (!serialized) return [];

    const payload = JSON.parse(serialized) as Partial<HistoryPayload>;
    if (
      payload.version !== ACTIVITY_HISTORY_VERSION ||
      !Array.isArray(payload.entries)
    ) {
      return [];
    }

    return bounded(payload.entries);
  } catch {
    return [];
  }
}

export function recordActivityCompletion(
  storage: StorageLike,
  completion: Omit<ActivityHistoryEntry, "completedAt">,
  now: () => Date = () => new Date(),
): ActivityHistoryEntry[] {
  const completedAt = now();
  if (Number.isNaN(completedAt.getTime())) return loadActivityHistory(storage);

  const updated = bounded([
    ...loadActivityHistory(storage),
    { ...completion, completedAt: completedAt.toISOString() },
  ]);

  try {
    const payload: HistoryPayload = {
      entries: updated,
      version: ACTIVITY_HISTORY_VERSION,
    };
    storage.setItem(ACTIVITY_HISTORY_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage may be unavailable or full. The current session still keeps the entry.
  }

  return updated;
}
