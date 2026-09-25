import { describe, expect, it } from "vitest";

import {
  loadWorkoutSettings,
  parseWorkoutSettings,
} from "@/lib/workout-settings";

function settings(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    repeatCooldownMinutes: 120,
    transitionBufferSeconds: 300,
    workouts: [
      {
        id: "test-reset",
        name: "Test reset",
        durationSeconds: 60,
        instructions: "Follow the test sequence.",
        sessionType: "timer",
        steps: ["First step"],
        selection: { minimumMinutesSinceLastActivity: 0 },
      },
    ],
    ...overrides,
  };
}

describe("workout settings", () => {
  it("loads the checked-in workout catalog", () => {
    const loaded = loadWorkoutSettings();

    expect(loaded.version).toBe(1);
    expect(loaded.repeatCooldownMinutes).toBe(120);
    expect(loaded.transitionBufferSeconds).toBe(300);
    expect(loaded.workouts.map(({ id }) => id)).toEqual([
      "neck-reset",
      "shoulder-reset",
      "full-body-reset",
    ]);
  });

  it("parses a valid timer workout", () => {
    expect(parseWorkoutSettings(settings()).workouts[0]).toMatchObject({
      id: "test-reset",
      durationSeconds: 60,
      sessionType: "timer",
      selection: { minimumMinutesSinceLastActivity: 0 },
    });
  });

  it("parses optional per-step visual guidance", () => {
    const configured = settings({
      workouts: [
        {
          ...settings().workouts[0],
          guidance: {
            position: "seated",
            safetyWarning: "Stay within a comfortable range.",
            steps: [
              {
                label: "Look ahead",
                durationSeconds: 60,
                visual: {
                  kind: "image",
                  src: "/guides/look-ahead.svg",
                  alt: "A seated person looking straight ahead",
                },
              },
            ],
          },
        },
      ],
    });

    expect(parseWorkoutSettings(configured).workouts[0].guidance).toEqual({
      position: "seated",
      safetyWarning: "Stay within a comfortable range.",
      steps: [
        {
          label: "Look ahead",
          durationSeconds: 60,
          visual: {
            kind: "image",
            src: "/guides/look-ahead.svg",
            alt: "A seated person looking straight ahead",
          },
        },
      ],
    });
  });

  it("rejects guidance durations that do not match the workout", () => {
    const configured = settings({
      workouts: [
        {
          ...settings().workouts[0],
          guidance: {
            position: "either",
            safetyWarning: "Move carefully.",
            steps: [{ label: "Move", durationSeconds: 30 }],
          },
        },
      ],
    });

    expect(() => parseWorkoutSettings(configured)).toThrow(/sum.*duration/i);
  });

  it("rejects unsafe visual URLs", () => {
    const configured = settings({
      workouts: [
        {
          ...settings().workouts[0],
          guidance: {
            position: "standing",
            safetyWarning: "Move carefully.",
            steps: [
              {
                label: "Move",
                durationSeconds: 60,
                visual: {
                  kind: "image",
                  src: "javascript:alert(1)",
                  alt: "Movement guide",
                },
              },
            ],
          },
        },
      ],
    });

    expect(() => parseWorkoutSettings(configured)).toThrow(/visual.*src/i);
  });

  it("rejects duplicate workout ids", () => {
    const duplicate = settings();
    duplicate.workouts.push({ ...duplicate.workouts[0] });

    expect(() => parseWorkoutSettings(duplicate)).toThrow(/duplicate.*test-reset/i);
  });

  it("rejects invalid durations and empty steps", () => {
    const invalid = settings({
      workouts: [
        {
          ...settings().workouts[0],
          durationSeconds: 0,
          steps: [],
        },
      ],
    });

    expect(() => parseWorkoutSettings(invalid)).toThrow(/durationSeconds/i);
  });

  it("rejects unsupported camera modes", () => {
    const invalid = settings({
      workouts: [
        {
          ...settings().workouts[0],
          sessionType: "camera-squat",
        },
      ],
    });

    expect(() => parseWorkoutSettings(invalid)).toThrow(/sessionType/i);
  });

  it("requires a fallback workout for recent movement", () => {
    const invalid = settings({
      workouts: [
        {
          ...settings().workouts[0],
          selection: { minimumMinutesSinceLastActivity: 30 },
        },
      ],
    });

    expect(() => parseWorkoutSettings(invalid)).toThrow(/fallback/i);
  });
});
