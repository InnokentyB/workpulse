import { describe, expect, it } from "vitest";

import {
  INITIAL_NECK_MOTION_STATE,
  updateNeckMotion,
  type NeckMotionState,
  type PoseLandmark,
} from "@/lib/neck-motion-tracker";

function pose(horizontal = 0, vertical = 0, visibility = 1): PoseLandmark[] {
  const landmarks = Array.from({ length: 33 }, () => ({
    x: 0,
    y: 0,
    visibility,
  }));

  landmarks[0] = { x: 0.5 + horizontal, y: 0.35 + vertical, visibility };
  landmarks[11] = { x: 0.25, y: 0.75, visibility };
  landmarks[12] = { x: 0.75, y: 0.75, visibility };
  return landmarks;
}

function calibrated(): NeckMotionState {
  let state = INITIAL_NECK_MOTION_STATE;
  for (let frame = 0; frame < 8; frame += 1) {
    state = updateNeckMotion(state, pose());
  }
  return state;
}

describe("updateNeckMotion", () => {
  it("requires the face and shoulders to be visible", () => {
    expect(updateNeckMotion(INITIAL_NECK_MOTION_STATE, pose(0, 0, 0.2))).toEqual(
      INITIAL_NECK_MOTION_STATE,
    );
  });

  it("calibrates a neutral position over eight visible frames", () => {
    let state = INITIAL_NECK_MOTION_STATE;
    for (let frame = 0; frame < 7; frame += 1) {
      state = updateNeckMotion(state, pose());
    }
    expect(state.stage).toBe("calibrating");

    state = updateNeckMotion(state, pose());
    expect(state).toMatchObject({
      stage: "first-side",
      movements: 0,
      tracking: "ready",
      baselineHorizontal: 0,
    });
    expect(state.baselineVertical).toBeCloseTo(-0.8);
  });

  it.each([-0.06, 0.06])("accepts either direction as the first turn", (offset) => {
    const state = updateNeckMotion(calibrated(), pose(offset));

    expect(state).toMatchObject({
      stage: "opposite-side",
      movements: 1,
      firstSideDirection: offset < 0 ? -1 : 1,
    });
  });

  it("requires the second turn to cross to the opposite side", () => {
    const firstSide = updateNeckMotion(calibrated(), pose(0.06));
    const sameSide = updateNeckMotion(firstSide, pose(0.08));
    const oppositeSide = updateNeckMotion(sameSide, pose(-0.06));

    expect(sameSide.stage).toBe("opposite-side");
    expect(oppositeSide).toMatchObject({ stage: "down", movements: 2 });
  });

  it("completes down, up, and neutral in order", () => {
    let state = updateNeckMotion(calibrated(), pose(-0.06));
    state = updateNeckMotion(state, pose(0.06));
    state = updateNeckMotion(state, pose(0, 0.05));
    expect(state).toMatchObject({ stage: "up", movements: 3 });

    state = updateNeckMotion(state, pose(0, -0.04));
    expect(state).toMatchObject({ stage: "center", movements: 4 });

    state = updateNeckMotion(state, pose());
    expect(state).toMatchObject({ stage: "complete", movements: 4 });
  });

  it("does not advance on the wrong movement", () => {
    const firstSide = updateNeckMotion(calibrated(), pose(-0.06));
    const tooSoonDown = updateNeckMotion(firstSide, pose(0, 0.08));

    expect(tooSoonDown).toMatchObject({ stage: "opposite-side", movements: 1 });
  });
});
