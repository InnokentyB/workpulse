export const ACTIVITY_HISTORY_STORAGE_KEY = "workpulse.activity-history";
export const ACTIVITY_HISTORY_VERSION = 1;
export const ACTIVITY_HISTORY_LIMIT = 100;

export type ActivityCompletionMode = "camera" | "timer" | "manual";

export type ActivityHistoryEntry = {
  activityId: string;
  completedAt: string;
  completionMode: ActivityCompletionMode;
};

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

type HistoryPayload = {
  version: typeof ACTIVITY_HISTORY_VERSION;
  entries: ActivityHistoryEntry[];
};

type HistoryOptions = {
  key?: string;
  limit?: number;
};

const completionModes = new Set<ActivityCompletionMode>([
  "camera",
  "timer",
  "manual",
]);

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

function isHistoryEntry(value: unknown): value is ActivityHistoryEntry {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ActivityHistoryEntry>;
  return (
    typeof candidate.activityId === "string" &&
    candidate.activityId.trim().length > 0 &&
    isIsoTimestamp(candidate.completedAt) &&
    typeof candidate.completionMode === "string" &&
    completionModes.has(candidate.completionMode as ActivityCompletionMode)
  );
}

function resolvedLimit(limit: number | undefined): number {
  if (limit === undefined) return ACTIVITY_HISTORY_LIMIT;
  if (!Number.isFinite(limit) || limit < 1) return ACTIVITY_HISTORY_LIMIT;
  return Math.floor(limit);
}

function boundedHistory(
  entries: readonly ActivityHistoryEntry[],
  limit: number | undefined,
): ActivityHistoryEntry[] {
  return entries.filter(isHistoryEntry).slice(-resolvedLimit(limit));
}

export function loadActivityHistory(
  storage: StorageLike,
  options: HistoryOptions = {},
): ActivityHistoryEntry[] {
  try {
    const serialized = storage.getItem(
      options.key ?? ACTIVITY_HISTORY_STORAGE_KEY,
    );
    if (!serialized) return [];

    const payload = JSON.parse(serialized) as Partial<HistoryPayload>;
    if (
      !payload ||
      payload.version !== ACTIVITY_HISTORY_VERSION ||
      !Array.isArray(payload.entries)
    ) {
      return [];
    }

    return boundedHistory(payload.entries, options.limit);
  } catch {
    return [];
  }
}

export function saveActivityHistory(
  storage: StorageLike,
  entries: readonly ActivityHistoryEntry[],
  options: HistoryOptions = {},
): boolean {
  const payload: HistoryPayload = {
    version: ACTIVITY_HISTORY_VERSION,
    entries: boundedHistory(entries, options.limit),
  };

  try {
    storage.setItem(
      options.key ?? ACTIVITY_HISTORY_STORAGE_KEY,
      JSON.stringify(payload),
    );
    return true;
  } catch {
    return false;
  }
}

export function recordActivityCompletion(
  storage: StorageLike,
  completion: Pick<ActivityHistoryEntry, "activityId" | "completionMode">,
  now: () => Date = () => new Date(),
  options: HistoryOptions = {},
): ActivityHistoryEntry[] {
  const completedAt = now();
  if (
    completion.activityId.trim().length === 0 ||
    !completionModes.has(completion.completionMode) ||
    Number.isNaN(completedAt.getTime())
  ) {
    return loadActivityHistory(storage, options);
  }

  const updated = boundedHistory(
    [
      ...loadActivityHistory(storage, options),
      {
        activityId: completion.activityId,
        completedAt: completedAt.toISOString(),
        completionMode: completion.completionMode,
      },
    ],
    options.limit,
  );

  saveActivityHistory(storage, updated, options);
  return updated;
}

export function minutesSinceLastCompletion(
  entries: readonly ActivityHistoryEntry[],
  now: Date = new Date(),
): number | null {
  const timestamps = entries
    .filter(isHistoryEntry)
    .map(({ completedAt }) => Date.parse(completedAt));
  if (timestamps.length === 0 || Number.isNaN(now.getTime())) return null;

  const latest = Math.max(...timestamps);
  return Math.max(0, Math.floor((now.getTime() - latest) / 60_000));
}

export function recentActivityIds(
  entries: readonly ActivityHistoryEntry[],
  cooldownMinutes: number,
  now: Date = new Date(),
): string[] {
  if (
    !Number.isFinite(cooldownMinutes) ||
    cooldownMinutes <= 0 ||
    Number.isNaN(now.getTime())
  ) {
    return [];
  }

  const cutoff = now.getTime() - cooldownMinutes * 60_000;
  const recent = entries
    .filter(isHistoryEntry)
    .filter(({ completedAt }) => {
      const timestamp = Date.parse(completedAt);
      return timestamp >= cutoff && timestamp <= now.getTime();
    })
    .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt));

  return [...new Set(recent.map(({ activityId }) => activityId))];
}
