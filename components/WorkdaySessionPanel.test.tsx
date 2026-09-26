import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WorkdaySessionPanel } from "@/components/WorkdaySessionPanel";

const baseProps = {
  elapsedMinutes: 0,
  minutesSinceLastActivity: 0,
  onEnd: vi.fn(),
  onSaveSettings: vi.fn(() => true),
  session: null,
  settings: { startTime: "09:00", endTime: "18:00" },
  withinWorkday: true,
};

describe("WorkdaySessionPanel", () => {
  it("shows the empty state before a manual session", () => {
    render(<WorkdaySessionPanel {...baseProps} />);
    expect(screen.getByText(/no active session/i)).toBeDefined();
  });

  it("shows real timing for an active session and can end it", () => {
    const onEnd = vi.fn();
    render(
      <WorkdaySessionPanel
        {...baseProps}
        elapsedMinutes={95}
        minutesSinceLastActivity={22}
        onEnd={onEnd}
        session={{ startedAt: "2026-09-26T09:00:00.000Z" }}
      />,
    );
    expect(screen.getByText("1 hr 35 min")).toBeDefined();
    expect(screen.getByText("22 min")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /end session/i }));
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it("validates and saves working hours", () => {
    const onSaveSettings = vi.fn(() => true);
    render(
      <WorkdaySessionPanel {...baseProps} onSaveSettings={onSaveSettings} />,
    );
    fireEvent.click(screen.getByText(/working hours/i));
    fireEvent.change(screen.getByLabelText(/workday end/i), {
      target: { value: "09:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save hours/i }));
    expect(screen.getByRole("alert").textContent).toMatch(/different/i);

    fireEvent.change(screen.getByLabelText(/workday end/i), {
      target: { value: "17:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save hours/i }));
    expect(onSaveSettings).toHaveBeenCalledWith({
      startTime: "09:00",
      endTime: "17:00",
    });
  });
});
