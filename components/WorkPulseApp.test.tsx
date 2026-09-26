import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { WorkPulseApp } from "@/components/WorkPulseApp";

function renderDemo() {
  const view = render(<WorkPulseApp />);
  fireEvent.click(screen.getByRole("button", { name: /demo mode/i }));
  return view;
}

describe("WorkPulseApp", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps fixed scenarios in a separate demo mode", () => {
    renderDemo();

    expect(screen.getByText("57")).toBeDefined();
    expect(screen.getByText("in 12")).toBeDefined();
    expect(screen.getByText("78")).toBeDefined();
    expect(screen.getByRole("button", { name: /ask workpulse/i })).toBeDefined();
  });

  it("starts and ends a live workday without a calendar", () => {
    render(<WorkPulseApp />);

    expect(screen.getByText(/no active session/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: /ask workpulse/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /start work session/i }));

    expect(screen.getByText(/work session in progress/i)).toBeDefined();
    expect(screen.getByText("No calendar connected")).toBeDefined();
    expect(screen.getByRole("button", { name: /ask workpulse/i })).toBeDefined();
    expect(window.localStorage.getItem("workpulse.workday-session")).toContain(
      "startedAt",
    );

    fireEvent.click(screen.getByRole("button", { name: /end session/i }));
    expect(screen.getByText(/no active session/i)).toBeDefined();
    expect(window.localStorage.getItem("workpulse.workday-session")).toBeNull();
  });

  it("restores an active work session from this browser", async () => {
    const startedAt = new Date(Date.now() - 45 * 60_000).toISOString();
    window.localStorage.setItem(
      "workpulse.workday-session",
      JSON.stringify({ version: 1, session: { startedAt } }),
    );

    render(<WorkPulseApp />);

    expect(await screen.findByText(/work session in progress/i)).toBeDefined();
    expect(screen.getAllByText("45 min").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /ask workpulse/i })).toBeDefined();
  });

  it("offers skippable setup once and lets the user edit it later", async () => {
    renderDemo();

    expect(
      await screen.findByRole("heading", {
        name: /make each suggestion fit where you are/i,
      }),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /skip for now/i }));
    expect(
      screen.queryByRole("heading", {
        name: /make each suggestion fit where you are/i,
      }),
    ).toBeNull();
    expect(window.localStorage.getItem("workpulse.activity-preferences")).toContain(
      '"onboardingStatus":"skipped"',
    );

    fireEvent.click(screen.getByRole("button", { name: /edit setup/i }));
    expect(
      screen.getByRole("heading", {
        name: /make each suggestion fit where you are/i,
      }),
    ).toBeDefined();
  });

  it("shows the complete recommendation for the good-window scenario", () => {
    renderDemo();

    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));

    expect(screen.getByRole("heading", { name: /move now/i })).toBeDefined();
    expect(screen.getByText("HIGH")).toBeDefined();
    expect(screen.getByText("LOW")).toBeDefined();
    expect(screen.getByText("Neck reset")).toBeDefined();
    expect(screen.getByText(/about 45 sec/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /start neck reset/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /how to do neck reset/i })).toBeDefined();
  });

  it("recommends an activity that fits current workspace options", () => {
    renderDemo();

    fireEvent.click(screen.getByRole("checkbox", { name: /i can stand/i }));
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));

    expect(
      screen.getByRole("button", { name: /start wall push-ups/i }),
    ).toBeDefined();
    expect(
      screen.getByText(/standing movement is possible/i),
    ).toBeDefined();
  });

  it("uses a screen-guided option when camera is unavailable", () => {
    renderDemo();

    fireEvent.click(screen.getByRole("checkbox", { name: /camera is okay/i }));
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));

    expect(
      screen.getByRole("button", { name: /start eye care break/i }),
    ).toBeDefined();
    expect(screen.queryByRole("radio", { name: /neck reset/i })).toBeNull();
  });

  it("persists workspace preferences on this device", async () => {
    const firstRender = renderDemo();
    fireEvent.click(screen.getByRole("checkbox", { name: /i can stand/i }));
    firstRender.unmount();

    renderDemo();

    await waitFor(() =>
      expect(
        screen.getByRole("checkbox", { name: /i can stand/i }),
      ).toHaveProperty("checked", true),
    );
  });

  it("supports the compact selector and clears the previous decision", () => {
    renderDemo();

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
    renderDemo();

    fireEvent.click(screen.getByRole("radio", { name: /meeting starts soon/i }));
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));

    expect(screen.getByRole("heading", { name: /not now/i })).toBeDefined();
    expect(screen.getAllByText("HIGH")).toHaveLength(2);
    expect(screen.getByText(/next meeting starts in 2 minutes/i)).toBeDefined();
    expect(screen.queryByText("Neck reset")).toBeNull();
    expect(screen.queryByRole("button", { name: /^start /i })).toBeNull();
  });

  it("shows NOT_NOW when movement is not needed yet", () => {
    renderDemo();

    fireEvent.click(
      screen.getByRole("radio", { name: /movement not needed yet/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));

    expect(screen.getByRole("heading", { name: /not now/i })).toBeDefined();
    expect(screen.getAllByText("LOW")).toHaveLength(2);
    expect(screen.getAllByText(/movement need is still low/i)).toHaveLength(2);
  });

  it("records a dismissal and honors its fifteen minute cooldown", () => {
    const firstRender = renderDemo();
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));
    fireEvent.click(screen.getByRole("button", { name: /^not now$/i }));

    expect(screen.getByText(/stay quiet for 15 minutes/i)).toBeDefined();
    expect(
      window.localStorage.getItem("workpulse.intervention-dismissals"),
    ).toContain("neck-reset");

    firstRender.unmount();
    renderDemo();
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));

    expect(screen.getByRole("heading", { name: /not now/i })).toBeDefined();
    expect(screen.getByText(/you chose to keep working/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: /^start /i })).toBeNull();
  });

  it("completes the minimal activity loop and records it locally", async () => {
    renderDemo();
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
    expect(
      screen.getByRole("heading", { name: /how did neck reset feel/i }),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /run again/i }));
    expect(screen.getByRole("button", { name: /ask workpulse/i })).toBeDefined();
    expect(screen.queryByText(/nice work/i)).toBeNull();
  });

  it("saves optional activity feedback on this device", async () => {
    renderDemo();
    await screen.findByText("No completed activities yet.");
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));
    fireEvent.click(screen.getByRole("button", { name: /start neck reset/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /finish without camera/i }),
    );
    fireEvent.click(screen.getByRole("radio", { name: /just right/i }));
    fireEvent.click(screen.getByRole("radio", { name: /^yes$/i }));
    fireEvent.click(screen.getByRole("button", { name: /save feedback/i }));

    expect(window.localStorage.getItem("workpulse.activity-feedback")).toContain(
      '"repeat":"yes"',
    );
    expect(screen.getByText(/thanks — this stays on this device/i)).toBeDefined();
  });

  it("offers camera verification for the second activity", async () => {
    renderDemo();
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
