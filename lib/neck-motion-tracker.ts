export const TARGET_NECK_MOVEMENTS = 4;

export type PoseLandmark = {
  x: number;
  y: number;
  visibility?: number;
};

export type NeckMotionStage =
  | "calibrating"
  | "first-side"
  | "opposite-side"
  | "down"
  | "up"
  | "center"
  | "complete";

export type NeckMotionState = {
  stage: NeckMotionStage;
  movements: number;
  tracking: "out-of-frame" | "ready";
  calibrationFrames: number;
  horizontalTotal: number;
  verticalTotal: number;
  baselineHorizontal: number | null;
  baselineVertical: number | null;
  firstSideDirection: -1 | 1 | null;
};

const NOSE = 0;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const MINIMUM_VISIBILITY = 0.55;
const CALIBRATION_FRAMES = 8;
const SIDE_THRESHOLD = 0.1;
const DOWN_THRESHOLD = 0.08;
const UP_THRESHOLD = 0.06;
const CENTER_THRESHOLD = 0.07;
const CENTERED_HORIZONTAL_LIMIT = 0.12;

export const INITIAL_NECK_MOTION_STATE: NeckMotionState = {
  stage: "calibrating",
  movements: 0,
  tracking: "out-of-frame",
  calibrationFrames: 0,
  horizontalTotal: 0,
  verticalTotal: 0,
  baselineHorizontal: null,
  baselineVertical: null,
  firstSideDirection: null,
};

function isVisible(landmark: PoseLandmark | undefined): landmark is PoseLandmark {
  return Boolean(
    landmark &&
      Number.isFinite(landmark.x) &&
      Number.isFinite(landmark.y) &&
      (landmark.visibility ?? 1) >= MINIMUM_VISIBILITY,
  );
}

export function updateNeckMotion(
  state: NeckMotionState,
  landmarks: PoseLandmark[],
): NeckMotionState {
  const nose = landmarks[NOSE];
  const leftShoulder = landmarks[LEFT_SHOULDER];
  const rightShoulder = landmarks[RIGHT_SHOULDER];

  if (![nose, leftShoulder, rightShoulder].every(isVisible)) {
    if (state.stage !== "calibrating") {
      return { ...state, tracking: "out-of-frame" };
    }

    return {
      ...state,
      tracking: "out-of-frame",
      calibrationFrames: 0,
      horizontalTotal: 0,
      verticalTotal: 0,
    };
  }

  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  if (shoulderWidth < 0.05) return { ...state, tracking: "out-of-frame" };

  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const horizontal = (nose.x - shoulderMidX) / shoulderWidth;
  const vertical = (nose.y - shoulderMidY) / shoulderWidth;

  if (state.stage === "calibrating") {
    const calibrationFrames = state.calibrationFrames + 1;
    const horizontalTotal = state.horizontalTotal + horizontal;
    const verticalTotal = state.verticalTotal + vertical;

    if (calibrationFrames < CALIBRATION_FRAMES) {
      return {
        ...state,
        tracking: "ready",
        calibrationFrames,
        horizontalTotal,
        verticalTotal,
      };
    }

    return {
      ...state,
      stage: "first-side",
      tracking: "ready",
      calibrationFrames,
      horizontalTotal,
      verticalTotal,
      baselineHorizontal: horizontalTotal / calibrationFrames,
      baselineVertical: verticalTotal / calibrationFrames,
    };
  }

  if (state.stage === "complete") return { ...state, tracking: "ready" };

  const horizontalDelta = horizontal - (state.baselineHorizontal ?? 0);
  const verticalDelta = vertical - (state.baselineVertical ?? 0);

  if (state.stage === "first-side" && Math.abs(horizontalDelta) >= SIDE_THRESHOLD) {
    return {
      ...state,
      stage: "opposite-side",
      movements: 1,
      tracking: "ready",
      firstSideDirection: horizontalDelta < 0 ? -1 : 1,
    };
  }

  if (
    state.stage === "opposite-side" &&
    state.firstSideDirection !== null &&
    horizontalDelta * state.firstSideDirection <= -SIDE_THRESHOLD
  ) {
    return { ...state, stage: "down", movements: 2, tracking: "ready" };
  }

  if (
    state.stage === "down" &&
    Math.abs(horizontalDelta) <= CENTERED_HORIZONTAL_LIMIT &&
    verticalDelta >= DOWN_THRESHOLD
  ) {
    return { ...state, stage: "up", movements: 3, tracking: "ready" };
  }

  if (
    state.stage === "up" &&
    Math.abs(horizontalDelta) <= CENTERED_HORIZONTAL_LIMIT &&
    verticalDelta <= -UP_THRESHOLD
  ) {
    return { ...state, stage: "center", movements: 4, tracking: "ready" };
  }

  if (
    state.stage === "center" &&
    Math.abs(horizontalDelta) <= CENTER_THRESHOLD &&
    Math.abs(verticalDelta) <= CENTER_THRESHOLD
  ) {
    return { ...state, stage: "complete", tracking: "ready" };
  }

  return { ...state, tracking: "ready" };
}
