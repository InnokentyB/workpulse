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

import { CameraIcon, CheckIcon } from "@/components/icons";
import {
  LiveNeckCue,
  NeckMovementPreview,
} from "@/components/NeckMovementGuide";
import { TimedActivitySession } from "@/components/TimedActivitySession";
import {
  INITIAL_NECK_MOTION_STATE,
  NECK_MOTION_THRESHOLDS,
  TARGET_NECK_MOVEMENTS,
  updateNeckMotion,
  type NeckMotionState,
  type PoseLandmark,
} from "@/lib/neck-motion-tracker";
import type { Activity, ActivityCompletion } from "@/lib/types";

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

type ActivitySessionProps = {
  activity: Activity;
  onComplete: (completion: ActivityCompletion) => void;
  onEvent?: (
    event: "camera_permission_denied" | "camera_start_failed" | "activity_skipped",
  ) => void;
};

function cameraMessage(status: CameraStatus): string {
  if (status === "denied") {
    return "Camera permission was declined. Allow camera access in your browser settings and try again.";
  }
  if (status === "unavailable") {
    return "No available camera was found on this device.";
  }
  return "WorkPulse could not start pose detection. Check your connection and try again.";
}

function trackingMessage(motion: NeckMotionState): string {
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

function stageLabel(motion: NeckMotionState): string {
  switch (motion.stage) {
    case "calibrating":
      return "Calibrating neutral position";
    case "first-side":
      return "Turn to either side";
    case "opposite-side":
      return "Turn to the other side";
    case "down":
      return "Lower your chin";
    case "up":
      return "Lift your gaze slightly";
    case "center":
      return "Return to neutral";
    case "complete":
      return "Movement check complete";
  }
}

function formatDelta(value: number | null): string {
  if (value === null) return "—";
  const percentage = Math.round(value * 100);
  if (percentage > 0) return `+${percentage}%`;
  if (percentage < 0) return `−${Math.abs(percentage)}%`;
  return "0%";
}

export function CameraDiagnostics({
  motion,
  onRecalibrate,
}: {
  motion: NeckMotionState;
  onRecalibrate: () => void;
}) {
  const shouldersVisible =
    motion.visibility.leftShoulder && motion.visibility.rightShoulder;

  return (
    <section aria-label="Camera diagnostics" className="camera-diagnostics">
      <div className="camera-diagnostics__heading">
        <div>
          <p>Camera check</p>
          <strong>{stageLabel(motion)}</strong>
        </div>
        <button
          className="button button--quiet camera-diagnostics__recalibrate"
          onClick={onRecalibrate}
          type="button"
        >
          Recalibrate
        </button>
      </div>

      <div className="camera-diagnostics__visibility">
        <span data-ready={motion.visibility.face}>
          {motion.visibility.face ? "Face visible" : "Face not visible"}
        </span>
        <span data-ready={shouldersVisible}>
          {shouldersVisible
            ? "Both shoulders visible"
            : "Bring both shoulders into frame"}
        </span>
      </div>

      <dl className="camera-diagnostics__measurements">
        <div>
          <dt>Horizontal</dt>
          <dd>{formatDelta(motion.horizontalDelta)}</dd>
        </div>
        <div>
          <dt>Vertical</dt>
          <dd>{formatDelta(motion.verticalDelta)}</dd>
        </div>
      </dl>

      <p className="camera-diagnostics__thresholds">
        Movement thresholds · Turn: {NECK_MOTION_THRESHOLDS.turn * 100}% · Chin: {NECK_MOTION_THRESHOLDS.down * 100}% · Gaze: {NECK_MOTION_THRESHOLDS.up * 100}%
      </p>
    </section>
  );
}

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

function CameraActivitySession({
  activity,
  onComplete,
  onEvent,
}: ActivitySessionProps) {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [motion, setMotion] = useState(INITIAL_NECK_MOTION_STATE);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<PoseLandmarkerInstance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const runDetectionRef = useRef<(timestamp: number) => void>(() => undefined);
  const cameraRequestRef = useRef(0);
  const lastInferenceRef = useRef(0);
  const motionRef = useRef(INITIAL_NECK_MOTION_STATE);

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
        completedSteps: movements,
        mode: verified ? "camera" : "manual",
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

          const nextMotion = updateNeckMotion(
            motionRef.current,
            (landmarks ?? []) as PoseLandmark[],
          );
          motionRef.current = nextMotion;
          setMotion(nextMotion);
          lastInferenceRef.current = timestamp;

          if (nextMotion.stage === "complete") {
            finish(true, TARGET_NECK_MOVEMENTS);
            return;
          }
        } catch {
          stopCamera();
          setStatus("error");
          onEvent?.("camera_start_failed");
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame((nextTimestamp) =>
        runDetectionRef.current(nextTimestamp),
      );
    },
    [finish, onEvent, stopCamera],
  );

  useEffect(() => {
    runDetectionRef.current = runDetection;
  }, [runDetection]);

  const startCamera = useCallback(async () => {
    const requestId = cameraRequestRef.current + 1;
    cameraRequestRef.current = requestId;
    setStatus("loading");
    setMotion(INITIAL_NECK_MOTION_STATE);
    motionRef.current = INITIAL_NECK_MOTION_STATE;

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      onEvent?.("camera_start_failed");
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
      stopCamera();
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setStatus("denied");
        onEvent?.("camera_permission_denied");
      } else if (
        error instanceof DOMException &&
        (error.name === "NotFoundError" || error.name === "NotReadableError")
      ) {
        setStatus("unavailable");
        onEvent?.("camera_start_failed");
      } else {
        setStatus("error");
        onEvent?.("camera_start_failed");
      }
    }
  }, [onEvent, stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  const showCamera = status === "loading" || status === "active";
  const showError =
    status === "denied" || status === "unavailable" || status === "error";
  const recalibrate = useCallback(() => {
    motionRef.current = INITIAL_NECK_MOTION_STATE;
    setMotion(INITIAL_NECK_MOTION_STATE);
  }, []);

  return (
    <section aria-live="polite" className="activity-session activity-session--camera">
      <div className="activity-session__heading">
        <div>
          <p>Camera-guided activity</p>
          <h2>{activity.name}</h2>
        </div>
        <div
          className="movement-progress"
          aria-label={`${motion.movements} of ${TARGET_NECK_MOVEMENTS} neck movements`}
        >
          <strong>{motion.movements}</strong>
          <span>/ {TARGET_NECK_MOVEMENTS}</span>
        </div>
      </div>

      <div className="camera-stage" data-visible={showCamera}>
        <video aria-label="Live camera preview" muted playsInline ref={videoRef} />
        <canvas aria-hidden="true" ref={canvasRef} />
        {status === "loading" ? (
          <div className="camera-stage__loading">
            <span aria-hidden="true" />
            <p>Starting the camera and pose model…</p>
          </div>
        ) : null}
        {status === "active" ? (
          <>
            <div className="camera-stage__live">
              <span aria-hidden="true" /> Camera active
            </div>
            <LiveNeckCue motion={motion} />
          </>
        ) : null}
      </div>

      {status === "idle" ? (
        <>
          <div className="camera-consent">
            <CameraIcon />
            <div>
              <h3>Follow four gentle neck movements</h3>
              <p>
                Your image is processed on this device. WorkPulse does not record,
                save, or upload video. The camera switches off after the movement check.
              </p>
            </div>
          </div>
          <NeckMovementPreview />
        </>
      ) : null}

      {status === "active" ? (
        <>
          <p className="tracking-message">{trackingMessage(motion)}</p>
          <CameraDiagnostics motion={motion} onRecalibrate={recalibrate} />
        </>
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
              onEvent?.("activity_skipped");
            }}
            type="button"
          >
            Stop camera
          </button>
        ) : null}
        {status !== "loading" && status !== "active" ? (
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

export function ActivitySession(props: ActivitySessionProps) {
  if (props.activity.sessionType === "timer") {
    return (
      <TimedActivitySession
        activity={props.activity}
        onComplete={props.onComplete}
      />
    );
  }

  return <CameraActivitySession {...props} />;
}
