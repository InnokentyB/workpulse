import { CalendarIcon, CameraIcon } from "@/components/icons";
import type { WorkContext } from "@/lib/types";

type WorkContextCardProps = {
  context: WorkContext;
  source?: "demo" | "manual";
};

function Metric({
  label,
  value,
  unit,
  detail,
}: {
  label: string;
  value: string | number;
  unit?: string;
  detail?: string;
}) {
  return (
    <div className="context-metric">
      <dt>{label}</dt>
      <dd>
        <span className="context-metric__value">{value}</span>
        {unit ? <span className="context-metric__unit">{unit}</span> : null}
      </dd>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}

export function WorkContextCard({ context, source = "demo" }: WorkContextCardProps) {
  const calendarDetail =
    source === "manual"
      ? "No calendar connected"
      : context.minutesToNextMeeting === null
      ? "No upcoming meeting"
      : `${context.nextMeetingTitle ?? "Next meeting"} · in ${context.minutesToNextMeeting} min`;

  return (
    <section aria-labelledby="context-heading" className="context-panel">
      <div className="section-heading-row">
        <div>
          <h2 id="context-heading">Right now</h2>
          <p>Work context at {context.currentTime}</p>
        </div>
        <span className="live-status">
          <span aria-hidden="true" /> Context ready
        </span>
      </div>
      <div aria-label="Context data sources" className="context-sources">
        <div className="context-source">
          <span className="context-source__icon">
            <CalendarIcon />
          </span>
          <span className="context-source__copy">
            <span>{source === "manual" ? "Availability" : "Calendar context"}</span>
            <strong>{calendarDetail}</strong>
          </span>
          <span
            className="context-source__status"
            data-status={source === "demo" ? "demo" : undefined}
          >
            {source === "manual" ? "Manual mode" : "Demo data"}
          </span>
        </div>
        <div className="context-source">
          <span className="context-source__icon" data-muted="true">
            <CameraIcon />
          </span>
          <span className="context-source__copy">
            <span>Camera</span>
            <strong>Off until you start the activity</strong>
          </span>
          <span className="context-source__status">Exercise only</span>
        </div>
      </div>
      <dl className="context-grid">
        <Metric
          label="You’ve been sitting"
          unit="min"
          value={context.sedentaryMinutes}
        />
        <Metric
          detail={
            source === "manual"
              ? "Manual mode"
              : context.nextMeetingTitle ?? "No meeting scheduled"
          }
          label={source === "manual" ? "Availability" : "Next meeting"}
          unit={context.minutesToNextMeeting === null ? undefined : "min"}
          value={
            context.minutesToNextMeeting === null
              ? source === "manual"
                ? "Open"
                : "Clear"
              : `in ${context.minutesToNextMeeting}`
          }
        />
        <Metric
          label="Since last movement"
          unit="min"
          value={context.minutesSinceLastActivity}
        />
      </dl>
    </section>
  );
}
