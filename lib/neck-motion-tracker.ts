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
  visibility: {
    face: boolean;
    leftShoulder: boolean;
    rightShoulder: boolean;
  };
  horizontalDelta: number | null;
  verticalDelta: number | null;
};

const NOSE = 0;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const MINIMUM_VISIBILITY = 0.55;
const CALIBRATION_FRAMES = 8;
export const NECK_MOTION_THRESHOLDS = {
  turn: 0.1,
  down: 0.08,
  up: 0.06,
  center: 0.07,
  centeredHorizontal: 0.12,
} as const;

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
  visibility: {
    face: false,
    leftShoulder: false,
    rightShoulder: false,
  },
  horizontalDelta: null,
  verticalDelta: null,
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
  const visibility = {
    face: isVisible(nose),
    leftShoulder: isVisible(leftShoulder),
    rightShoulder: isVisible(rightShoulder),
  };

  if (!Object.values(visibility).every(Boolean)) {
    if (state.stage !== "calibrating") {
      return { ...state, tracking: "out-of-frame", visibility };
    }

    return {
      ...state,
      tracking: "out-of-frame",
      visibility,
      calibrationFrames: 0,
      horizontalTotal: 0,
      verticalTotal: 0,
      horizontalDelta: null,
      verticalDelta: null,
    };
  }

  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  if (shoulderWidth < 0.05) {
    return { ...state, tracking: "out-of-frame", visibility };
  }

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
        visibility,
        calibrationFrames,
        horizontalTotal,
        verticalTotal,
      };
    }

    return {
      ...state,
      stage: "first-side",
      tracking: "ready",
      visibility,
      calibrationFrames,
      horizontalTotal,
      verticalTotal,
      baselineHorizontal: horizontalTotal / calibrationFrames,
      baselineVertical: verticalTotal / calibrationFrames,
      horizontalDelta: 0,
      verticalDelta: 0,
    };
  }

  const horizontalDelta = horizontal - (state.baselineHorizontal ?? 0);
  const verticalDelta = vertical - (state.baselineVertical ?? 0);
  const measuredState = {
    ...state,
    tracking: "ready" as const,
    visibility,
    horizontalDelta,
    verticalDelta,
  };

  if (state.stage === "complete") return measuredState;

  if (
    state.stage === "first-side" &&
    Math.abs(horizontalDelta) >= NECK_MOTION_THRESHOLDS.turn
  ) {
    return {
      ...measuredState,
      stage: "opposite-side",
      movements: 1,
      firstSideDirection: horizontalDelta < 0 ? -1 : 1,
    };
  }

  if (
    state.stage === "opposite-side" &&
    state.firstSideDirection !== null &&
    horizontalDelta * state.firstSideDirection <= -NECK_MOTION_THRESHOLDS.turn
  ) {
    return { ...measuredState, stage: "down", movements: 2 };
  }

  if (
    state.stage === "down" &&
    Math.abs(horizontalDelta) <= NECK_MOTION_THRESHOLDS.centeredHorizontal &&
    verticalDelta >= NECK_MOTION_THRESHOLDS.down
  ) {
    return { ...measuredState, stage: "up", movements: 3 };
  }

  if (
    state.stage === "up" &&
    Math.abs(horizontalDelta) <= NECK_MOTION_THRESHOLDS.centeredHorizontal &&
    verticalDelta <= -NECK_MOTION_THRESHOLDS.up
  ) {
    return { ...measuredState, stage: "center", movements: 4 };
  }

  if (
    state.stage === "center" &&
    Math.abs(horizontalDelta) <= NECK_MOTION_THRESHOLDS.center &&
    Math.abs(verticalDelta) <= NECK_MOTION_THRESHOLDS.center
  ) {
    return { ...measuredState, stage: "complete" };
  }

  return measuredState;
}
