"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MovementScene from "./MovementScene";
import RouteScene from "./RouteScene";
import {initialRouteState,updateRoute} from "@/lib/route-motion-tracker";
import { initialStepTouchState, updateStepTouch } from "@/lib/step-touch-tracker";
import {INITIAL_NECK_MOTION_STATE,updateNeckMotion,type NeckMotionState,type PoseLandmark} from "@/lib/neck-motion-tracker";
import {INITIAL_SHOULDER_MOTION_STATE,updateShoulderMotion,type ShoulderMotionState} from "@/lib/shoulder-motion-tracker";
import {getExercise,type ExerciseId} from "@/lib/personal/exercises";
import "./step-touch.css";

export type StepTouchChallengeProps = {
  goal: "trail" | "workshop";
  initialCount?: number;
  exerciseId?: ExerciseId;
  movementVersion?: "route-v1" | "steps-v1";
  onCycle: (count: number) => Promise<boolean>;
  onPause?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  /** Dependency injection for an isolated fixture build; live routes never supply it. */
  detectorFactory?: () => Promise<StepTouchDetector>;
};
export type StepTouchDetector = {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks: PoseLandmark[][] };
  close: () => void;
};
type Status = "idle" | "loading" | "active" | "paused" | "error" | "save-error" | "complete";
const WASM_ROOT = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const EDGES = [[11,12],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[11,13],[12,14],[13,15],[14,16]];

function MovementExample({route,count}:{route:boolean;count:number}) {
  const armStage=route&&count>=6;
  return <section className="step-example" aria-labelledby="step-example-title">
    <h3 id="step-example-title">Movement example</h3>
    <p>{armStage ? count===6 ? "Open both arms sideways. Hold briefly, then lower both arms to open the gate." : "Raise both arms overhead. Hold briefly, then lower both arms to light the lantern." : "Step out → return to centre. Alternate sides. Only the foot-and-body pattern is counted."}</p>
    <svg className={`step-example__figure ${armStage ? count===6 ? "step-example--side" : "step-example--up" : ""}`} viewBox="0 0 360 230" role="img" aria-label={armStage ? count===6 ? "Example: arms sideways, hold, lower" : "Example: arms overhead, hold, lower" : "Example: step left, return to centre, step right, return to centre"}>
      <path d="M30 209H330" stroke="currentColor" strokeWidth="2" opacity=".25"/>
      <g className="step-example__body" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="180" cy="45" r="17"/>
        <path d="M180 65V126"/>
        <path className="step-example__arms" d={armStage ? count===6 ? "M180 80L115 80M180 80L245 80" : "M180 80L150 20M180 80L210 20" : "M180 80L146 110M180 80L214 110"}/>
        <path className="step-example__legs" d="M180 126L163 202M180 126L197 202"/>
      </g>
      <g fill="currentColor" fontSize="14" textAnchor="middle">{armStage ? <text x="180" y="225">{count===6 ? "Arms sideways · hold · lower" : "Arms overhead · hold · lower"}</text> : <><text x="65" y="225">← step</text><text x="180" y="225">centre</text><text x="295" y="225">step →</text></>}</g>
    </svg>
    <ol><li>Stand with feet close and your whole body visible, including both hands.</li><li>{armStage ? "Follow the arm example. Hold for at least 0.6 seconds, then lower both arms." : "Step to the highlighted side, then return to the centre."}</li><li>{route ? "Six alternating steps → arms sideways to open the gate → arms overhead to light the lantern." : "Repeat to the other side. Eight recognized patterns finish the round."}</li></ol>
    <p className="step-example__static">{armStage ? count===6 ? "Static guide: arms down → arms sideways → hold → arms down." : "Static guide: arms down → arms overhead → hold → arms down." : "Static guide: feet together → step left and return → step right and return."}</p>
  </section>;
}

type UpperMotion = {
  count:number;lastTimestamp:number;neck:NeckMotionState;shoulder:ShoulderMotionState;
  candidate:string;stableFrames:number;candidateSince:number;liftedAt:number|null;
  anchor:{x:number;y:number;headHip:number;shoulderGap:number;width:number}|null;
};
function initialUpper(count:number):UpperMotion{return {count,lastTimestamp:-1,neck:{...INITIAL_NECK_MOTION_STATE,movements:count,firstSideDirection:-1},shoulder:{...INITIAL_SHOULDER_MOTION_STATE,movements:count},candidate:'',stableFrames:0,candidateSince:0,liftedAt:null,anchor:null};}
function neckStage(count:number):NeckMotionState['stage']{return count===0?'first-side':count===1?'opposite-side':count===2?'down':count===3?'up':'complete';}
/** Existing deterministic trackers, with continuous visible samples and neutral recalibration.
 * Shoulder scoring additionally requires torso-relative shoulder lift and a still head.
 */
function updateUpper(previous:UpperMotion,p:PoseLandmark[],t:number,neck:boolean):UpperMotion{
 if(!Number.isFinite(t)||t<=previous.lastTimestamp)return previous;
 const reset=()=>({...initialUpper(previous.count),lastTimestamp:t});
 if(previous.lastTimestamp>=0&&t-previous.lastTimestamp>750)return reset();
 const required=neck?[0,11,12]:[0,11,12,23,24];
 if(required.some(i=>!p[i]||!Number.isFinite(p[i].x)||!Number.isFinite(p[i].y)||!Number.isFinite(p[i].visibility)||(p[i].visibility??0)<.65||p[i].x<.015||p[i].x>.985||p[i].y<.015||p[i].y>.985))return reset();
 const width=Math.abs(p[12].x-p[11].x),midX=(p[11].x+p[12].x)/2,midY=(p[11].y+p[12].y)/2;
 if(width<.08)return reset();
 const hipY=neck?0:(p[23].y+p[24].y)/2;
 const current={x:(p[0].x-midX)/width,y:(p[0].y-midY)/width,headHip:(p[0].y-hipY)/width,shoulderGap:(hipY-midY)/width,width};
 const stage=neck?previous.neck.stage:previous.shoulder.stage;
 const anchor=previous.anchor;
 if(anchor&&Math.abs(width-anchor.width)>.3*anchor.width)return reset();
 if(!neck&&(hipY-midY<.12||anchor&&Math.abs(current.headHip-anchor.headHip)>.025))return reset();
 if(stage==='calibrating'){
  if(anchor&&(Math.abs(current.x-anchor.x)>.03||neck&&Math.abs(current.y-anchor.y)>.03||!neck&&Math.abs(current.shoulderGap-anchor.shoulderGap)>.025))return reset();
  if(neck){let next=updateNeckMotion(previous.neck,p);if(next.stage!=='calibrating')next={...next,stage:neckStage(previous.count),movements:previous.count,firstSideDirection:-1};return {...previous,lastTimestamp:t,anchor:anchor??current,neck:next};}
  return {...previous,lastTimestamp:t,anchor:anchor??current,shoulder:updateShoulderMotion(previous.shoulder,p)};
 }
 const state={...previous,lastTimestamp:t};
 if(neck){
  // Fixed left-first instruction makes a resumed count1 unambiguous.
  if(previous.neck.stage==='first-side'&&current.x-(previous.neck.baselineHorizontal??0)>-.1)return {...state,candidate:'',stableFrames:0};
  const next=updateNeckMotion(previous.neck,p);
  if(next.stage===previous.neck.stage)return {...state,candidate:'',stableFrames:0};
  const stableFrames=previous.candidate===next.stage?previous.stableFrames+1:1;
  const candidateSince=previous.candidate===next.stage?previous.candidateSince:t;
  if(stableFrames<3||t-candidateSince<200)return {...state,candidate:next.stage,stableFrames,candidateSince};
  return {...state,neck:next,count:next.stage==='complete'?4:Math.min(3,next.movements),candidate:'',stableFrames:0};
 }
 const next=updateShoulderMotion(previous.shoulder,p);
 if(next.stage===previous.shoulder.stage)return {...state,candidate:'',stableFrames:0};
 if(next.stage==='lower'&&anchor&&current.shoulderGap-anchor.shoulderGap<.055)return {...state,candidate:'',stableFrames:0};
 const stableFrames=previous.candidate===next.stage?previous.stableFrames+1:1;
 const candidateSince=previous.candidate===next.stage?previous.candidateSince:t;
 if(stableFrames<3||t-candidateSince<200||previous.shoulder.stage==='lower'&&(previous.liftedAt===null||t-previous.liftedAt<600))return {...state,candidate:next.stage,stableFrames,candidateSince};
 return {...state,shoulder:next,count:next.movements,liftedAt:next.stage==='lower'?candidateSince:null,candidate:'',stableFrames:0};
}
function upperInstruction(s:UpperMotion,neck:boolean){
 const stage=neck?s.neck.stage:s.shoulder.stage;
 if(stage==='calibrating')return `Keep your head still and shoulders relaxed — calibrating ${neck?s.neck.calibrationFrames:s.shoulder.calibrationFrames} / 8`;
 if(!neck)return stage==='lower'?'Lower both shoulders back to the relaxed position.':'Gently lift both shoulders toward your ears; keep your head still.';
 return stage==='first-side'?'Gently move your head left in the camera picture.':stage==='opposite-side'?'Gently move your head right in the camera picture.':stage==='down'?'Return to the centre and gently lower your chin.':stage==='up'?'Gently raise your chin within a comfortable range.':'Return your head to the relaxed centre position.';
}
function UpperExample({neck}:{neck:boolean}){
 return <section className="step-example" aria-labelledby="step-example-title"><h3 id="step-example-title">Movement example</h3><p>{neck?'Keep your shoulders still. Move your head gently left, right, down, up, then return to centre.':'Keep your head still. Raise both shoulders toward your ears, then lower them fully. Repeat six times.'}</p><svg viewBox="0 0 360 180" role="img" aria-label={neck?'Static example: head left, right, chin down, chin up, centre':'Static example: both shoulders relaxed, raised, then relaxed'}><g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"><circle cx="180" cy="50" r="24"/><path d="M180 74V130M180 90L120 110M180 90L240 110"/>{neck?<><path d="M125 50H80L90 40M80 50L90 60M235 50H280L270 40M280 50L270 60M180 12V2M180 145V165"/></>:<><path d="M115 90V65L105 75M115 65L125 75M245 90V65L235 75M245 65L255 75"/><path d="M180 90L120 80M180 90L240 80" strokeDasharray="6 7"/></>}</g></svg><ol>{neck?<><li>Frame your head and both shoulders.</li><li>Follow the current direction slowly. Keep each position steady briefly.</li><li>Four directions count only in order; finish by returning to centre.</li></>:<><li>Frame your head, both shoulders and hips.</li><li>Lift both shoulders, then relax them fully. Keep your head still.</li><li>Six complete lift-and-lower patterns finish the round.</li></>}</ol><p>Use a small comfortable range. Stop if uncomfortable. The camera checks a movement pattern, not exercise form.</p></section>;
}

export function StepTouchChallenge({ goal, initialCount = 0, exerciseId = "lantern-route", movementVersion = "route-v1", onCycle, onPause, onCancel, onComplete, detectorFactory }: StepTouchChallengeProps) {
  const upper=exerciseId!=="lantern-route",neck=exerciseId==="neck-reset";
  const route = !upper&&movementVersion === "route-v1";
  const target=getExercise(exerciseId)?.target??8;
  const safeInitial = Math.min(target,initialStepTouchState(initialCount).count);
  const upperMotion=useRef(initialUpper(safeInitial));
  const [count, setCount] = useState(safeInitial);
  const [status, setStatus] = useState<Status>(safeInitial === target ? "complete" : "idle");
  const [instruction, setInstruction] = useState("Keep your head, shoulders, hips, knees and feet visible.");
  const [error, setError] = useState("");
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const video = useRef<HTMLVideoElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null), model = useRef<StepTouchDetector | null>(null);
  const generation = useRef(0), frameId = useRef<number | null>(null), lastInference = useRef(-1);
  const startupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const acknowledged = useRef(safeInitial), motion = useRef(initialRouteState(safeInitial));
  const pending = useRef<number | null>(null), saving = useRef(false), completed = useRef(safeInitial === target);
  const mounted = useRef(true), saveAttempt = useRef(0);
  const interruptSave = useRef<(() => void) | null>(null);
  const callbacks = useRef({ onCycle, onPause, onCancel, onComplete, detectorFactory });
  useEffect(() => { callbacks.current = { onCycle, onPause, onCancel, onComplete, detectorFactory }; }, [onCycle,onPause,onCancel,onComplete,detectorFactory]);
  const stopCamera = useCallback(() => {
    generation.current += 1;
    interruptSave.current?.();
    interruptSave.current = null;
    if (startupTimer.current !== null) clearTimeout(startupTimer.current);
    startupTimer.current = null;
    if (frameId.current !== null) cancelAnimationFrame(frameId.current);
    frameId.current = null;
    stream.current?.getTracks().forEach(track => track.stop()); stream.current = null;
    model.current?.close(); model.current = null;
    if (video.current) video.current.srcObject = null;
  }, []);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; stopCamera(); }; }, [stopCamera]);
  useEffect(() => {
    const hide = () => { if (document.visibilityState !== "hidden") return; stopCamera();
      setStatus(current => current === "complete" || current === "save-error" ? current : pending.current !== null ? "save-error" : "paused");
      if (pending.current !== null) setError("Camera paused before the recognized step was acknowledged. Retry saving the same step to reconcile its result.");
      callbacks.current.onPause?.(); };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, [stopCamera]);

  const acknowledge = useCallback(async () => {
    const next = pending.current;
    if (next === null || saving.current) return;
    const attempt = ++saveAttempt.current;
    const cameraGeneration = generation.current;
    const save = callbacks.current.onCycle;
    const timeoutError = new Error("save-timeout");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const interrupted = new Promise<boolean>((_, reject) => {
      interruptSave.current = () => reject(new Error("save-interrupted"));
      timer = setTimeout(() => reject(timeoutError), 8000);
    });
    saving.current = true; setIsSaving(true);
    try {
      const saved = await Promise.race([Promise.resolve().then(() => save(next)), interrupted]);
      if (!mounted.current || attempt !== saveAttempt.current || cameraGeneration !== generation.current) return;
      if (!saved) throw new Error("Step could not be saved");
      acknowledged.current = next; pending.current = null; setPendingCount(null); setCount(next);
      if (next === target) {
        stopCamera(); setStatus("complete");
        if (!completed.current) { completed.current = true; callbacks.current.onComplete?.(); }
      } else if (!stream.current) { setStatus("paused"); }
    } catch (cause) {
      if (!mounted.current || attempt !== saveAttempt.current || cameraGeneration !== generation.current) return;
      stopCamera(); setStatus("save-error");
      setError(cause === timeoutError ? "Saving your recognized step timed out. The camera is off. Retry saving the same step before continuing."
        : "Your recognized step has not been acknowledged. Retry saving the same step before continuing.");
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      if (attempt === saveAttempt.current) {
        interruptSave.current = null; saving.current = false;
        if (mounted.current) setIsSaving(false);
      }
    }
  }, [stopCamera,target]);

  const runFrame = useRef<(timestamp: number) => void>(() => undefined);
  useEffect(() => {
    runFrame.current = (timestamp: number) => {
      if (!stream.current || !model.current) return;
      if (saving.current || pending.current !== null) {
        frameId.current = requestAnimationFrame(t => runFrame.current(t)); return;
      }
      if (!video.current || video.current.readyState < 2 || timestamp - lastInference.current < 90) {
        frameId.current = requestAnimationFrame(t => runFrame.current(t)); return;
      }
      lastInference.current = timestamp;
      try {
        const poses = model.current.detectForVideo(video.current, timestamp).landmarks;
        const points = poses.length === 1 ? poses[0] : [];
        if (canvas.current && video.current.videoWidth > 0 && video.current.videoHeight > 0 &&
          (canvas.current.width !== video.current.videoWidth || canvas.current.height !== video.current.videoHeight)) {
          canvas.current.width = video.current.videoWidth;
          canvas.current.height = video.current.videoHeight;
        }
        const ctx = canvas.current?.getContext("2d");
        if (ctx && canvas.current) {
          ctx.clearRect(0,0,canvas.current.width,canvas.current.height);
          ctx.strokeStyle = "#b8f36b"; ctx.lineWidth = 4;
          for (const [a,b] of EDGES) { const p=points[a],q=points[b]; if (!p||!q||(p.visibility??0)<.65||(q.visibility??0)<.65) continue;
            ctx.beginPath();ctx.moveTo(p.x*canvas.current.width,p.y*canvas.current.height);ctx.lineTo(q.x*canvas.current.width,q.y*canvas.current.height);ctx.stroke(); }
        }
        if(upper){
          const next=updateUpper(upperMotion.current,points,timestamp,neck);upperMotion.current=next;
          setInstruction(upperInstruction(next,neck));
          if(next.count>acknowledged.current){pending.current=next.count;setPendingCount(next.count);void acknowledge();}
        }else{
        const next = route ? updateRoute(motion.current, points as PoseLandmark[], timestamp) : {...motion.current,...updateStepTouch(motion.current, points as PoseLandmark[], timestamp)}; motion.current = next;
        setInstruction(next.tracking === "lost" ? "Stand still with arms down. Keep your head, both hands and both feet visible in the frame."
          : next.phase === "calibrating" ? `Stand still with feet close${route && next.count>=6 ? " and arms down" : ""} — calibrating ${Math.min(next.calibrationFrames,15)} / 15`
          : route && next.count >= 6 ? next.armPhase === "lower" ? "Now lower both arms to your sides." : next.count === 6 ? "Open both arms sideways and hold for 0.6 seconds." : "Raise both arms overhead and hold for 0.6 seconds."
          : next.phase === "return" ? "Return to the centre with your feet close."
          : `Step ${next.expectedSide} in the camera picture, then return to centre.`);
        if (next.count > acknowledged.current) { pending.current = next.count; setPendingCount(next.count); void acknowledge(); }
        }
      } catch {
        stopCamera(); setStatus("error");setError("Pose tracking stopped. Try camera again; no unacknowledged step was counted."); return;
      }
      if (stream.current) frameId.current = requestAnimationFrame(t => runFrame.current(t));
    };
  }, [acknowledge, stopCamera, route,upper,neck]);

  async function startCamera() {
    if (pending.current !== null) return;
    stopCamera(); const run = generation.current;
    setStatus("loading");setError("");setInstruction(upper?"Keep your head still and shoulders relaxed — calibrating":"Stand still with feet close and arms down — calibrating");upperMotion.current=initialUpper(acknowledged.current);motion.current=initialRouteState(acknowledged.current);lastInference.current=-1;
    startupTimer.current = setTimeout(() => {
      if (generation.current !== run) return;
      stopCamera(); setStatus("error");
      setError("Camera setup timed out. The camera is off. Check permissions and connection, then try again.");
    }, 30_000);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera unavailable");
      const acquired = await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:960},height:{ideal:720}}});
      if (generation.current !== run) { acquired.getTracks().forEach(track=>track.stop());return; }
      stream.current=acquired;
      if (!video.current) throw new Error("Camera preview unavailable");
      video.current.srcObject=acquired;await video.current.play();
      if (generation.current !== run) return;
      let created: StepTouchDetector;
      if (callbacks.current.detectorFactory) {
        created = await callbacks.current.detectorFactory();
      } else {
        const {FilesetResolver,PoseLandmarker}=await import("@mediapipe/tasks-vision");
        const vision=await FilesetResolver.forVisionTasks(WASM_ROOT);
        if (generation.current !== run) return;
        created=await PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:MODEL_URL,delegate:"CPU"},runningMode:"VIDEO",numPoses:2});
      }
      if (generation.current !== run) {created.close();return;}
      if (startupTimer.current !== null) clearTimeout(startupTimer.current);
      startupTimer.current = null;
      model.current=created;setStatus("active");frameId.current=requestAnimationFrame(t=>runFrame.current(t));
    } catch(cause) {
      if (generation.current !== run) return;
      stopCamera();setStatus("error");
      setError(cause instanceof DOMException && cause.name === "NotAllowedError"
        ? "Camera permission was declined. Allow it in your browser settings and try again."
        : "Camera or pose model could not start. Check the camera and connection, then retry.");
    }
  }
  function pause() { stopCamera();setStatus(pending.current !== null ? "save-error" : "paused");if(pending.current !== null)setError("Camera paused before the recognized step was acknowledged. Retry saving the same step to reconcile its result.");callbacks.current.onPause?.(); }
  function cancel() { stopCamera();setStatus(pending.current !== null ? "save-error" : "paused");if(pending.current !== null)setError("The recognized step has an unknown save result. Retry saving the same step to reconcile its result.");callbacks.current.onCancel?.(); }

  return <section className="step-challenge" aria-label={upper?"Camera exercise challenge":"Camera side-step challenge"}>
    <div className="step-challenge__heading"><div><h2>{upper?getExercise(exerciseId)?.name:route ? "Lantern route" : "Side-step challenge"}</h2><p>{upper?neck?"Four gentle head directions, then return to centre.":"Six complete bilateral shoulder lifts and returns.":route ? "Walk six steps, open the gate, then light the lantern with your arms." : goal === "trail" ? "Reach the summit in eight recognized steps." : "Build and light the lantern in eight recognized steps."}</p></div><strong data-testid="step-count" aria-live="polite">{count} / {target}</strong></div>
    {upper?<section className="movement-scene" aria-label="Acknowledged exercise progress"><h3>{count===target?"Exercise complete":"Your exercise"}</h3><progress value={count} max={target} aria-label="Saved movements"/><p>{count} of {target} movements saved</p></section>:route ? <RouteScene count={count} goal={goal}/> : <MovementScene scene={goal} completedCycles={count} targetMovements={8} status={status === "complete" ? "complete" : status === "active" ? "active" : status === "idle" ? "ready" : "paused"}/>}
    <div className="step-route-cue" data-testid="movement-cue" aria-live="polite"><span>{upper?getExercise(exerciseId)?.name:route ? count<6 ? `Walk to the gate · step ${count+1} of 6` : count===6 ? "Open the gate · arms sideways" : count===7 ? "Light the lantern · arms overhead" : "Route complete · lantern lit" : "Alternate side steps and return to centre"}</span><strong>{status === "active" ? pendingCount !== null ? "Saving recognized movement…" : instruction : status === "complete" ? `All ${target} movements acknowledged` : status === "loading" ? upper?"Starting camera — keep your head still and shoulders relaxed":"Starting camera — stand with feet close and arms down" : upper?"Enable the camera, then keep your head still and shoulders relaxed":"Enable the camera, then stand still with feet close and arms down"}</strong></div>
    <div className="step-challenge__guides">{upper?<UpperExample neck={neck}/>:<MovementExample route={route} count={count}/>}<section className="step-camera" aria-labelledby="step-camera-title">
      <h3 id="step-camera-title">Your camera</h3><p>{upper?neck?"Head and both shoulders in the picture.":"Head, both shoulders and hips in the picture.":"Head to feet in the picture."} The video stays on your device; it is not recorded or uploaded.</p>
      <div className="step-camera__preview"><video ref={video} muted playsInline aria-label="Live camera preview"/><canvas ref={canvas} width={960} height={720} aria-hidden="true"/>{status !== "active" && <span>Camera off</span>}</div>
      <p role="status">{status === "active" ? "Camera active" : status === "loading" ? "Starting camera…" : status === "complete" ? "Camera off — round finished" : "Camera paused or off"}</p>
      {status === "active" && <p className="step-camera__instruction">{instruction}</p>}
      {error && <p role="alert" className="step-camera__error">{error}</p>}
      <div className="step-camera__actions">
        {status === "idle" && <button type="button" className="button button--primary" onClick={()=>void startCamera()}>Enable camera</button>}
        {status === "paused" && pendingCount === null && <button type="button" className="button button--primary" onClick={()=>void startCamera()}>Resume camera</button>}
        {status === "error" && <button type="button" className="button button--primary" onClick={()=>void startCamera()}>Try camera again</button>}
        {status === "save-error" && <button type="button" className="button button--primary" onClick={()=>void acknowledge()} disabled={isSaving}>Retry saving step</button>}
        {status === "active" && <button type="button" className="button button--quiet" onClick={pause}>Pause</button>}
        {status !== "complete" && <button type="button" className="button button--quiet" onClick={cancel}>Cancel</button>}
      </div>
    </section></div>
    {status === "complete" && <div className="step-challenge__complete" role="status"><h3>Round complete</h3><p>{upper?`${target} camera-recognized movements acknowledged.`:route ? "Six steps, gate opened and lantern lit. All eight movements acknowledged." : "Eight alternating step-and-return patterns recognized."} This does not assess exercise form or medical benefit.</p></div>}
    <p className="step-challenge__privacy">Pose software is downloaded from MediaPipe’s upstream hosts when you enable the camera. No microphone access. Move in a comfortable range with clear space beside you; stop if uncomfortable.</p>
  </section>;
}
