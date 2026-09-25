import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ActivitySession,
  CameraDiagnostics,
} from "@/components/ActivitySession";
import {
  INITIAL_NECK_MOTION_STATE,
  type NeckMotionState,
} from "@/lib/neck-motion-tracker";

const originalMediaDevices = navigator.mediaDevices;
const activity = {
  id: "neck-reset",
  name: "Neck reset",
  instructions:
    "Slowly turn side to side, lower your chin, and lift your gaze within a comfortable range.",
  durationSeconds: 45,
  sessionType: "camera-neck" as const,
  steps: [
    "Turn to one side",
    "Turn to the other side",
    "Lower your chin",
    "Lift your gaze slightly",
  ],
};

afterEach(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: originalMediaDevices,
  });
});

describe("ActivitySession", () => {
  it("shows live camera measurements and supports recalibration", () => {
    const onRecalibrate = vi.fn();
    const motion: NeckMotionState = {
      ...INITIAL_NECK_MOTION_STATE,
      stage: "opposite-side",
      movements: 1,
      tracking: "ready",
      visibility: {
        face: true,
        leftShoulder: true,
        rightShoulder: true,
      },
      horizontalDelta: 0.12,
      verticalDelta: -0.04,
    };

    render(
      <CameraDiagnostics motion={motion} onRecalibrate={onRecalibrate} />,
    );

    expect(screen.getByText("Face visible")).toBeDefined();
    expect(screen.getByText("Both shoulders visible")).toBeDefined();
    expect(screen.getByText("Turn to the other side")).toBeDefined();
    expect(screen.getByText("+12%", { exact: true })).toBeDefined();
    expect(screen.getByText("−4%", { exact: true })).toBeDefined();
    expect(screen.getByText(/turn: 10%/i)).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /recalibrate/i }));
    expect(onRecalibrate).toHaveBeenCalledOnce();
  });

  it("explains camera privacy before requesting permission", () => {
    const onComplete = vi.fn();
    render(
      <ActivitySession
        activity={activity}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByRole("heading", { name: "Neck reset" })).toBeDefined();
    expect(screen.getByLabelText("0 of 4 neck movements")).toBeDefined();
    expect(
      screen.getByRole("heading", { name: "Your movement sequence" }),
    ).toBeDefined();
    expect(screen.getByText("Turn to one side")).toBeDefined();
    expect(screen.getByText("Turn to the other")).toBeDefined();
    expect(screen.getByText("Lower your chin")).toBeDefined();
    expect(screen.getByText("Lift your gaze slightly")).toBeDefined();
    expect(screen.getByText(/does not record, save, or upload video/i)).toBeDefined();
    expect(screen.getByText(/stop if you feel pain or dizziness/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /enable camera/i })).toBeDefined();
  });

  it("supports an explicit unverified fallback", () => {
    const onComplete = vi.fn();
    render(
      <ActivitySession
        activity={activity}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /finish without camera/i }),
    );

    expect(onComplete).toHaveBeenCalledWith({
      completedSteps: 0,
      mode: "manual",
      verified: false,
    });
  });

  it("explains how to recover when camera permission is declined", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockRejectedValue(
          new DOMException("Permission denied", "NotAllowedError"),
        ),
      },
    });

    const onEvent = vi.fn();
    render(
      <ActivitySession
        activity={activity}
        onComplete={vi.fn()}
        onEvent={onEvent}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /enable camera/i }));

    expect(await screen.findByRole("alert")).toBeDefined();
    expect(screen.getByText(/allow camera access in your browser settings/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /try camera again/i })).toBeDefined();
    expect(onEvent).toHaveBeenCalledWith("camera_permission_denied");
  });
});
