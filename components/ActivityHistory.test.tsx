import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ActivityHistory } from "@/components/ActivityHistory";
import type { ActivityHistoryEntry } from "@/lib/activity-history";

const entries: ActivityHistoryEntry[] = [
  {
    activityId: "neck-reset",
    activityName: "Neck reset",
    completedAt: "2026-09-24T16:00:00.000Z",
    completionMode: "camera",
    durationSeconds: 45,
    movements: 4,
  },
  {
    activityId: "neck-reset",
    activityName: "Neck reset",
    completedAt: "2026-09-25T09:00:00.000Z",
    completionMode: "manual",
    durationSeconds: 45,
    movements: 0,
  },
  {
    activityId: "shoulder-rolls",
    activityName: "Shoulder rolls",
    completedAt: "2026-09-25T11:55:00.000Z",
    completionMode: "guided",
    durationSeconds: 60,
    movements: 6,
  },
];

describe("ActivityHistory", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-25T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("summarizes today's count and the latest completed activity", () => {
    render(<ActivityHistory entries={entries} />);

    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("exercises")).toBeDefined();
    expect(screen.getByText("5 minutes ago")).toBeDefined();
    expect(screen.getAllByText("Shoulder rolls")).toHaveLength(2);
  });

  it("keeps all completed activities visible in newest-first order", () => {
    render(<ActivityHistory entries={entries} />);

    const activityHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(activityHeadings.map((heading) => heading.textContent)).toEqual([
      "Shoulder rolls",
      "Neck reset",
      "Neck reset",
    ]);
  });

  it("refreshes relative time while the page stays open", () => {
    render(<ActivityHistory entries={entries} />);

    expect(screen.getByText("5 minutes ago")).toBeDefined();

    act(() => vi.advanceTimersByTime(60_000));

    expect(screen.getByText("6 minutes ago")).toBeDefined();
  });
});
