"use client";

import { useEffect, useMemo, useState } from "react";

import { CheckIcon } from "@/components/icons";
import type { Activity, ActivityCompletion } from "@/lib/types";

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
  const stepDuration = activity.durationSeconds / activity.steps.length;
  const currentStepIndex = Math.min(
    Math.floor(elapsedSeconds / stepDuration),
    activity.steps.length - 1,
  );
  const completedSteps = Math.min(
    Math.floor(elapsedSeconds / stepDuration),
    activity.steps.length,
  );
  const currentStep = useMemo(
    () => activity.steps[currentStepIndex],
    [activity.steps, currentStepIndex],
  );

  useEffect(() => {
    if (status !== "running") return;

    if (remainingSeconds === 0) {
      onComplete({
        completedSteps: activity.steps.length,
        mode: "timer",
        verified: false,
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1_000);

    return () => window.clearTimeout(timer);
  }, [activity.steps.length, onComplete, remainingSeconds, status]);

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
          <ol data-step-count={activity.steps.length}>
            {activity.steps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div aria-live="polite" className="timed-session__active">
          <p>Current movement</p>
          <strong>{currentStep}</strong>
          <span>
            Step {Math.min(currentStepIndex + 1, activity.steps.length)} of {activity.steps.length}
          </span>
        </div>
      )}

      <progress
        aria-label={`${completedSteps} of ${activity.steps.length} steps complete`}
        max={activity.durationSeconds}
        value={elapsedSeconds}
      />

      <p className="activity-safety-note">
        Move slowly and stay within a comfortable range. Stop if you feel pain or dizziness.
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
