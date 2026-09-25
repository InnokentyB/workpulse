"use client";

import { useEffect, useMemo, useState } from "react";

import { CheckIcon } from "@/components/icons";
import type {
  Activity,
  ActivityCompletion,
  ActivityGuidanceStep,
} from "@/lib/types";

type TimedActivitySessionProps = {
  activity: Activity;
  onComplete: (completion: ActivityCompletion) => void;
};

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TimedActivitySession({
  activity,
  onComplete,
}: TimedActivitySessionProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    activity.durationSeconds,
  );
  const [status, setStatus] = useState<"ready" | "running" | "paused">(
    "ready",
  );
  const elapsedSeconds = activity.durationSeconds - remainingSeconds;
  const guidedSteps = useMemo<ActivityGuidanceStep[]>(
    () =>
      activity.guidance?.steps ??
      activity.steps.map((label) => ({
        label,
        durationSeconds: activity.durationSeconds / activity.steps.length,
      })),
    [activity.durationSeconds, activity.guidance?.steps, activity.steps],
  );
  const stepEndTimes = useMemo(
    () =>
      guidedSteps.reduce<number[]>((ends, step) => {
        ends.push((ends.at(-1) ?? 0) + step.durationSeconds);
        return ends;
      }, []),
    [guidedSteps],
  );
  const currentStepIndex = Math.min(
    stepEndTimes.findIndex((end) => elapsedSeconds < end) === -1
      ? guidedSteps.length - 1
      : stepEndTimes.findIndex((end) => elapsedSeconds < end),
    guidedSteps.length - 1,
  );
  const completedSteps = stepEndTimes.filter((end) => elapsedSeconds >= end).length;
  const currentStep = useMemo(
    () => guidedSteps[currentStepIndex],
    [guidedSteps, currentStepIndex],
  );

  useEffect(() => {
    if (status !== "running") return;

    if (remainingSeconds === 0) {
      onComplete({
        completedSteps: guidedSteps.length,
        mode: "timer",
        verified: false,
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1_000);

    return () => window.clearTimeout(timer);
  }, [guidedSteps.length, onComplete, remainingSeconds, status]);

  return (
    <section className="activity-session timed-session">
      <div className="activity-session__heading">
        <div>
          <p>Guided activity</p>
          <h2>{activity.name}</h2>
        </div>
        <time className="activity-timer" aria-label={`${remainingSeconds} seconds remaining`}>
          {formatDuration(remainingSeconds)}
        </time>
      </div>

      {status === "ready" ? (
        <div className="timed-session__preview">
          <p>{activity.instructions}</p>
          {activity.guidance ? (
            <span className="activity-position">
              {activity.guidance.position === "either"
                ? "Seated or standing"
                : `${activity.guidance.position[0].toUpperCase()}${activity.guidance.position.slice(1)}`}
            </span>
          ) : null}
          <ol data-step-count={guidedSteps.length}>
            {guidedSteps.map((step, index) => (
              <li key={`${step.label}-${index}`}>
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
                <small>{formatDuration(step.durationSeconds)}</small>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div aria-live="polite" className="timed-session__active">
          <p>Current movement</p>
          {currentStep.visual ? (
            // eslint-disable-next-line @next/next/no-img-element -- runtime workout catalogs provide validated image URLs.
            <img
              alt={currentStep.visual.alt}
              className="timed-session__visual"
              src={currentStep.visual.src}
            />
          ) : null}
          <strong>{currentStep.label}</strong>
          <span>
            Step {Math.min(currentStepIndex + 1, guidedSteps.length)} of {guidedSteps.length}
          </span>
        </div>
      )}

      <progress
        aria-label={`${completedSteps} of ${guidedSteps.length} steps complete`}
        max={activity.durationSeconds}
        value={elapsedSeconds}
      />

      <p className="activity-safety-note">
        {activity.guidance?.safetyWarning ??
          "Move slowly and stay within a comfortable range. Stop if you feel pain or dizziness."}
      </p>

      <div className="activity-session__actions">
        {status === "ready" ? (
          <button
            className="button button--complete"
            onClick={() => setStatus("running")}
            type="button"
          >
            Start exercise
          </button>
        ) : (
          <button
            className="button button--quiet"
            onClick={() => setStatus(status === "running" ? "paused" : "running")}
            type="button"
          >
            {status === "running" ? "Pause" : "Resume"}
          </button>
        )}
        <button
          className="button button--quiet"
          onClick={() =>
            onComplete({
              completedSteps,
              mode: "manual",
              verified: false,
            })
          }
          type="button"
        >
          <CheckIcon /> Finish now
        </button>
      </div>
    </section>
  );
}
