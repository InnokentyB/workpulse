import { describe, expect, it } from "vitest";

import {
  ACTIVITIES,
  selectActivity,
  selectActivityForContext,
} from "@/lib/activity-selector";

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

  it("provides a six-activity starter library", () => {
    expect(ACTIVITIES).toHaveLength(6);
    expect(selectActivity("shoulder-rolls")).toMatchObject({
      id: "shoulder-rolls",
      name: "Shoulder rolls",
      durationSeconds: 60,
      guide: "camera-shoulders",
      movementCount: 6,
    });
    expect(ACTIVITIES.map((activity) => activity.id)).toEqual([
      "neck-reset",
      "shoulder-rolls",
      "eye-care-break",
      "wall-push-ups",
      "purposeful-walk",
      "quiet-reset",
    ]);
  });

  it("falls back to the neck reset for an unknown id", () => {
    expect(selectActivity("unknown")).toBe(ACTIVITIES[0]);
  });
});

describe("selectActivityForContext", () => {
  const seatedContext = {
    availableSeconds: 90,
    cameraAllowed: true,
    canLeaveDesk: false,
    canStand: false,
    excludedActivityIds: [] as string[],
  };

  it("keeps only activities that fit the available time and workspace", () => {
    const selection = selectActivityForContext(seatedContext);

    expect(selection?.eligibleActivities.map((activity) => activity.id)).toEqual([
      "neck-reset",
      "shoulder-rolls",
      "eye-care-break",
    ]);
    expect(selection?.activity.id).toBe("neck-reset");
    expect(selection?.reason).toContain("90-second window");
  });

  it("prefers a purposeful walk when time and permissions allow it", () => {
    const selection = selectActivityForContext({
      ...seatedContext,
      availableSeconds: 360,
      canLeaveDesk: true,
      canStand: true,
    });

    expect(selection?.activity.id).toBe("purposeful-walk");
    expect(selection?.reason).toContain("step away from your desk");
  });

  it("does not recommend camera-guided activities when camera is unavailable", () => {
    const selection = selectActivityForContext({
      ...seatedContext,
      cameraAllowed: false,
    });

    expect(selection?.eligibleActivities.map((activity) => activity.id)).toEqual([
      "eye-care-break",
    ]);
    expect(selection?.activity.id).toBe("eye-care-break");
  });

  it("respects explicit exclusions and avoids repeating the last activity", () => {
    const selection = selectActivityForContext({
      ...seatedContext,
      excludedActivityIds: ["neck-reset"],
      lastActivityId: "shoulder-rolls",
    });

    expect(selection?.activity.id).toBe("eye-care-break");
    expect(selection?.eligibleActivities.map((activity) => activity.id)).not.toContain(
      "neck-reset",
    );
  });

  it("returns no recommendation when every fitting activity is excluded", () => {
    expect(
      selectActivityForContext({
        ...seatedContext,
        excludedActivityIds: [
          "neck-reset",
          "shoulder-rolls",
          "eye-care-break",
        ],
      }),
    ).toBeNull();
  });

  it("only includes the quiet reset after an explicit request", () => {
    expect(
      selectActivityForContext({
        ...seatedContext,
        availableSeconds: 180,
        cameraAllowed: false,
        excludedActivityIds: ["eye-care-break"],
      }),
    ).toBeNull();

    expect(
      selectActivityForContext({
        ...seatedContext,
        availableSeconds: 180,
        cameraAllowed: false,
        excludedActivityIds: ["eye-care-break"],
        quietPauseRequested: true,
      })?.activity.id,
    ).toBe("quiet-reset");
  });
});
