import type { PoseLandmark } from "@/lib/neck-motion-tracker";

export const TARGET_SHOULDER_ROLLS = 6;

export type ShoulderMotionStage =
  | "calibrating"
  | "lift"
  | "lower"
  | "complete";

export type ShoulderMotionState = {
  stage: ShoulderMotionStage;
  movements: number;
  tracking: "out-of-frame" | "ready";
  calibrationFrames: number;
  leftGapTotal: number;
  rightGapTotal: number;
  baselineLeftGap: number | null;
  baselineRightGap: number | null;
};

const NOSE = 0;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const MINIMUM_VISIBILITY = 0.55;
const CALIBRATION_FRAMES = 8;
const LIFT_THRESHOLD = 0.055;
const LOWER_THRESHOLD = 0.025;

export const INITIAL_SHOULDER_MOTION_STATE: ShoulderMotionState = {
  stage: "calibrating",
  movements: 0,
  tracking: "out-of-frame",
  calibrationFrames: 0,
  leftGapTotal: 0,
  rightGapTotal: 0,
  baselineLeftGap: null,
  baselineRightGap: null,
};

function isVisible(landmark: PoseLandmark | undefined): landmark is PoseLandmark {
  return Boolean(
    landmark &&
      Number.isFinite(landmark.x) &&
      Number.isFinite(landmark.y) &&
      (landmark.visibility ?? 1) >= MINIMUM_VISIBILITY,
  );
}

export function updateShoulderMotion(
  state: ShoulderMotionState,
  landmarks: PoseLandmark[],
): ShoulderMotionState {
  const nose = landmarks[NOSE];
  const leftShoulder = landmarks[LEFT_SHOULDER];
  const rightShoulder = landmarks[RIGHT_SHOULDER];

  if (!isVisible(nose) || !isVisible(leftShoulder) || !isVisible(rightShoulder)) {
    return state.stage === "calibrating"
      ? {
          ...state,
          tracking: "out-of-frame",
          calibrationFrames: 0,
          leftGapTotal: 0,
          rightGapTotal: 0,
        }
      : { ...state, tracking: "out-of-frame" };
  }

  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  if (shoulderWidth < 0.05) return { ...state, tracking: "out-of-frame" };

  const leftGap = leftShoulder.y - nose.y;
  const rightGap = rightShoulder.y - nose.y;

  if (state.stage === "calibrating") {
    const calibrationFrames = state.calibrationFrames + 1;
    const leftGapTotal = state.leftGapTotal + leftGap;
    const rightGapTotal = state.rightGapTotal + rightGap;

    if (calibrationFrames < CALIBRATION_FRAMES) {
      return {
        ...state,
        tracking: "ready",
        calibrationFrames,
        leftGapTotal,
        rightGapTotal,
      };
    }

    return {
      ...state,
      stage: "lift",
      tracking: "ready",
      calibrationFrames,
      leftGapTotal,
      rightGapTotal,
      baselineLeftGap: leftGapTotal / calibrationFrames,
      baselineRightGap: rightGapTotal / calibrationFrames,
    };
  }

  if (state.stage === "complete") return { ...state, tracking: "ready" };

  const leftDelta =
    ((state.baselineLeftGap ?? leftGap) - leftGap) / shoulderWidth;
  const rightDelta =
    ((state.baselineRightGap ?? rightGap) - rightGap) / shoulderWidth;

  if (
    state.stage === "lift" &&
    leftDelta >= LIFT_THRESHOLD &&
    rightDelta >= LIFT_THRESHOLD
  ) {
    return { ...state, stage: "lower", tracking: "ready" };
  }

  if (
    state.stage === "lower" &&
    leftDelta <= LOWER_THRESHOLD &&
    rightDelta <= LOWER_THRESHOLD
  ) {
    const movements = state.movements + 1;
    return {
      ...state,
      stage: movements >= TARGET_SHOULDER_ROLLS ? "complete" : "lift",
      movements,
      tracking: "ready",
    };
  }

  return { ...state, tracking: "ready" };
}
