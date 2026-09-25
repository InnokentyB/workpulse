import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkPulseApp } from "@/components/WorkPulseApp";

describe("WorkPulseApp", () => {
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
    expect(screen.getByText("About 45 seconds")).toBeDefined();
    expect(screen.getByRole("button", { name: /start activity/i })).toBeDefined();
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
    expect(screen.queryByRole("button", { name: /start activity/i })).toBeNull();
  });

  it("offers and opens the shoulder timer for a medium window", () => {
    render(<WorkPulseApp />);

    fireEvent.change(screen.getByLabelText(/choose the workday context/i), {
      target: { value: "shoulder-window" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));

    expect(screen.getByText("Shoulder reset")).toBeDefined();
    expect(screen.getByText("About 1 min 30 sec")).toBeDefined();
    expect(screen.getByText(/100 minutes ago/i)).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /start activity/i }));
    expect(screen.getByRole("heading", { name: "Shoulder reset" })).toBeDefined();
    expect(screen.getByText("1:30")).toBeDefined();
    expect(screen.getByRole("button", { name: /start exercise/i })).toBeDefined();
  });

  it("offers the full-body reset for a long movement gap", () => {
    render(<WorkPulseApp />);

    fireEvent.change(screen.getByLabelText(/choose the workday context/i), {
      target: { value: "full-reset-window" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));

    expect(screen.getByText("Full-body reset")).toBeDefined();
    expect(screen.getByText("About 3 minutes")).toBeDefined();
  });

  it("completes the minimal activity loop", () => {
    render(<WorkPulseApp />);
    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));
    fireEvent.click(screen.getByRole("button", { name: /start activity/i }));

    expect(screen.getByRole("heading", { name: "Neck reset" })).toBeDefined();
    expect(screen.getByText(/does not record, save, or upload video/i)).toBeDefined();
    fireEvent.click(
      screen.getByRole("button", { name: /finish without camera/i }),
    );
    expect(screen.getByText(/nice work/i)).toBeDefined();
    expect(screen.getByText(/without camera verification/i)).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /run again/i }));
    expect(screen.getByRole("button", { name: /ask workpulse/i })).toBeDefined();
    expect(screen.queryByText(/nice work/i)).toBeNull();
    expect(screen.getByText("0")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /ask workpulse/i }));
    expect(screen.getByRole("heading", { name: /not now/i })).toBeDefined();
  });
});
