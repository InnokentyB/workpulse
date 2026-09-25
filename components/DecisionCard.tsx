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

export function DecisionCard({
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
          <p>Smallest useful move</p>
          <h3>{result.activity?.name}</h3>
          <span>About {result.activity?.durationSeconds} seconds</span>
        </div>
      ) : null}
      <div className="decision-reason">
        <span>Why this decision</span>
        <p>{result.reason}</p>
      </div>
      {canMove ? (
        <div className="decision-actions">
          <button className="button button--primary" onClick={onStart} type="button">
            Start activity <ArrowIcon />
          </button>
        </div>
      ) : null}
    </section>
  );
}
