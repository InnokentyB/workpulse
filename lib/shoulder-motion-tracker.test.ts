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
  it.each([0, 11, 12])("rejects a missing required landmark %i", (index) => {
    const landmarks = pose();
    delete landmarks[index];
    expect(updateShoulderMotion(calibrated(), landmarks)).toMatchObject({ tracking: "out-of-frame", movements: 0 });
  });

  it.each([0, 11, 12])("rejects low visibility at required landmark %i", (index) => {
    const landmarks = pose();
    landmarks[index].visibility = 0.54;
    expect(updateShoulderMotion(calibrated(), landmarks)).toMatchObject({ tracking: "out-of-frame", movements: 0 });
  });

  it.each([NaN, Infinity])("rejects nonfinite visibility %s", (visibility) => {
    expect(updateShoulderMotion(calibrated(), pose({ visibility }))).toMatchObject({ tracking: "out-of-frame", movements: 0 });
  });

  it.each(["x", "y"] as const)("rejects nonfinite shoulder coordinate %s", (coordinate) => {
    const landmarks = pose();
    landmarks[11][coordinate] = NaN;
    expect(updateShoulderMotion(calibrated(), landmarks)).toMatchObject({ tracking: "out-of-frame", movements: 0 });
  });

  it("requires eight consecutive usable calibration frames after tiny shoulder width", () => {
    let state = INITIAL_SHOULDER_MOTION_STATE;
    for (let frame = 0; frame < 7; frame += 1) state = updateShoulderMotion(state, pose());
    const narrow = pose();
    narrow[12].x = 0.31;
    state = updateShoulderMotion(state, narrow);
    expect(state.calibrationFrames).toBe(0);
    state = updateShoulderMotion(state, pose());
    expect(state).toMatchObject({ stage: "calibrating", calibrationFrames: 1 });
  });

  it("does not complete an interrupted lift after tracking returns", () => {
    let state = updateShoulderMotion(calibrated(), pose({ leftLift: 0.03 }));
    state = updateShoulderMotion(state, []);
    state = updateShoulderMotion(state, pose());
    expect(state).toMatchObject({ stage: "lift", movements: 0 });
    state = updateShoulderMotion(state, pose({ leftLift: 0.03 }));
    state = updateShoulderMotion(state, pose());
    expect(state.movements).toBe(1);
  });

  it("does not count a held lift or repeated neutral frames", () => {
    let state = calibrated();
    for (let frame = 0; frame < 20; frame += 1) state = updateShoulderMotion(state, pose({ leftLift: 0.03 }));
    expect(state.movements).toBe(0);
    for (let frame = 0; frame < 20; frame += 1) state = updateShoulderMotion(state, pose());
    expect(state.movements).toBe(1);
  });

  it("restarts calibration when shoulder gaps change substantially", () => {
    let state = INITIAL_SHOULDER_MOTION_STATE;
    for (let frame = 0; frame < 7; frame += 1) state = updateShoulderMotion(state, pose());
    state = updateShoulderMotion(state, pose({ leftLift: 0.03 }));
    expect(state).toMatchObject({ stage: "calibrating", calibrationFrames: 1 });
    for (let frame = 0; frame < 8; frame += 1) state = updateShoulderMotion(state, pose());
    expect(state).toMatchObject({ stage: "lift", movements: 0 });
    expect(state.baselineLeftGap).toBeCloseTo(0.3);
  });

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
