import { useState } from "react";

import {
  validateWorkdaySettings,
  type ManualWorkSession,
  type WorkdaySettings,
} from "@/lib/workday-session";

type WorkdaySessionPanelProps = {
  elapsedMinutes: number;
  minutesSinceLastActivity: number;
  onEnd: () => void;
  onSaveSettings: (settings: WorkdaySettings) => boolean;
  persistenceWarning?: string | null;
  session: ManualWorkSession | null;
  settings: WorkdaySettings;
  withinWorkday: boolean;
};

function formatElapsed(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

export function WorkdaySessionPanel({
  elapsedMinutes,
  minutesSinceLastActivity,
  onEnd,
  onSaveSettings,
  persistenceWarning,
  session,
  settings,
  withinWorkday,
}: WorkdaySessionPanelProps) {
  const [draft, setDraft] = useState(settings);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function saveSettings() {
    const validationError = validateWorkdaySettings(draft);
    if (validationError) {
      setError(validationError);
      setSaved(false);
      return;
    }
    if (!onSaveSettings(draft)) {
      setError("We couldn’t save these hours. You can keep using this tab.");
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(true);
  }

  return (
    <section className="workday-panel" aria-labelledby="workday-panel-heading">
      <div className="workday-panel__status">
        <div>
          <h2 id="workday-panel-heading">
            {session ? "Work session in progress" : "Start your workday"}
          </h2>
          <p>
            {session
              ? `Started at ${new Date(session.startedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}. No calendar connection is needed.`
              : "Use real elapsed time without connecting a calendar."}
          </p>
        </div>
        {session ? (
          <button className="button workday-panel__end" onClick={onEnd} type="button">
            End session
          </button>
        ) : null}
      </div>

      {session ? (
        <dl className="workday-panel__metrics" aria-label="Live work session timing">
          <div>
            <dt>Session time</dt>
            <dd>{formatElapsed(elapsedMinutes)}</dd>
          </div>
          <div>
            <dt>Since last activity</dt>
            <dd>{formatElapsed(minutesSinceLastActivity)}</dd>
          </div>
          <div>
            <dt>Calendar</dt>
            <dd>Not connected</dd>
          </div>
        </dl>
      ) : (
        <div className="workday-panel__empty">
          <strong>No active session</strong>
          <span>
            Start when you begin working. WorkPulse will use time since the start
            and your completed activities.
          </span>
        </div>
      )}

      <details className="workday-hours">
        <summary>Working hours · {settings.startTime}–{settings.endTime}</summary>
        <div className="workday-hours__form">
          <label>
            <span>Start</span>
            <input
              aria-label="Workday start"
              onChange={(event) => {
                setDraft({ ...draft, startTime: event.target.value });
                setSaved(false);
              }}
              type="time"
              value={draft.startTime}
            />
          </label>
          <label>
            <span>End</span>
            <input
              aria-label="Workday end"
              onChange={(event) => {
                setDraft({ ...draft, endTime: event.target.value });
                setSaved(false);
              }}
              type="time"
              value={draft.endTime}
            />
          </label>
          <button className="button workday-hours__save" onClick={saveSettings} type="button">
            Save hours
          </button>
        </div>
        {error ? <p className="workday-panel__error" role="alert">{error}</p> : null}
        {saved ? <p className="workday-panel__saved" role="status">Hours saved on this device.</p> : null}
      </details>

      {!withinWorkday ? (
        <p className="workday-panel__notice">
          It’s outside your saved working hours. You can still run a manual session,
          but WorkPulse won’t treat the schedule as calendar availability.
        </p>
      ) : null}
      {persistenceWarning ? (
        <p className="workday-panel__notice" role="status">{persistenceWarning}</p>
      ) : null}
    </section>
  );
}
