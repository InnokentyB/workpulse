import { ArrowIcon, ShoulderRollsIcon } from "@/components/icons";
import type { Activity, DecisionResult } from "@/lib/types";

type DecisionCardProps = {
  activities?: readonly Activity[];
  onActivitySelect?: (activityId: string) => void;
  result: DecisionResult;
  onStart?: () => void;
};

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="decision-signal">
      <span>{label}</span>
      <strong data-level={value}>{value}</strong>
    </div>
  );
}

export function DecisionCard({
  activities,
  onActivitySelect,
  result,
  onStart,
}: DecisionCardProps) {
  const canMove = result.decision === "MOVE_NOW" && result.activity;

  return (
    <section
      aria-live="polite"
      className="decision-card"
      data-decision={result.decision}
    >
      <div className="decision-card__topline">
        <span className="decision-state-label">
          {result.decision === "MOVE_NOW" ? "Window open" : "Hold this moment"}
        </span>
      </div>
      <h2>{result.decision === "MOVE_NOW" ? "Move now" : "Not now"}</h2>
      <div className="decision-signals">
        <Signal label="Movement need" value={result.movementNeed} />
        <Signal label="Interruption cost" value={result.interruptionCost} />
      </div>
      {canMove ? (
        <div className="activity-offer">
          <p>Choose a short reset</p>
          {activities && activities.length > 1 ? (
            <fieldset className="activity-picker">
              <legend>Available activities</legend>
              {activities.map((activity) => (
                <label
                  data-selected={result.activity?.id === activity.id}
                  key={activity.id}
                >
                  <input
                    checked={result.activity?.id === activity.id}
                    name="activity"
                    onChange={() => onActivitySelect?.(activity.id)}
                    type="radio"
                    value={activity.id}
                  />
                  <span className="activity-picker__copy">
                    <span className="activity-picker__name">
                      {activity.id === "shoulder-rolls" ? (
                        <ShoulderRollsIcon />
                      ) : null}
                      <strong>{activity.name}</strong>
                    </span>
                    <small>
                      About {activity.durationSeconds} sec · {activity.guide === "camera-neck" ? "Camera optional" : "Screen guided"}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <>
              <h3>{result.activity?.name}</h3>
              <span>About {result.activity?.durationSeconds} seconds</span>
            </>
          )}
        </div>
      ) : null}
      <div className="decision-reason">
        <span>Why this decision</span>
        <p>{result.reason}</p>
      </div>
      {canMove ? (
        <div className="decision-actions">
          <button
            aria-label={`Start activity: ${result.activity?.name}`}
            className="button button--primary"
            onClick={onStart}
            type="button"
          >
            Start activity <ArrowIcon />
          </button>
        </div>
      ) : null}
    </section>
  );
}
