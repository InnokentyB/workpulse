"use client";

import { useCallback, useRef, useState } from "react";

import { ActivitySession } from "@/components/ActivitySession";
import { DanceSession } from "@/components/DanceSession";
import type { DanceVariant } from "@/lib/dance-routine";
import MovementScene from "@/components/MovementScene";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ACTIVITIES, selectActivity } from "@/lib/activity-selector";
import type { NeckMotionState } from "@/lib/neck-motion-tracker";
import "./movement-game.css";

type Scene = "trail" | "workshop";
type InputMode = "manual" | "camera";
type Status = "ready" | "active" | "paused" | "complete";
export function MovementGame({ initialActivityId = "shoulder-rolls" }: { initialActivityId?: string }) {
  const [activityId, setActivityId] = useState(() => selectActivity(initialActivityId).id);
  const activity = selectActivity(activityId);
  const isDance = activity.guide === "guided-dance";
  const [danceVariant, setDanceVariant] = useState<DanceVariant>("seated");
  const target = activity.movementCount!;
  const neckCheckpointRef = useRef<NeckMotionState | undefined>(undefined);
  const [neckCheckpoint, setNeckCheckpoint] = useState<NeckMotionState | undefined>(undefined);
  const [scene, setScene] = useState<Scene>("trail");
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [status, setStatus] = useState<Status>("ready");
  const [count, setCount] = useState(0);
  const [cameraFailed, setCameraFailed] = useState(false);
  const generation = useRef(0);
  const [currentRun, setCurrentRun] = useState(0);
  const countRef = useRef(0);
  const completedRef = useRef(false);

  const increment = useCallback((amount: number, run: number) => {
    if (run !== generation.current || completedRef.current || !Number.isInteger(amount) || amount <= 0) return;
    const accepted = Math.min(amount, target - countRef.current);
    if (accepted <= 0) return;
    countRef.current += accepted;
    setCount(countRef.current);
    if (countRef.current === target) {
      completedRef.current = true;
      setStatus("complete");
    }
  }, [target]);

  function start() {
    generation.current += 1;
    setCurrentRun(generation.current);
    completedRef.current = false;
    countRef.current = 0;
    neckCheckpointRef.current = undefined;
    setNeckCheckpoint(undefined);
    setCount(0);
    setCameraFailed(false);
    setStatus("active");
  }

  function pause() {
    setNeckCheckpoint(neckCheckpointRef.current);
    generation.current += 1;
    setCurrentRun(generation.current); // Discard late camera callbacks after unmount.
    setStatus("paused");
  }

  function resume() {
    generation.current += 1;
    setCurrentRun(generation.current);
    setStatus("active");
  }

  function reset() {
    generation.current += 1;
    setCurrentRun(generation.current);
    completedRef.current = false;
    countRef.current = 0;
    neckCheckpointRef.current = undefined;
    setNeckCheckpoint(undefined);
    setCount(0);
    setCameraFailed(false);
    setStatus("ready");
  }

  const number = target === 4 ? "Four" : "Six";
  const evidence = inputMode === "camera"
    ? activity.guide === "camera-neck"
      ? "Four guided neck movements recognized on this device, followed by a return to neutral. This does not assess exercise form."
      : "Six lift-and-return cycles recognized on this device. This does not assess exercise form."
    : isDance ? "Six dance phrases self-reported. This run was not camera verified." : `${number} movements self-reported. This run was not camera verified.`;

  return (
    <main className="app-shell movement-game">
      <SiteHeader current="play" />
      <header className="movement-game__intro">
        <p className="movement-game__kicker">WorkPulse / Movement game</p>
        <h1>Move a little. See the world change.</h1>
        <p>Bring a scene to life with a neck reset, shoulder rolls or a short desk dance. Choose a comfortable way to move.</p>
      </header>

      <div className="movement-game__layout">
        <section className="movement-game__controls" aria-label="Movement game controls">
          <fieldset disabled={status !== "ready"}>
            <legend>Choose your exercise</legend>
            {ACTIVITIES.map((item) => (
              <label key={item.id}><input type="radio" name="game-activity" value={item.id} checked={activityId === item.id} onChange={() => { setActivityId(item.id); if (!item.guide.startsWith("camera-")) setInputMode("manual"); }} /> {item.name}</label>
            ))}
          </fieldset>
          <fieldset disabled={status !== "ready"}>
            <legend>Choose your world</legend>
            <label><input type="radio" name="scene" value="trail" checked={scene === "trail"} onChange={() => setScene("trail")} /> Forest trail</label>
            <label><input type="radio" name="scene" value="workshop" checked={scene === "workshop"} onChange={() => setScene("workshop")} /> Workshop</label>
          </fieldset>
          {isDance && <fieldset disabled={status !== "ready"}>
            <legend>Your dance version</legend>
            <label><input type="radio" name="dance-variant" checked={danceVariant === "seated"} onChange={() => setDanceVariant("seated")} /> Seated dance</label>
            <label><input type="radio" name="dance-variant" checked={danceVariant === "standing"} onChange={() => setDanceVariant("standing")} /> Standing dance</label>
          </fieldset>}
          <fieldset disabled={status !== "ready"}>
            <legend>Choose how to count</legend>
            <label><input type="radio" name="input-mode" value="manual" checked={inputMode === "manual"} onChange={() => setInputMode("manual")} /> Manual self-report</label>
            <label><input type="radio" name="input-mode" value="camera" disabled={!activity.guide.startsWith("camera-")} checked={inputMode === "camera"} onChange={() => setInputMode("camera")} /> Camera recognition</label>
          </fieldset>
          {isDance && <p className="movement-game__note">Dance uses on-screen beats and your own confirmation. Camera recognition is available for neck and shoulder exercises.</p>}
          <div className="movement-game__exercise" aria-label="Exercise instructions">
            <h2>{activity.name} <span>About {activity.durationSeconds} sec</span></h2>
            <p>{activity.instructions}</p>
            {inputMode === "camera" && <p>{activity.guide === "camera-neck" ? "Follow the on-screen sequence: turn to either side, the opposite side, lower your chin, lift your gaze, then return to neutral." : "The camera counts shoulder lift-and-return cycles; it does not distinguish circle direction."}</p>}
          </div>
          <p className="movement-game__progress" role="status" aria-live="polite"><strong>{count} / {target}</strong> {isDance ? "dance phrases" : "movements"}</p>
          {status === "ready" && <button className="button button--primary" type="button" onClick={start}>Start movement game</button>}
          {status === "active" && (
            <div className="movement-game__actions">
              {inputMode === "manual" && !isDance && <button className="button button--primary" type="button" onClick={() => increment(1, currentRun)}>I completed a movement <small>(self-report)</small></button>}
              <button className="button button--quiet" type="button" onClick={pause}>Pause game</button>
            </div>
          )}
          {status === "paused" && (
            <div className="movement-game__actions">
              <p>Paused. Your {count} {isDance ? "phrases" : "movements"} are saved for this run; {isDance ? "sound is off and the unfinished phrase will restart." : "the camera is off."}</p>
              <button className="button button--primary" type="button" onClick={resume}>Resume game</button>
            </div>
          )}
          {status === "complete" && (
            <div className="movement-game__outcome" role="status">
              <h2>Scene complete</h2>
              <p>{evidence}</p>
              <button className="button button--primary" type="button" onClick={reset}>New run</button>
            </div>
          )}
          {status !== "ready" && status !== "complete" && <button className="button movement-game__reset" type="button" onClick={reset}>Reset game</button>}
          {status === "active" && inputMode === "camera" && cameraFailed && <button className="button movement-game__reset" type="button" onClick={() => { setInputMode("manual"); start(); }}>Start new manual run from zero</button>}
          <p className="movement-game__note">Move gently within a comfortable range. Stop if you feel pain or dizziness. Manual entries are not verified. Video stays on this device and is not recorded.</p>
        </section>
        <section className="movement-game__stage" aria-label="Game scene and camera guide">
          <MovementScene scene={scene} completedCycles={count} targetMovements={target} status={status} />
          {status === "active" && isDance && <DanceSession key={currentRun} variant={danceVariant} progressCount={count} gameMode onProgress={(amount) => increment(amount, currentRun)} onComplete={() => undefined} />}
          {status === "active" && inputMode === "camera" && (
            <div className="movement-game__camera">
              <ActivitySession
                key={currentRun}
                activity={activity}
                gameMode
                progressCount={count}
                neckCheckpoint={neckCheckpoint}
                onNeckCheckpoint={(checkpoint) => {
                  if (currentRun === generation.current && !completedRef.current) neckCheckpointRef.current = checkpoint;
                }}
                onProgress={(amount) => increment(amount, currentRun)}
                onCameraFailure={() => {
                  if (currentRun === generation.current && !completedRef.current) setCameraFailed(true);
                }}
                onComplete={() => undefined}
              />
            </div>
          )}
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
