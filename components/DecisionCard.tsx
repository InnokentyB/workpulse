import { ArrowIcon } from "@/components/icons";
import type { DecisionResult } from "@/lib/types";

type DecisionCardProps = {
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

function formatActivityDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds} seconds`;
  if (totalSeconds % 60 === 0) {
    const minutes = totalSeconds / 60;
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }

  return `${Math.floor(totalSeconds / 60)} min ${totalSeconds % 60} sec`;
}

export function DecisionCard({
  result,
  onStart,
}: DecisionCardProps) {
  const activity = result.decision === "MOVE_NOW" ? result.activity : undefined;

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
      {activity ? (
        <div className="activity-offer">
          <p>Best fit for this window</p>
          <h3>{activity.name}</h3>
          <span>About {formatActivityDuration(activity.durationSeconds)}</span>
          {result.activityReason ? (
            <p className="activity-offer__reason">{result.activityReason}</p>
          ) : null}
        </div>
      ) : null}
      <div className="decision-reason">
        <span>Why this decision</span>
        <p>{result.reason}</p>
      </div>
      {activity ? (
        <div className="decision-actions">
          <button className="button button--primary" onClick={onStart} type="button">
            Start activity <ArrowIcon />
          </button>
        </div>
      ) : null}
    </section>
  );
}
