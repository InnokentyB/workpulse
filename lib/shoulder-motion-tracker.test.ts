import { describe, expect, it } from "vitest";

import type { PoseLandmark } from "@/lib/neck-motion-tracker";
import {
  INITIAL_SHOULDER_MOTION_STATE,
  TARGET_SHOULDER_ROLLS,
  updateShoulderMotion,
  type ShoulderMotionState,
} from "@/lib/shoulder-motion-tracker";

function pose({
  bodyShift = 0,
  leftLift = 0,
  rightLift = leftLift,
  visibility = 1,
}: {
  bodyShift?: number;
  leftLift?: number;
  rightLift?: number;
  visibility?: number;
} = {}): PoseLandmark[] {
  const landmarks = Array.from({ length: 33 }, () => ({
    x: 0,
    y: 0,
    visibility,
  }));
  landmarks[0] = { x: 0.5, y: 0.3 + bodyShift, visibility };
  landmarks[11] = { x: 0.3, y: 0.6 + bodyShift - leftLift, visibility };
  landmarks[12] = { x: 0.7, y: 0.6 + bodyShift - rightLift, visibility };
  return landmarks;
}

function calibrated(): ShoulderMotionState {
  let state = INITIAL_SHOULDER_MOTION_STATE;
  for (let frame = 0; frame < 8; frame += 1) {
    state = updateShoulderMotion(state, pose());
  }
  return state;
}

describe("updateShoulderMotion", () => {
  it("requires both shoulders to be visible", () => {
    expect(
      updateShoulderMotion(
        INITIAL_SHOULDER_MOTION_STATE,
        pose({ visibility: 0.2 }),
      ),
    ).toEqual(INITIAL_SHOULDER_MOTION_STATE);
  });

  it("calibrates a relaxed shoulder position", () => {
    const state = calibrated();

    expect(state).toMatchObject({
      stage: "lift",
      movements: 0,
      tracking: "ready",
    });
    expect(state.baselineLeftGap).toBeCloseTo(0.3);
    expect(state.baselineRightGap).toBeCloseTo(0.3);
  });

  it("counts one roll after shoulders lift and return", () => {
    const lifted = updateShoulderMotion(calibrated(), pose({ leftLift: 0.03 }));
    const lowered = updateShoulderMotion(lifted, pose());

    expect(lifted.stage).toBe("lower");
    expect(lowered).toMatchObject({ stage: "lift", movements: 1 });
  });

  it("does not count small tracking jitter as a roll", () => {
    const state = updateShoulderMotion(calibrated(), pose({ leftLift: 0.01 }));

    expect(state).toMatchObject({ stage: "lift", movements: 0 });
  });

  it("rejects a unilateral shoulder lift", () => {
    const state = updateShoulderMotion(
      calibrated(),
      pose({ leftLift: 0.04, rightLift: 0 }),
    );

    expect(state).toMatchObject({ stage: "lift", movements: 0 });
  });

  it("rejects common body movement as a shoulder roll", () => {
    const state = updateShoulderMotion(calibrated(), pose({ bodyShift: -0.05 }));

    expect(state).toMatchObject({ stage: "lift", movements: 0 });
  });

  it("completes after six full lift-and-return cycles", () => {
    let state = calibrated();
    for (let roll = 0; roll < TARGET_SHOULDER_ROLLS; roll += 1) {
      state = updateShoulderMotion(state, pose({ leftLift: 0.03 }));
      state = updateShoulderMotion(state, pose());
    }

    expect(state).toMatchObject({
      stage: "complete",
      movements: TARGET_SHOULDER_ROLLS,
    });
  });
});
