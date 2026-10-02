"use client";

import { useCallback, useRef, useState } from "react";

import { ActivitySession } from "@/components/ActivitySession";
import MovementScene from "@/components/MovementScene";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { selectActivity } from "@/lib/activity-selector";
import "./movement-game.css";

type Scene = "trail" | "workshop";
type InputMode = "manual" | "camera";
type Status = "ready" | "active" | "paused" | "complete";
const TARGET = 6;
const shoulderActivity = selectActivity("shoulder-rolls");

export function MovementGame() {
  const [scene, setScene] = useState<Scene>("trail");
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [status, setStatus] = useState<Status>("ready");
  const [count, setCount] = useState(0);
  const [cameraFailed, setCameraFailed] = useState(false);
  const generation = useRef(0);
  const currentRun = generation.current;
  const countRef = useRef(0);
  const completedRef = useRef(false);

  const increment = useCallback((amount: number, run: number) => {
    if (run !== generation.current || completedRef.current || !Number.isInteger(amount) || amount <= 0) return;
    const accepted = Math.min(amount, TARGET - countRef.current);
    if (accepted <= 0) return;
    countRef.current += accepted;
    setCount(countRef.current);
    if (countRef.current === TARGET) {
      completedRef.current = true;
      setStatus("complete");
    }
  }, []);

  function start() {
    generation.current += 1;
    completedRef.current = false;
    countRef.current = 0;
    setCount(0);
    setCameraFailed(false);
    setStatus("active");
  }

  function pause() {
    generation.current += 1; // Discard late camera callbacks after unmount.
    setStatus("paused");
  }

  function resume() {
    generation.current += 1;
    setStatus("active");
  }

  function reset() {
    generation.current += 1;
    completedRef.current = false;
    countRef.current = 0;
    setCount(0);
    setCameraFailed(false);
    setStatus("ready");
  }

  const evidence = inputMode === "camera"
    ? "Six lift-and-return cycles recognized on this device. This does not assess exercise form."
    : "Six movements self-reported. This run was not camera verified.";

  return (
    <main className="app-shell movement-game">
      <SiteHeader current="play" />
      <header className="movement-game__intro">
        <p className="movement-game__kicker">WorkPulse / Movement game</p>
        <h1>Move a little. See the world change.</h1>
        <p>Six gentle shoulder lift-and-return cycles bring a scene to life. Choose manual self-report or optional camera recognition.</p>
      </header>

      <div className="movement-game__layout">
        <section className="movement-game__controls" aria-label="Movement game controls">
          <fieldset disabled={status !== "ready"}>
            <legend>Choose your world</legend>
            <label><input type="radio" name="scene" value="trail" checked={scene === "trail"} onChange={() => setScene("trail")} /> Forest trail</label>
            <label><input type="radio" name="scene" value="workshop" checked={scene === "workshop"} onChange={() => setScene("workshop")} /> Workshop</label>
          </fieldset>
          <fieldset disabled={status !== "ready"}>
            <legend>Choose how to count</legend>
            <label><input type="radio" name="input-mode" value="manual" checked={inputMode === "manual"} onChange={() => setInputMode("manual")} /> Manual self-report</label>
            <label><input type="radio" name="input-mode" value="camera" checked={inputMode === "camera"} onChange={() => setInputMode("camera")} /> Camera recognition</label>
          </fieldset>
          <p className="movement-game__progress" role="status" aria-live="polite"><strong>{count} / {TARGET}</strong> movements</p>
          {status === "ready" && <button className="button button--primary" type="button" onClick={start}>Start movement game</button>}
          {status === "active" && (
            <div className="movement-game__actions">
              {inputMode === "manual" && <button className="button button--primary" type="button" onClick={() => increment(1, currentRun)}>I completed a movement <small>(self-report)</small></button>}
              <button className="button button--quiet" type="button" onClick={pause}>Pause game</button>
            </div>
          )}
          {status === "paused" && (
            <div className="movement-game__actions">
              <p>Paused. Your {count} movements are saved for this run; the camera is off.</p>
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
          <MovementScene scene={scene} completedCycles={count} status={status} />
          {status === "active" && inputMode === "camera" && (
            <div className="movement-game__camera">
              <ActivitySession
                activity={shoulderActivity}
                gameMode
                progressCount={count}
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
