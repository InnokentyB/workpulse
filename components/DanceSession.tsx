"use client";

import { useEffect, useRef, useState } from "react";
import type { ActivityCompletion } from "./ActivitySession";
import { DANCE_BEATS, DANCE_BEAT_MS, DANCE_PHRASES, type DanceVariant } from "@/lib/dance-routine";
import "./dance-session.css";

type Props = {
  variant?: DanceVariant;
  progressCount?: number;
  gameMode?: boolean;
  onProgress?: (amount: number) => void;
  onComplete: (completion: ActivityCompletion) => void;
};

function playBeat(context: AudioContext, beat: number, phrase: number) {
  const time = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(melody[(beat + phrase * 2) % melody.length], time);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(beat % 4 === 0 ? .09 : .05, time + .015);
  gain.gain.exponentialRampToValueAtTime(.001, time + .24);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  oscillator.start(time);
  oscillator.stop(time + .25);
}

function DancePose({ phrase, beat, seated }: { phrase: number; beat: number; seated: boolean }) {
  const direction = beat % 2 === 0 ? -1 : 1;
  const sway = phrase === 0 || phrase === 3 ? direction * 10 : 0;
  const reach = phrase === 2 || phrase === 5;
  return (
    <svg className="dance-pose" viewBox="0 0 240 180" aria-hidden="true" focusable="false">
      <path d="M30 160H210" stroke="currentColor" opacity=".2" />
      {seated && <path d="M82 105H158M90 105V158M150 105V158" fill="none" stroke="currentColor" strokeWidth="4" opacity=".3" />}
      <g transform={`translate(${sway} 0)`} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="120" cy="36" r="13" />
        <path d="M120 52V100" />
        <path d={reach ? `M120 64L${direction < 0 ? 65 : 85} 82M120 64L${direction > 0 ? 175 : 155} 82` : `M120 ${phrase === 1 ? 60 - (beat % 2) * 5 : 64}L88 91M120 64L152 91`} />
        <path d={seated ? `M120 100L95 120L${phrase === 4 ? 75 : 95} 153M120 100L145 120L${phrase === 4 ? 165 : 145} 153` : `M120 100L${95 + direction * 7} 153M120 100L${145 + direction * 7} 153`} />
      </g>
    </svg>
  );
}

export function DanceSession({ variant: suppliedVariant, progressCount, gameMode = false, onProgress, onComplete }: Props) {
  const [ownVariant, setOwnVariant] = useState<DanceVariant>("seated");
  const variant = suppliedVariant ?? ownVariant;
  const [ownCount, setOwnCount] = useState(0);
  const count = progressCount ?? ownCount;
  const phrase = DANCE_PHRASES[Math.min(count, DANCE_PHRASES.length - 1)];
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [sound, setSound] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const confirmed = useRef(false);
  const audio = useRef<AudioContext | null>(null);

  function stopSound() {
    const context = audio.current;
    audio.current = null;
    if (context) void context.close().catch(() => undefined);
  }

  useEffect(() => () => {
    const context = audio.current;
    audio.current = null;
    if (context) void context.close().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let ticks = 0;
    const timer = window.setInterval(() => {
      ticks += 1;
      setBeat(ticks);
      if (audio.current) {
        try { playBeat(audio.current, ticks - 1, count); }
        catch { stopSound(); setSound(false); setSoundError(true); }
      }
      if (ticks === DANCE_BEATS) {
        window.clearInterval(timer);
        setPlaying(false);
        setReady(true);
      }
    }, DANCE_BEAT_MS);
    function hide() {
      if (document.visibilityState !== "hidden") return;
      window.clearInterval(timer);
      setPlaying(false);
      setBeat(0);
      setReady(false);
      stopSound();
      setSound(false);
    }
    document.addEventListener("visibilitychange", hide);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", hide); };
  }, [playing, count]);

  async function toggleSound() {
    if (audio.current) { stopSound(); setSound(false); return; }
    let requestedContext: AudioContext | undefined;
    try {
      const context = new AudioContext();
      requestedContext = context;
      audio.current = context;
      await context.resume();
      if (audio.current !== context) return;
      setSoundError(false);
      setSound(true);
    } catch {
      if (requestedContext && audio.current !== requestedContext) return;
      stopSound();
      setSoundError(true);
      setSound(false);
    }
  }

  function startPhrase() {
    confirmed.current = false;
    setStarted(true);
    setBeat(0);
    setReady(false);
    setPlaying(true);
  }

  function pausePhrase() {
    setPlaying(false);
    setBeat(0);
    setReady(false);
    stopSound();
    setSound(false);
  }

  function confirm() {
    if (!ready || confirmed.current) return;
    confirmed.current = true;
    setReady(false);
    setBeat(0);
    if (gameMode) onProgress?.(1);
    else {
      setOwnCount(count + 1);
      if (count + 1 === DANCE_PHRASES.length) {
        stopSound();
        onComplete({ mode: "guided", movements: DANCE_PHRASES.length, verified: false });
      }
    }
  }

  return (
    <section className="dance-session" aria-label="Dance guide">
      <div className="dance-session__topline"><span>Desk dance · {variant === "seated" ? "Seated" : "Standing"}</span><span>80 BPM · 8 beats</span></div>
      {suppliedVariant === undefined && <fieldset disabled={started}>
        <legend>Your dance version</legend>
        <label><input type="radio" name="dance-version" checked={variant === "seated"} onChange={() => setOwnVariant("seated")} /> Seated dance</label>
        <label><input type="radio" name="dance-version" checked={variant === "standing"} onChange={() => setOwnVariant("standing")} /> Standing dance</label>
      </fieldset>}
      <div className="dance-session__phrase" role="status" aria-live="polite">
        <p>Phrase {Math.min(count + 1, 6)} of 6</p>
        <h2>{phrase.name}</h2>
        <p>{phrase[variant]}</p>
      </div>
      <DancePose phrase={count} beat={beat} seated={variant === "seated"} />
      <div className="dance-beats" aria-label={`Beat ${beat} of ${DANCE_BEATS}`}>
        {Array.from({ length: DANCE_BEATS }, (_, i) => <span key={i} data-active={beat === i + 1} data-done={i < beat}>{i + 1}</span>)}
      </div>
      <p className="dance-session__hint">{playing ? "Follow the rhythm at your own pace." : ready ? "Did you follow this phrase? Confirm it yourself, or repeat it. No timing score." : "Start when comfortable. Each phrase takes six seconds; pauses are yours."}</p>
      <div className="dance-session__actions">
        {playing ? <button className="button button--quiet" onClick={pausePhrase}>Pause phrase</button> : ready ? <>
          <button className="button button--primary" onClick={confirm}>I followed this phrase</button>
          <button className="button button--quiet" onClick={startPhrase}>Repeat phrase</button>
        </> : <button className="button button--primary" onClick={startPhrase} disabled={count >= 6}>Start phrase</button>}
        <button className="button button--quiet" aria-pressed={sound} onClick={() => void toggleSound()}>{sound ? "Sound off" : "Sound on"}</button>
      </div>
      {soundError && <p role="status">Sound is unavailable. You can follow the visual beats in silence.</p>}
      <p className="dance-session__note">Six phrases, about 36 seconds of movement. Choose a comfortable range and a stable chair for seated movement. Stop if uncomfortable. No camera is used; completion is self-reported.</p>
    </section>
  );
}
