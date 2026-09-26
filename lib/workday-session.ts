import type { ActivityHistoryEntry } from "./activity-history";
import type { WorkContext } from "./types";

export const WORKDAY_SETTINGS_STORAGE_KEY = "workpulse.workday-settings";
export const WORKDAY_SESSION_STORAGE_KEY = "workpulse.workday-session";

const STORAGE_VERSION = 1;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type WorkdaySettings = {
  startTime: string;
  endTime: string;
};

export type ManualWorkSession = {
  startedAt: string;
};

export type WorkdayStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

export const DEFAULT_WORKDAY_SETTINGS: WorkdaySettings = {
  startTime: "09:00",
  endTime: "18:00",
};

function isTime(value: unknown): value is string {
  return typeof value === "string" && TIME_PATTERN.test(value);
}

export function validateWorkdaySettings(settings: WorkdaySettings): string | null {
  if (!isTime(settings.startTime) || !isTime(settings.endTime)) {
    return "Enter a valid start and end time.";
  }
  if (settings.startTime === settings.endTime) {
    return "Start and end time need to be different.";
  }
  return null;
}

export function loadWorkdaySettings(storage: WorkdayStorage): WorkdaySettings {
  try {
    const serialized = storage.getItem(WORKDAY_SETTINGS_STORAGE_KEY);
    if (!serialized) return { ...DEFAULT_WORKDAY_SETTINGS };
    const payload = JSON.parse(serialized) as {
      version?: unknown;
      settings?: Partial<WorkdaySettings>;
    };
    const settings = payload.settings;
    return payload.version === STORAGE_VERSION &&
      settings &&
      isTime(settings.startTime) &&
      isTime(settings.endTime) &&
      settings.startTime !== settings.endTime
      ? { startTime: settings.startTime, endTime: settings.endTime }
      : { ...DEFAULT_WORKDAY_SETTINGS };
  } catch {
    return { ...DEFAULT_WORKDAY_SETTINGS };
  }
}

export function saveWorkdaySettings(
  storage: WorkdayStorage,
  settings: WorkdaySettings,
): boolean {
  if (validateWorkdaySettings(settings)) return false;
  try {
    storage.setItem(
      WORKDAY_SETTINGS_STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, settings }),
    );
    return true;
  } catch {
    return false;
  }
}

export function loadManualWorkSession(
  storage: WorkdayStorage,
): ManualWorkSession | null {
  try {
    const serialized = storage.getItem(WORKDAY_SESSION_STORAGE_KEY);
    if (!serialized) return null;
    const payload = JSON.parse(serialized) as {
      version?: unknown;
      session?: Partial<ManualWorkSession>;
    };
    const startedAt = payload.session?.startedAt;
    const date = typeof startedAt === "string" ? new Date(startedAt) : null;
    return payload.version === STORAGE_VERSION &&
      date &&
      !Number.isNaN(date.getTime())
      ? { startedAt: date.toISOString() }
      : null;
  } catch {
    return null;
  }
}

export function startManualWorkSession(
  storage: WorkdayStorage,
  now: Date = new Date(),
): { session: ManualWorkSession; persisted: boolean } | null {
  if (Number.isNaN(now.getTime())) return null;
  const session = { startedAt: now.toISOString() };
  try {
    storage.setItem(
      WORKDAY_SESSION_STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, session }),
    );
    return { session, persisted: true };
  } catch {
    return { session, persisted: false };
  }
}

export function endManualWorkSession(storage: WorkdayStorage): boolean {
  try {
    if (storage.removeItem) {
      storage.removeItem(WORKDAY_SESSION_STORAGE_KEY);
    } else {
      storage.setItem(WORKDAY_SESSION_STORAGE_KEY, "");
    }
    return true;
  } catch {
    return false;
  }
}

function minutesBetween(later: Date, earlier: Date): number {
  return Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / 60_000));
}

export function createManualWorkContext(
  session: ManualWorkSession,
  history: readonly ActivityHistoryEntry[],
  now: Date = new Date(),
): WorkContext | null {
  const startedAt = new Date(session.startedAt);
  if (
    Number.isNaN(startedAt.getTime()) ||
    Number.isNaN(now.getTime()) ||
    startedAt.getTime() > now.getTime()
  ) {
    return null;
  }

  const latestActivity = history
    .map((entry) => ({ entry, completedAt: new Date(entry.completedAt) }))
    .filter(
      ({ completedAt }) =>
        !Number.isNaN(completedAt.getTime()) &&
        completedAt.getTime() >= startedAt.getTime() &&
        completedAt.getTime() <= now.getTime(),
    )
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())[0];
  const reference = latestActivity?.completedAt ?? startedAt;
  const minutesSinceLastActivity = minutesBetween(now, reference);

  return {
    sedentaryMinutes: minutesSinceLastActivity,
    minutesToNextMeeting: null,
    minutesSinceLastActivity,
    currentTime: now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isWithinWorkday(
  settings: WorkdaySettings,
  now: Date = new Date(),
): boolean {
  if (validateWorkdaySettings(settings) || Number.isNaN(now.getTime())) {
    return false;
  }
  const current = now.getHours() * 60 + now.getMinutes();
  const start = timeToMinutes(settings.startTime);
  const end = timeToMinutes(settings.endTime);
  return start < end
    ? current >= start && current < end
    : current >= start || current < end;
}
