import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  LiveNeckCue,
  NeckMovementPreview,
} from "@/components/NeckMovementGuide";
import {
  INITIAL_NECK_MOTION_STATE,
  type NeckMotionState,
} from "@/lib/neck-motion-tracker";

describe("NeckMovementGuide", () => {
  it("shows the complete movement sequence before the camera starts", () => {
    render(<NeckMovementPreview />);

    expect(screen.getByRole("list").children).toHaveLength(4);
    expect(screen.getByText("Turn to one side")).toBeDefined();
    expect(screen.getByText("Turn to the other")).toBeDefined();
    expect(screen.getByText("Lower your chin")).toBeDefined();
    expect(screen.getByText("Lift your gaze slightly")).toBeDefined();
  });

  it.each([
    ["calibrating", "Hold neutral"],
    ["first-side", "Turn to either side"],
    ["down", "Chin down"],
    ["up", "Gaze slightly up"],
    ["center", "Return to neutral"],
  ] as const)("shows the %s live cue", (stage, label) => {
    const motion: NeckMotionState = {
      ...INITIAL_NECK_MOTION_STATE,
      stage,
      tracking: "ready",
    };

    render(<LiveNeckCue motion={motion} />);

    expect(screen.getByText(label)).toBeDefined();
  });

  it("asks the user to reframe when tracking is lost", () => {
    render(<LiveNeckCue motion={INITIAL_NECK_MOTION_STATE} />);

    expect(screen.getByText("Face and shoulders in frame")).toBeDefined();
  });
});
