import type { ActivityHistoryEntry } from "@/lib/activity-history";

function dateParts(timestamp: string) {
  const date = new Date(timestamp);
  return {
    day: new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
    }).format(date),
    time: new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

function isToday(timestamp: string) {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function ActivityHistory({ entries }: { entries: ActivityHistoryEntry[] }) {
  const newestFirst = [...entries].reverse();
  const todayCount = entries.filter(({ completedAt }) => isToday(completedAt)).length;
  const verifiedCount = entries.filter(
    ({ completionMode }) => completionMode === "camera",
  ).length;

  return (
    <section className="movement-history" id="history" aria-labelledby="history-heading">
      <header>
        <h2 id="history-heading">Your movement history.</h2>
        <p>
          Completed activities stay on this device. WorkPulse does not send
          this record to an employer or a remote service.
        </p>
      </header>

      <div className="movement-history__content">
        <dl className="history-summary" aria-label="Activity history summary">
          <div>
            <dt>Completed</dt>
            <dd>{entries.length}</dd>
          </div>
          <div>
            <dt>Today</dt>
            <dd>{todayCount}</dd>
          </div>
          <div>
            <dt>Camera verified</dt>
            <dd>{verifiedCount}</dd>
          </div>
        </dl>

        {entries.length === 0 ? (
          <div className="history-empty">
            <strong>No completed activities yet.</strong>
            <p>Finish the neck reset and its details will appear here.</p>
          </div>
        ) : (
          <ol className="history-list">
            {newestFirst.map((entry) => {
              const completed = dateParts(entry.completedAt);
              return (
                <li key={`${entry.completedAt}-${entry.activityId}`}>
                  <time dateTime={entry.completedAt}>
                    <span>{completed.day}</span>
                    <strong>{completed.time}</strong>
                  </time>
                  <div>
                    <h3>{entry.activityName}</h3>
                    <p>
                      {entry.completionMode === "camera"
                        ? "Completed with on-device camera verification"
                        : "Completed manually without camera verification"}
                    </p>
                  </div>
                  <dl>
                    <div>
                      <dt>Duration</dt>
                      <dd>{entry.durationSeconds} sec</dd>
                    </div>
                    <div>
                      <dt>Movements</dt>
                      <dd>{entry.movements}</dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
