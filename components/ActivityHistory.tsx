"use client";

import { useEffect, useState } from "react";

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

function isToday(timestamp: string, now: number) {
  const date = new Date(timestamp);
  const today = new Date(now);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function relativeTime(timestamp: string, now: number) {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((now - new Date(timestamp).getTime()) / 60_000),
  );

  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes === 1) return "1 minute ago";
  if (elapsedMinutes < 60) return `${elapsedMinutes} minutes ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours === 1) return "1 hour ago";
  if (elapsedHours < 24) return `${elapsedHours} hours ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  return elapsedDays === 1 ? "1 day ago" : `${elapsedDays} days ago`;
}

function completionLabel(entry: ActivityHistoryEntry) {
  if (entry.completionMode === "camera") {
    return "Completed with on-device camera verification";
  }
  if (entry.completionMode === "guided") {
    return "Completed with on-screen guidance";
  }
  return "Completed manually without camera verification";
}

export function ActivityHistory({ entries }: { entries: ActivityHistoryEntry[] }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const newestFirst = [...entries].reverse();
  const latest = newestFirst[0];
  const todayCount = entries.filter(({ completedAt }) =>
    isToday(completedAt, now),
  ).length;

  return (
    <section className="movement-history" id="history" aria-labelledby="history-heading">
      <header>
        <h2 id="history-heading">Your movement history.</h2>
        <p>
          When browser storage is available, completed activities stay on this
          device. WorkPulse does not send this record to an employer or a
          remote service.
        </p>
      </header>

      <div className="movement-history__content">
        <dl className="history-summary" aria-label="Activity history summary">
          <div className="history-summary__today">
            <dt>Activities today</dt>
            <dd>
              <strong>{todayCount}</strong>
              <span>{todayCount === 1 ? "exercise" : "exercises"}</span>
            </dd>
          </div>
          <div className="history-summary__latest">
            <dt>Last activity</dt>
            <dd>
              <strong>{latest ? relativeTime(latest.completedAt, now) : "Not yet"}</strong>
              <span>{latest?.activityName ?? "Complete an activity to start"}</span>
            </dd>
          </div>
        </dl>

        {entries.length === 0 ? (
          <div className="history-empty">
            <strong>No completed activities yet.</strong>
            <p>Finish either activity and its details will appear here.</p>
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
                    <p>{completionLabel(entry)}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>Estimated</dt>
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
