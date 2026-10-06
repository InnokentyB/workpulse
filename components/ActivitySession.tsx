"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  NormalizedLandmark,
  PoseLandmarker as PoseLandmarkerInstance,
} from "@mediapipe/tasks-vision";

import {
  CameraIcon,
  CheckIcon,
  ShoulderRollsIcon,
} from "@/components/icons";
import {
  INITIAL_NECK_MOTION_STATE,
  TARGET_NECK_MOVEMENTS,
  updateNeckMotion,
  type NeckMotionState,
  type PoseLandmark,
} from "@/lib/neck-motion-tracker";
import {
  INITIAL_SHOULDER_MOTION_STATE,
  TARGET_SHOULDER_ROLLS,
  updateShoulderMotion,
  type ShoulderMotionState,
} from "@/lib/shoulder-motion-tracker";
import { DanceSession } from "@/components/DanceSession";
import type { Activity } from "@/lib/types";

const WASM_ROOT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const INFERENCE_INTERVAL_MS = 100;
const POSE_CONNECTIONS = [
  [0, 7],
  [0, 8],
  [7, 11],
  [8, 12],
  [11, 12],
  [11, 13],
  [12, 14],
] as const;

type CameraStatus =
  | "idle"
  | "loading"
  | "active"
  | "denied"
  | "unavailable"
  | "error";

export type ActivityCompletion = {
  mode: "camera" | "guided" | "manual";
  movements: number;
  verified: boolean;
};

type ActivitySessionProps = {
  activity: Activity;
  neckCheckpoint?: NeckMotionState;
  onNeckCheckpoint?: (checkpoint: NeckMotionState) => void;
  onComplete: (completion: ActivityCompletion) => void;
  /** Optional live count for experiences that own completion outside this session. */
  onProgress?: (newCycles: number) => void;
  progressCount?: number;
  gameMode?: boolean;
  onCameraFailure?: () => void;
};

function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

function useWorkingAreaFocus<T extends HTMLElement>(enabled = true) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;
    const element = elementRef.current;
    element?.focus({ preventScroll: true });
    element?.scrollIntoView?.({
      behavior: preferredScrollBehavior(),
      block: "start",
    });
  }, [enabled]);

  return elementRef;
}

function cameraMessage(status: CameraStatus): string {
  if (status === "denied") {
    return "Camera permission was declined. Allow camera access in your browser settings and try again.";
  }
  if (status === "unavailable") {
    return "No available camera was found on this device.";
  }
  return "WorkPulse could not start pose detection. Check your connection and try again.";
}

function neckTrackingMessage(motion: NeckMotionState): string {
  if (motion.tracking === "out-of-frame") {
    return "Keep your face and both shoulders visible.";
  }

  switch (motion.stage) {
    case "calibrating":
      return "Face the camera and hold a comfortable neutral position.";
    case "first-side":
      return "Slowly turn your head to either side.";
    case "opposite-side":
      return "Now turn through center to the other side.";
    case "down":
      return "Return to center, then lower your chin gently.";
    case "up":
      return "Return through center and lift your gaze slightly.";
    case "center":
      return "Return to a comfortable neutral position.";
    case "complete":
      return "Movement check complete.";
  }
}

function shoulderTrackingMessage(motion: ShoulderMotionState): string {
  if (motion.tracking === "out-of-frame") {
    return "Keep both shoulders visible in the frame.";
  }

  switch (motion.stage) {
    case "calibrating":
      return "Sit tall and let your shoulders relax.";
    case "lift":
      return "Lift both shoulders toward your ears to begin the next roll.";
    case "lower":
      return "Circle your shoulders back and lower them gently.";
    case "complete":
      return "Shoulder roll check complete.";
  }
}

type CameraMotionState = {
  movements: number;
  stage: string;
  tracking: "out-of-frame" | "ready";
};

type CameraMotionGuide<State extends CameraMotionState> = {
  consentTitle: string;
  initialState: State;
  progressLabel: string;
  targetMovements: number;
  trackingMessage: (motion: State) => string;
  updateMotion: (state: State, landmarks: PoseLandmark[]) => State;
  resumeMotion?: (calibrated: State, checkpoint: State) => State;
  gameProgress?: (motion: State) => number;
};

const NECK_GUIDE: CameraMotionGuide<NeckMotionState> = {
  consentTitle: "Follow four gentle neck movements",
  initialState: INITIAL_NECK_MOTION_STATE,
  progressLabel: "neck movements",
  targetMovements: TARGET_NECK_MOVEMENTS,
  trackingMessage: neckTrackingMessage,
  updateMotion: updateNeckMotion,
  resumeMotion: (calibrated, checkpoint) => ({
    ...calibrated,
    stage: checkpoint.stage,
    movements: checkpoint.movements,
    firstSideDirection: checkpoint.firstSideDirection,
  }),
  // The final point includes the neutral return, not just lifting the gaze.
  gameProgress: (motion) => motion.stage === "complete" ? motion.movements : Math.min(3, motion.movements),
};

const SHOULDER_GUIDE: CameraMotionGuide<ShoulderMotionState> = {
  consentTitle: "Complete six slow shoulder rolls",
  initialState: INITIAL_SHOULDER_MOTION_STATE,
  progressLabel: "shoulder rolls",
  targetMovements: TARGET_SHOULDER_ROLLS,
  trackingMessage: shoulderTrackingMessage,
  updateMotion: updateShoulderMotion,
};

function drawPose(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  landmarks: NormalizedLandmark[] | undefined,
) {
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  const drawingContext = canvas.getContext("2d");
  if (!drawingContext) return;

  drawingContext.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks) return;

  drawingContext.lineCap = "round";
  drawingContext.lineWidth = Math.max(3, canvas.width / 240);
  drawingContext.strokeStyle = "#b8f36b";

  for (const [startIndex, endIndex] of POSE_CONNECTIONS) {
    const start = landmarks[startIndex];
    const end = landmarks[endIndex];
    if ((start.visibility ?? 1) < 0.55 || (end.visibility ?? 1) < 0.55) continue;

    drawingContext.beginPath();
    drawingContext.moveTo(start.x * canvas.width, start.y * canvas.height);
    drawingContext.lineTo(end.x * canvas.width, end.y * canvas.height);
    drawingContext.stroke();
  }

  drawingContext.fillStyle = "#f8f8f1";
  for (const landmarkIndex of [0, 7, 8, 11, 12, 13, 14]) {
    const landmark = landmarks[landmarkIndex];
    if (!landmark) continue;
    if ((landmark.visibility ?? 1) < 0.55) continue;
    drawingContext.beginPath();
    drawingContext.arc(
      landmark.x * canvas.width,
      landmark.y * canvas.height,
      Math.max(3, canvas.width / 180),
      0,
      Math.PI * 2,
    );
    drawingContext.fill();
  }
}

function CameraPoseSession<State extends CameraMotionState>({
  activity,
  guide,
  onComplete,
  onProgress,
  progressCount,
  gameMode = false,
  onCameraFailure,
  checkpoint,
  onCheckpoint,
}: ActivitySessionProps & { guide: CameraMotionGuide<State>; checkpoint?: State; onCheckpoint?: (state: State) => void }) {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [motion, setMotion] = useState(guide.initialState);
  const sessionRef = useWorkingAreaFocus<HTMLElement>(!gameMode);
  const cameraStageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<PoseLandmarkerInstance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const runDetectionRef = useRef<(timestamp: number) => void>(() => undefined);
  const cameraRequestRef = useRef(0);
  const lastInferenceRef = useRef(0);
  const motionRef = useRef(guide.initialState);
  const reportedMovementsRef = useRef(0);
  const checkpointRef = useRef(checkpoint);
  const reportedAtStartRef = useRef(0);

  const stopCamera = useCallback(() => {
    cameraRequestRef.current += 1;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) videoRef.current.srcObject = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
  }, []);

  const finish = useCallback(
    (verified: boolean, movements: number) => {
      stopCamera();
      onComplete({
        mode: verified ? "camera" : "manual",
        movements,
        verified,
      });
    },
    [onComplete, stopCamera],
  );

  const runDetection = useCallback(
    (timestamp: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !canvas || !landmarker || video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame((nextTimestamp) =>
          runDetectionRef.current(nextTimestamp),
        );
        return;
      }

      if (timestamp - lastInferenceRef.current >= INFERENCE_INTERVAL_MS) {
        try {
          const result = landmarker.detectForVideo(video, timestamp);
          const landmarks = result.landmarks[0];
          drawPose(canvas, video, landmarks);

          const previousMotion = motionRef.current;
          let nextMotion = guide.updateMotion(
            previousMotion,
            (landmarks ?? []) as PoseLandmark[],
          );
          if (gameMode && previousMotion.stage === "calibrating" && nextMotion.stage !== "calibrating" && checkpointRef.current && guide.resumeMotion) {
            nextMotion = guide.resumeMotion(nextMotion, checkpointRef.current);
          }
          motionRef.current = nextMotion;
          if (gameMode && nextMotion.stage !== "calibrating") {
            checkpointRef.current = nextMotion;
            onCheckpoint?.(nextMotion);
          }
          const gameProgress = guide.gameProgress?.(nextMotion) ?? nextMotion.movements;
          if (gameMode && gameProgress > reportedMovementsRef.current) {
            const increment = gameProgress - reportedMovementsRef.current;
            reportedMovementsRef.current = gameProgress;
            onProgress?.(increment);
          }
          if (
            nextMotion.stage !== previousMotion.stage ||
            nextMotion.movements !== previousMotion.movements ||
            nextMotion.tracking !== previousMotion.tracking
          ) {
            setMotion(nextMotion);
          }
          lastInferenceRef.current = timestamp;

          if (nextMotion.stage === "complete") {
            if (gameMode) {
              stopCamera();
              setStatus("idle");
            } else {
              finish(true, guide.targetMovements);
            }
            return;
          }
        } catch {
          stopCamera();
          onCameraFailure?.();
          setStatus("error");
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame((nextTimestamp) =>
        runDetectionRef.current(nextTimestamp),
      );
    },
    [finish, gameMode, guide, onCameraFailure, onCheckpoint, onProgress, stopCamera],
  );

  useEffect(() => {
    runDetectionRef.current = runDetection;
  }, [runDetection]);

  const startCamera = useCallback(async () => {
    const requestId = cameraRequestRef.current + 1;
    cameraRequestRef.current = requestId;
    setStatus("loading");
    setMotion(guide.initialState);
    motionRef.current = guide.initialState;
    reportedMovementsRef.current = gameMode && guide.resumeMotion ? reportedAtStartRef.current : 0;

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      onCameraFailure?.();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          height: { ideal: 720 },
          width: { ideal: 960 },
        },
      });

      if (cameraRequestRef.current !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("Camera preview is unavailable");
      video.srcObject = stream;
      await video.play();

      const { FilesetResolver, PoseLandmarker } = await import(
        "@mediapipe/tasks-vision"
      );
      const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL },
        minPoseDetectionConfidence: 0.55,
        minPosePresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
        numPoses: 1,
        outputSegmentationMasks: false,
        runningMode: "VIDEO",
      });

      if (cameraRequestRef.current !== requestId) {
        landmarker.close();
        return;
      }
      landmarkerRef.current = landmarker;

      setStatus("active");
      lastInferenceRef.current = 0;
      animationFrameRef.current = requestAnimationFrame((timestamp) =>
        runDetectionRef.current(timestamp),
      );
    } catch (error) {
      if (cameraRequestRef.current !== requestId) return;
      stopCamera();
      onCameraFailure?.();
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setStatus("denied");
      } else if (
        error instanceof DOMException &&
        (error.name === "NotFoundError" || error.name === "NotReadableError")
      ) {
        setStatus("unavailable");
      } else {
        setStatus("error");
      }
    }
  }, [gameMode, guide, onCameraFailure, stopCamera]);

  // Keep already awarded neck points when this camera is stopped/retried.
  useEffect(() => {
    reportedAtStartRef.current = progressCount ?? 0;
  }, [progressCount]);

  useEffect(() => stopCamera, [stopCamera]);

  const positionCameraStage = useCallback((behavior: ScrollBehavior) => {
    const cameraStage = cameraStageRef.current;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const block =
      cameraStage && cameraStage.getBoundingClientRect().height > viewportHeight - 48
        ? "start"
        : "center";
    cameraStage?.scrollIntoView?.({ behavior, block });
  }, []);

  useEffect(() => {
    if (gameMode || (status !== "loading" && status !== "active")) return;
    positionCameraStage(preferredScrollBehavior());

    const reposition = () => positionCameraStage("auto");
    window.addEventListener("resize", reposition);
    window.visualViewport?.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("resize", reposition);
      window.visualViewport?.removeEventListener("resize", reposition);
    };
  }, [gameMode, positionCameraStage, status]);

  const showCamera = status === "loading" || status === "active";
  const showError =
    status === "denied" || status === "unavailable" || status === "error";

  return (
    <section
      className="activity-session activity-session--camera"
      ref={sessionRef}
      tabIndex={-1}
    >
      <div className="activity-session__heading">
        <div>
          <p>Camera-guided activity</p>
          <h2>{activity.name}</h2>
        </div>
        <div
          className="movement-progress"
          aria-label={`${progressCount ?? motion.movements} of ${guide.targetMovements} ${guide.progressLabel}`}
        >
          <strong>{progressCount ?? motion.movements}</strong>
          <span>/ {guide.targetMovements}</span>
        </div>
      </div>

      <div className="camera-stage" data-visible={showCamera} ref={cameraStageRef}>
        <video aria-label="Live camera preview" muted playsInline ref={videoRef} />
        <canvas aria-hidden="true" ref={canvasRef} />
        {status === "loading" ? (
          <div className="camera-stage__loading">
            <span aria-hidden="true" />
            <p>Starting the camera and pose model…</p>
          </div>
        ) : null}
        {status === "active" ? (
          <div className="camera-stage__live">
            <span aria-hidden="true" /> Camera active
          </div>
        ) : null}
      </div>

      {status === "idle" ? (
        <div className="camera-consent">
          <CameraIcon />
          <div>
            <h3>{guide.consentTitle}</h3>
            <p>
              Your image is processed on this device. WorkPulse does not record,
              save, or upload video. The camera switches off after the movement check.
            </p>
          </div>
        </div>
      ) : null}

      {status === "active" ? (
        <p aria-atomic="true" className="tracking-message" role="status">
          {guide.trackingMessage(motion)}
        </p>
      ) : null}

      <p className="activity-safety-note">
        Use a comfortable range. Stop if you feel pain or dizziness.
      </p>

      {showError ? (
        <div className="camera-error" role="alert">
          <strong>Camera did not start</strong>
          <p>{cameraMessage(status)}</p>
        </div>
      ) : null}

      <div className="camera-privacy-line">
        <span aria-hidden="true" /> Local pose detection · No video recording
      </div>

      <div className="activity-session__actions">
        {status === "idle" || showError ? (
          <button className="button button--complete" onClick={startCamera} type="button">
            <CameraIcon /> {showError ? "Try camera again" : "Enable camera"}
          </button>
        ) : null}
        {status === "loading" ? (
          <>
            <button className="button button--complete" disabled type="button">
              Starting camera…
            </button>
            <button
              className="button button--quiet"
              onClick={() => {
                stopCamera();
                setStatus("idle");
              }}
              type="button"
            >
              Cancel
            </button>
          </>
        ) : null}
        {status === "active" ? (
          <button
            className="button button--quiet"
            onClick={() => {
              stopCamera();
              setStatus("idle");
            }}
            type="button"
          >
            Stop camera
          </button>
        ) : null}
        {!gameMode && status !== "loading" && status !== "active" ? (
          <button
            className="button button--quiet"
            onClick={() => finish(false, motion.movements)}
            type="button"
          >
            <CheckIcon /> Finish without camera
          </button>
        ) : null}
      </div>
    </section>
  );
}

function GuidedStepsSession({
  activity,
  onComplete,
}: ActivitySessionProps) {
  const steps = activity.steps ?? [activity.instructions];
  const sessionRef = useWorkingAreaFocus<HTMLElement>();

  return (
    <section
      aria-live="polite"
      className="activity-session activity-session--guided"
      ref={sessionRef}
      tabIndex={-1}
    >
      <div className="activity-session__heading">
        <div className="guided-title">
          <span className="guided-title__icon">
            <ShoulderRollsIcon />
          </span>
          <div>
            <p>Screen-guided activity · no camera needed</p>
            <h2>{activity.name}</h2>
          </div>
        </div>
        <div className="guided-duration">
          <strong>{activity.durationSeconds}</strong>
          <span>sec</span>
        </div>
      </div>

      <p className="guided-intro">{activity.instructions}</p>
      <ol className="guided-steps">
        {steps.map((step, index) => (
          <li key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </li>
        ))}
      </ol>

      <p className="activity-safety-note">
        Move slowly and stay within a comfortable range. Stop if you feel pain
        or dizziness.
      </p>

      <div className="activity-session__actions">
        <button
          className="button button--complete"
          onClick={() =>
            onComplete({
              mode: "guided",
              movements: activity.movementCount ?? steps.length,
              verified: false,
            })
          }
          type="button"
        >
          <CheckIcon /> Complete activity
        </button>
      </div>
    </section>
  );
}

export function ActivitySession(props: ActivitySessionProps) {
  if (props.activity.guide === "guided-dance") {
    return <DanceSession onComplete={props.onComplete} />;
  }
  if (props.activity.guide === "guided-steps") {
    return <GuidedStepsSession {...props} />;
  }

  if (props.activity.guide === "camera-shoulders") {
    return <CameraPoseSession {...props} guide={SHOULDER_GUIDE} />;
  }

  return <CameraPoseSession {...props} guide={NECK_GUIDE} checkpoint={props.neckCheckpoint} onCheckpoint={props.onNeckCheckpoint} />;
}
