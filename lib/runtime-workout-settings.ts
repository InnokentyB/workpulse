import {
  loadWorkoutSettings,
  parseWorkoutSettings,
  type WorkoutSettings,
} from "@/lib/workout-settings";

export const RUNTIME_WORKOUT_CACHE_KEY = "workpulse.workout-catalog.v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;
type FetchResponse = { ok: boolean; json: () => Promise<unknown> };
type Fetcher = (input: string, init?: RequestInit) => Promise<FetchResponse>;

export type RuntimeWorkoutSettings = {
  settings: WorkoutSettings;
  source: "remote" | "cache" | "bundled";
  warning?: string;
};

function readCachedSettings(storage?: StorageLike): WorkoutSettings | undefined {
  if (!storage) return undefined;
  try {
    const cached = storage.getItem(RUNTIME_WORKOUT_CACHE_KEY);
    return cached ? parseWorkoutSettings(JSON.parse(cached)) : undefined;
  } catch {
    return undefined;
  }
}

function cacheSettings(storage: StorageLike | undefined, settings: WorkoutSettings) {
  if (!storage) return;
  try {
    storage.setItem(RUNTIME_WORKOUT_CACHE_KEY, JSON.stringify(settings));
  } catch {
    // A storage quota or privacy setting must never block an exercise.
  }
}

export async function loadRuntimeWorkoutSettings({
  fetcher = fetch,
  storage,
  url = "/api/workouts",
}: {
  fetcher?: Fetcher;
  storage?: StorageLike;
  url?: string;
} = {}): Promise<RuntimeWorkoutSettings> {
  try {
    const response = await fetcher(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Workout catalog request failed.");
    const settings = parseWorkoutSettings(await response.json());
    cacheSettings(storage, settings);
    return { settings, source: "remote" };
  } catch {
    const cached = readCachedSettings(storage);
    if (cached) {
      return {
        settings: cached,
        source: "cache",
        warning: "Catalog refresh failed. Using the last saved workout catalog.",
      };
    }

    return {
      settings: loadWorkoutSettings(),
      source: "bundled",
      warning: "Catalog refresh failed. Using the built-in workout catalog.",
    };
  }
}
