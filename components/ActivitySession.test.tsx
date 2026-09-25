import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActivitySession } from "@/components/ActivitySession";

const originalMediaDevices = navigator.mediaDevices;
const activity = {
  id: "neck-reset",
  name: "Neck reset",
  instructions:
    "Slowly turn side to side, lower your chin, and lift your gaze within a comfortable range.",
  durationSeconds: 45,
  guide: "camera-neck" as const,
};

afterEach(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: originalMediaDevices,
  });
});

describe("ActivitySession", () => {
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
      mode: "manual",
      movements: 0,
      verified: false,
    });
  });

  it("completes a screen-guided shoulder activity without camera access", () => {
    const onComplete = vi.fn();
    render(
      <ActivitySession
        activity={{
          durationSeconds: 60,
          guide: "guided-steps",
          id: "shoulder-rolls",
          instructions: "Make three slow circles forward, then three backward.",
          movementCount: 6,
          name: "Shoulder rolls",
          steps: ["Settle", "Roll forward", "Roll backward"],
        }}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByRole("heading", { name: "Shoulder rolls" })).toBeDefined();
    expect(screen.getByText(/no camera needed/i)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /complete activity/i }));

    expect(onComplete).toHaveBeenCalledWith({
      mode: "guided",
      movements: 6,
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

    render(
      <ActivitySession
        activity={activity}
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /enable camera/i }));

    expect(await screen.findByRole("alert")).toBeDefined();
    expect(screen.getByText(/allow camera access in your browser settings/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /try camera again/i })).toBeDefined();
  });
});
