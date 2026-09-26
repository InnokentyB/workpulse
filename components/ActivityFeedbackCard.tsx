"use client";

import { useState } from "react";

import type {
  ActivityFeedbackInput,
  ActivityLoadFeedback,
  ActivityRepeatFeedback,
} from "@/lib/activity-feedback";

type ActivityFeedbackCardProps = {
  activityId: string;
  activityName: string;
  onExclude: (activityId: string) => void;
  onSubmit: (feedback: ActivityFeedbackInput) => void;
};

export function ActivityFeedbackCard({
  activityId,
  activityName,
  onExclude,
  onSubmit,
}: ActivityFeedbackCardProps) {
  const [load, setLoad] = useState<ActivityLoadFeedback>("skipped");
  const [repeat, setRepeat] = useState<ActivityRepeatFeedback>("not-sure");
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <section className="activity-feedback" aria-live="polite">
        <strong>Thanks — this stays on this device.</strong>
      </section>
    );
  }

  return (
    <section className="activity-feedback" aria-labelledby="feedback-heading">
      <div>
        <p>Optional</p>
        <h2 id="feedback-heading">How did {activityName.toLowerCase()} feel?</h2>
      </div>

      <fieldset>
        <legend>How was the effort?</legend>
        {[
          ["too-light", "Too light"],
          ["just-right", "Just right"],
          ["too-hard", "Too hard"],
          ["skipped", "Skip"],
        ].map(([value, label]) => (
          <label key={value}>
            <input
              checked={load === value}
              name="activity-load"
              onChange={() => setLoad(value as ActivityLoadFeedback)}
              type="radio"
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Would you do this again?</legend>
        {[
          ["yes", "Yes"],
          ["no", "No"],
          ["not-sure", "Not sure"],
        ].map(([value, label]) => (
          <label key={value}>
            <input
              checked={repeat === value}
              name="activity-repeat"
              onChange={() => setRepeat(value as ActivityRepeatFeedback)}
              type="radio"
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      <div className="activity-feedback__actions">
        <button
          className="button button--primary"
          onClick={() => {
            onSubmit({ activityId, load, repeat });
            setSaved(true);
          }}
          type="button"
        >
          Save feedback
        </button>
        <button
          className="button button--quiet"
          onClick={() => onExclude(activityId)}
          type="button"
        >
          Do not suggest {activityName} again
        </button>
      </div>
    </section>
  );
}
