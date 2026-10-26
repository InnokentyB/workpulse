import type { PoseLandmark } from "./neck-motion-tracker";

export type StepTouchState = {
  count: number;
  phase: "calibrating" | "step" | "return" | "complete";
  expectedSide: "left" | "right";
  tracking: "lost" | "ready";
  calibrationFrames: number;
  baselineHip: number;
  baselineSpan: number;
  baselineWidth: number;
  stableFrames: number;
  openedAt: number | null;
  lastTimestamp: number;
};
const BODY = [0, 11, 12, 23, 24, 25, 26, 27, 28];
export function initialStepTouchState(count = 0): StepTouchState {
  const safeCount = Number.isInteger(count) ? Math.max(0, Math.min(8, count)) : 0;
  return { count: safeCount, phase: safeCount === 8 ? "complete" : "calibrating",
    expectedSide: safeCount % 2 === 0 ? "left" : "right", tracking: "lost",
    calibrationFrames: 0, baselineHip: 0, baselineSpan: 0, baselineWidth: 0,
    stableFrames: 0, openedAt: null, lastTimestamp: -1 };
}
function lost(state: StepTouchState, timestamp: number): StepTouchState {
  return { ...initialStepTouchState(state.count), lastTimestamp: timestamp };
}
/** Recognizes a side step and return, not dance quality or medically correct form. */
export function updateStepTouch(state: StepTouchState, landmarks: PoseLandmark[], timestamp: number): StepTouchState {
  if (!Number.isFinite(timestamp) || timestamp <= state.lastTimestamp) return state;
  if (state.phase === "complete") return { ...state, lastTimestamp: timestamp };
  // An unseen interval cannot prove a continuous opening/return sequence.
  if (state.lastTimestamp >= 0 && timestamp - state.lastTimestamp > 750) return lost(state, timestamp);
  if (BODY.some(i => !landmarks[i] || !Number.isFinite(landmarks[i].x) || !Number.isFinite(landmarks[i].y)
    || !Number.isFinite(landmarks[i].visibility) || (landmarks[i].visibility ?? 0) < .65 || landmarks[i].x < .015 || landmarks[i].x > .985
    || landmarks[i].y < .015 || landmarks[i].y > .985)) return lost(state, timestamp);
  const width = Math.abs(landmarks[12].x - landmarks[11].x);
  const hip = (landmarks[23].x + landmarks[24].x) / 2;
  const span = Math.abs(landmarks[28].x - landmarks[27].x);
  const shouldersY = (landmarks[11].y + landmarks[12].y) / 2;
  const hipsY = (landmarks[23].y + landmarks[24].y) / 2;
  if (width < .08 || hipsY - shouldersY < .12 || Math.min(landmarks[27].y, landmarks[28].y) <= hipsY + .15)
    return lost(state, timestamp);
  const current = { ...state, tracking: "ready" as const, lastTimestamp: timestamp };
  if (state.phase === "calibrating") {
    if (span > width * .9) return lost(state, timestamp);
    const steady = state.calibrationFrames > 0 && Math.abs(hip - state.baselineHip) < width * .08
      && Math.abs(span - state.baselineSpan) < width * .08 && Math.abs(width - state.baselineWidth) < width * .1;
    const frames = steady ? state.calibrationFrames + 1 : 1;
    const average = (previous: number, next: number) => steady ? previous + (next - previous) / frames : next;
    return { ...current, calibrationFrames: frames, baselineHip: average(state.baselineHip, hip),
      baselineSpan: average(state.baselineSpan, span), baselineWidth: average(state.baselineWidth, width),
      phase: frames >= 15 ? "step" : "calibrating" };
  }
  // Large scale jumps mean the person/camera moved; recalibration is required.
  if (Math.abs(width - state.baselineWidth) > state.baselineWidth * .3) return lost(state, timestamp);
  const signedHip = (hip - state.baselineHip) * (state.expectedSide === "left" ? -1 : 1);
  if (state.phase === "step") {
    const opening = span >= state.baselineSpan + .45 * width && signedHip >= .15 * width;
    const stableFrames = opening ? state.stableFrames + 1 : 0;
    return { ...current, stableFrames: stableFrames >= 3 ? 0 : stableFrames,
      openedAt: opening ? state.openedAt ?? timestamp : null,
      phase: stableFrames >= 3 ? "return" : "step" };
  }
  if (state.openedAt === null || timestamp - state.openedAt > 8000) return lost(state, timestamp);
  const returned = span <= state.baselineSpan + .15 * width && Math.abs(hip - state.baselineHip) <= .2 * width;
  const stableFrames = returned ? state.stableFrames + 1 : 0;
  if (stableFrames >= 3 && timestamp - state.openedAt >= 800) {
    const count = state.count + 1;
    return { ...current, count, phase: count === 8 ? "complete" : "step",
      expectedSide: count % 2 === 0 ? "left" : "right", stableFrames: 0, openedAt: null };
  }
  return { ...current, stableFrames };
}
