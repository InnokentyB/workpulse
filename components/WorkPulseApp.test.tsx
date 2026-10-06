import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACTIVITY_HISTORY_STORAGE_KEY } from "@/lib/activity-history";

import { WorkPulseApp } from "@/components/WorkPulseApp";

describe("WorkPulseApp", () => {
  it("runs the dance from a recommendation and records a guided unverified completion", async () => {
    vi.useFakeTimers();
    try {
      render(<WorkPulseApp />);
      await act(async () => { await Promise.resolve(); });
      fireEvent.click(screen.getByRole("button", { name: "Ask WorkPulse" }));
      fireEvent.click(screen.getByRole("radio", { name: /Desk dance/ }));
      expect(screen.getByRole("link", { name: "Play this exercise" }).getAttribute("href")).toBe("/play?activity=desk-dance");
      fireEvent.click(screen.getByRole("button", { name: "Start desk dance" }));
      expect(screen.queryByRole("button", { name: "Enable camera" })).toBeNull();
      for (let i = 0; i < 6; i++) {
        fireEvent.click(screen.getByRole("button", { name: "Start phrase" }));
        act(() => vi.advanceTimersByTime(6000));
        fireEvent.click(screen.getByRole("button", { name: "I followed this phrase" }));
      }
      const history = JSON.parse(window.localStorage.getItem(ACTIVITY_HISTORY_STORAGE_KEY)!);
      expect(history.entries.at(-1)).toMatchObject({ activityId: "desk-dance", completionMode: "guided", movements: 6 });
      expect(screen.getByText("Completed with on-screen guidance. No camera was used.")).toBeDefined();
    } finally { vi.useRealTimers(); }
  });
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts with the canonical good-window context", () => {
    render(<WorkPulseApp />);

    expect(screen.getByText("57")).toBeDefined();
    expect(screen.getByText("in 12")).toBeDefined();
    expect(screen.getByText("78")).toBeDefined();
    expect(screen.getByRole("button", { name: /ask workpulse/i })).toBeDefined();
  });

  it("shows the complete recommendation for the good-window scenario", () => {
    render(<WorkPulseApp />);

    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));

    expect(screen.getByRole("heading", { name: /move now/i })).toBeDefined();
    expect(screen.getByText("HIGH")).toBeDefined();
    expect(screen.getByText("LOW")).toBeDefined();
    expect(screen.getByText("Neck reset")).toBeDefined();
    expect(screen.getByText(/about 45 sec/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /start neck reset/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /how to do neck reset/i })).toBeDefined();
  });

  it("supports the compact selector and clears the previous decision", () => {
    render(<WorkPulseApp />);

    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));
    expect(screen.getByRole("heading", { name: /move now/i })).toBeDefined();

    fireEvent.change(screen.getByLabelText(/choose the workday context/i), {
      target: { value: "meeting-soon" },
    });

    expect(screen.queryByRole("heading", { name: /move now/i })).toBeNull();
    expect(screen.getByText("72")).toBeDefined();
    expect(screen.getByText("in 2")).toBeDefined();
    expect(screen.getByText("90")).toBeDefined();
    expect(screen.getByRole("button", { name: /ask workpulse/i })).toBeDefined();
  });

  it("shows NOT_NOW without an activity when a meeting starts soon", () => {
    render(<WorkPulseApp />);

    fireEvent.click(screen.getByRole("radio", { name: /meeting starts soon/i }));
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));

    expect(screen.getByRole("heading", { name: /not now/i })).toBeDefined();
    expect(screen.getAllByText("HIGH")).toHaveLength(2);
    expect(screen.getByText(/next meeting starts in 2 minutes/i)).toBeDefined();
    expect(screen.queryByText("Neck reset")).toBeNull();
    expect(screen.queryByRole("button", { name: /^start /i })).toBeNull();
  });

  it("completes the minimal activity loop and records it locally", async () => {
    render(<WorkPulseApp />);
    await screen.findByText("No completed activities yet.");
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));
    fireEvent.click(screen.getByRole("button", { name: /start neck reset/i }));

    expect(screen.getByRole("heading", { name: "Neck reset" })).toBeDefined();
    expect(screen.getByText(/does not record, save, or upload video/i)).toBeDefined();
    fireEvent.click(
      screen.getByRole("button", { name: /finish without camera/i }),
    );
    expect(screen.getByText(/nice work/i)).toBeDefined();
    expect(
      screen.getByText("Completed without camera verification."),
    ).toBeDefined();
    expect(screen.getByRole("heading", { name: /your movement history/i })).toBeDefined();
    expect(screen.getByText("Completed manually without camera verification")).toBeDefined();
    expect(screen.getByText("45 sec")).toBeDefined();
    expect(screen.getByText("Estimated")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /run again/i }));
    expect(screen.getByRole("button", { name: /ask workpulse/i })).toBeDefined();
    expect(screen.queryByText(/nice work/i)).toBeNull();
  });

  it("offers camera verification for the second activity", async () => {
    render(<WorkPulseApp />);
    await screen.findByText("No completed activities yet.");

    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));
    fireEvent.click(screen.getByRole("radio", { name: /shoulder rolls/i }));
    expect(
      screen.getByRole("heading", { name: /how to do shoulder rolls/i }),
    ).toBeDefined();
    expect(
      screen.getByText(
        "Make three slow shoulder circles forward, then three backward. Stay within a comfortable range.",
      ),
    ).toBeDefined();
    fireEvent.click(
      screen.getByRole("button", { name: /start shoulder rolls/i }),
    );

    expect(screen.getByRole("heading", { name: "Shoulder rolls" })).toBeDefined();
    expect(screen.getByLabelText("0 of 6 shoulder rolls")).toBeDefined();
    expect(screen.getByText(/complete six slow shoulder rolls/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /enable camera/i })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /finish without camera/i }));

    expect(screen.getByText(/shoulder rolls complete/i)).toBeDefined();
    expect(screen.getByText("Completed manually without camera verification")).toBeDefined();
    expect(screen.getByText("exercise")).toBeDefined();
    expect(screen.getByText("Just now")).toBeDefined();
  });
});
