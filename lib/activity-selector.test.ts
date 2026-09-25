import { describe, expect, it } from "vitest";

import { ACTIVITY_CATALOG, selectActivity } from "@/lib/activity-selector";
import { parseWorkoutSettings } from "@/lib/workout-settings";

describe("selectActivity", () => {
  it("exposes activities with distinct durations and session modes", () => {
    expect(ACTIVITY_CATALOG.map(({ id, durationSeconds, sessionType }) => ({
      id,
      durationSeconds,
      sessionType,
    }))).toEqual([
      { id: "neck-reset", durationSeconds: 45, sessionType: "camera-neck" },
      { id: "shoulder-reset", durationSeconds: 90, sessionType: "timer" },
      { id: "full-body-reset", durationSeconds: 180, sessionType: "timer" },
    ]);
  });

  it("keeps a five-minute buffer before the next meeting", () => {
    expect(
      selectActivity({
        minutesSinceLastActivity: 130,
        minutesToNextMeeting: 6,
      }),
    ).toMatchObject({ id: "neck-reset" });
  });

  it("offers a shoulder reset after a longer movement gap", () => {
    expect(
      selectActivity({
        minutesSinceLastActivity: 100,
        minutesToNextMeeting: 7,
      }),
    ).toMatchObject({ id: "shoulder-reset" });
  });

  it("offers the longest reset when both need and time allow it", () => {
    expect(
      selectActivity({
        minutesSinceLastActivity: 130,
        minutesToNextMeeting: 8,
      }),
    ).toMatchObject({ id: "full-body-reset" });
  });

  it("treats no upcoming meeting as an open window", () => {
    expect(
      selectActivity({
        minutesSinceLastActivity: 130,
        minutesToNextMeeting: null,
      }),
    ).toMatchObject({ id: "full-body-reset" });
  });

  it("does not escalate the exercise when the last movement was recent", () => {
    expect(
      selectActivity({
        minutesSinceLastActivity: 70,
        minutesToNextMeeting: 20,
      }),
    ).toMatchObject({ id: "neck-reset" });
  });

  it("avoids workouts completed inside the repeat cooldown", () => {
    expect(
      selectActivity({
        minutesSinceLastActivity: 130,
        minutesToNextMeeting: 8,
        excludedActivityIds: ["full-body-reset"],
      }),
    ).toMatchObject({ id: "shoulder-reset" });
  });

  it("selects from injected settings without code changes", () => {
    const customSettings = parseWorkoutSettings({
      version: 1,
      repeatCooldownMinutes: 120,
      transitionBufferSeconds: 0,
      workouts: [
        {
          id: "custom-reset",
          name: "Custom reset",
          durationSeconds: 75,
          instructions: "Complete a custom sequence.",
          sessionType: "timer",
          steps: ["Custom step"],
          selection: { minimumMinutesSinceLastActivity: 0 },
        },
      ],
    });

    expect(
      selectActivity(
        {
          minutesSinceLastActivity: 25,
          minutesToNextMeeting: 6,
        },
        customSettings,
      ),
    ).toMatchObject({ id: "custom-reset" });
  });

  it("returns no activity when every configured workout exceeds the safe window", () => {
    const customSettings = parseWorkoutSettings({
      version: 1,
      repeatCooldownMinutes: 120,
      transitionBufferSeconds: 300,
      workouts: [
        {
          id: "long-reset",
          name: "Long reset",
          durationSeconds: 120,
          instructions: "Complete a longer sequence.",
          sessionType: "timer",
          steps: ["Long step"],
          selection: { minimumMinutesSinceLastActivity: 0 },
        },
      ],
    });

    expect(
      selectActivity(
        {
          minutesSinceLastActivity: 120,
          minutesToNextMeeting: 6,
        },
        customSettings,
      ),
    ).toBeUndefined();
  });
});
