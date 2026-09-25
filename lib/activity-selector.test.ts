import { describe, expect, it } from "vitest";

import { ACTIVITIES, selectActivity } from "@/lib/activity-selector";

describe("selectActivity", () => {
  it("returns the neck reset by default", () => {
    expect(selectActivity()).toMatchObject({
      id: "neck-reset",
      name: "Neck reset",
      durationSeconds: 45,
      guide: "camera-neck",
      instructions:
        "Slowly turn side to side, lower your chin, and lift your gaze within a comfortable range.",
    });
  });

  it("provides a second guided shoulder activity", () => {
    expect(ACTIVITIES).toHaveLength(2);
    expect(selectActivity("shoulder-rolls")).toMatchObject({
      id: "shoulder-rolls",
      name: "Shoulder rolls",
      durationSeconds: 60,
      guide: "guided-steps",
    });
  });

  it("falls back to the neck reset for an unknown id", () => {
    expect(selectActivity("unknown")).toBe(ACTIVITIES[0]);
  });
});
