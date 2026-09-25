import { describe, expect, it } from "vitest";

import { selectActivity } from "@/lib/activity-selector";

describe("selectActivity", () => {
  it("returns the single fixed MVP activity", () => {
    expect(selectActivity()).toEqual({
      id: "neck-reset",
      name: "Neck reset",
      durationSeconds: 45,
      instructions:
        "Slowly turn side to side, lower your chin, and lift your gaze within a comfortable range.",
    });
  });

  it("is deterministic", () => {
    expect(selectActivity()).toEqual(selectActivity());
  });
});
