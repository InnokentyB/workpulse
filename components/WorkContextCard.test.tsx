import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkContextCard } from "@/components/WorkContextCard";

describe("WorkContextCard", () => {
  it("renders all current context values", () => {
    render(
      <WorkContextCard
        context={{
          sedentaryMinutes: 57,
          minutesToNextMeeting: 12,
          minutesSinceLastActivity: 78,
          currentTime: "14:03",
          nextMeetingTitle: "Design Review",
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: /right now/i })).toBeDefined();
    expect(screen.getByText(/work context at 14:03/i)).toBeDefined();
    expect(screen.getByText("57")).toBeDefined();
    expect(screen.getByText("in 12")).toBeDefined();
    expect(screen.getByText("Design Review")).toBeDefined();
    expect(screen.getByText("78")).toBeDefined();
    expect(screen.getByText("Calendar context")).toBeDefined();
    expect(screen.getByText("Design Review · in 12 min")).toBeDefined();
    expect(screen.getByText("Demo data")).toBeDefined();
    expect(screen.getByText("Camera")).toBeDefined();
    expect(screen.getByText("Off until you start the activity")).toBeDefined();
    expect(screen.getByText("Exercise only")).toBeDefined();
  });

  it("renders a clear calendar without inventing a meeting", () => {
    render(
      <WorkContextCard
        context={{
          sedentaryMinutes: 57,
          minutesToNextMeeting: null,
          minutesSinceLastActivity: 78,
          currentTime: "14:03",
        }}
      />,
    );

    expect(screen.getByText("Clear")).toBeDefined();
    expect(screen.getByText("No meeting scheduled")).toBeDefined();
    expect(screen.getByText("No upcoming meeting")).toBeDefined();
  });

  it("labels live manual context without claiming calendar data", () => {
    render(
      <WorkContextCard
        context={{
          sedentaryMinutes: 42,
          minutesToNextMeeting: null,
          minutesSinceLastActivity: 42,
          currentTime: "11:20",
        }}
        source="manual"
      />,
    );

    expect(screen.getByText("No calendar connected")).toBeDefined();
    expect(screen.getAllByText("Manual mode")).toHaveLength(2);
    expect(screen.getByText("Open")).toBeDefined();
    expect(screen.queryByText("Demo data")).toBeNull();
  });
});
