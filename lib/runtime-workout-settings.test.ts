import { describe, expect, it, vi } from "vitest";

import {
  RUNTIME_WORKOUT_CACHE_KEY,
  loadRuntimeWorkoutSettings,
} from "@/lib/runtime-workout-settings";
import { loadWorkoutSettings } from "@/lib/workout-settings";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function remoteCatalog(version = 2) {
  return {
    version,
    repeatCooldownMinutes: 45,
    transitionBufferSeconds: 0,
    workouts: [
      {
        id: "remote-reset",
        name: "Remote reset",
        durationSeconds: 30,
        instructions: "Follow the remote sequence.",
        sessionType: "timer",
        steps: ["Move"],
        selection: { minimumMinutesSinceLastActivity: 0 },
      },
    ],
  };
}

describe("runtime workout settings", () => {
  it("loads, validates, and caches a remote catalog", async () => {
    const storage = new MemoryStorage();
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => remoteCatalog(),
    });

    const result = await loadRuntimeWorkoutSettings({ fetcher, storage });

    expect(result.source).toBe("remote");
    expect(result.settings.version).toBe(2);
    expect(result.settings.workouts[0].id).toBe("remote-reset");
    expect(storage.getItem(RUNTIME_WORKOUT_CACHE_KEY)).toContain('"version":2');
  });

  it("uses the last valid cached catalog when refresh fails", async () => {
    const storage = new MemoryStorage();
    storage.setItem(RUNTIME_WORKOUT_CACHE_KEY, JSON.stringify(remoteCatalog(3)));

    const result = await loadRuntimeWorkoutSettings({
      fetcher: vi.fn().mockRejectedValue(new Error("offline")),
      storage,
    });

    expect(result.source).toBe("cache");
    expect(result.settings.version).toBe(3);
    expect(result.warning).toMatch(/last saved/i);
  });

  it("falls back to bundled settings if remote and cache are invalid", async () => {
    const storage = new MemoryStorage();
    storage.setItem(RUNTIME_WORKOUT_CACHE_KEY, "not json");

    const result = await loadRuntimeWorkoutSettings({
      fetcher: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: true }),
      }),
      storage,
    });

    expect(result.source).toBe("bundled");
    expect(result.settings).toEqual(loadWorkoutSettings());
    expect(result.warning).toMatch(/built-in/i);
  });
});
