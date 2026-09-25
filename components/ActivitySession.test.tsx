import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ActivitySession } from "@/components/ActivitySession";

const originalMediaDevices = navigator.mediaDevices;
const originalMatchMedia = window.matchMedia;
const originalInnerHeight = window.innerHeight;
const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
const scrollIntoView = vi.fn();
const activity = {
  id: "neck-reset",
  name: "Neck reset",
  instructions:
    "Slowly turn side to side, lower your chin, and lift your gaze within a comfortable range.",
  durationSeconds: 45,
  guide: "camera-neck" as const,
};

beforeEach(() => {
  scrollIntoView.mockReset();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({ matches: false }),
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoView,
  });
});

afterEach(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: originalMediaDevices,
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: originalScrollIntoView,
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: originalInnerHeight,
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

    const heading = screen.getByRole("heading", { name: "Neck reset" });
    expect(heading).toBeDefined();
    expect(document.activeElement).toBe(heading.closest("section"));
    expect(screen.getByLabelText("0 of 4 neck movements")).toBeDefined();
    expect(screen.getByText(/does not record, save, or upload video/i)).toBeDefined();
    expect(screen.getByText(/stop if you feel pain or dizziness/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /enable camera/i })).toBeDefined();
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("moves immediately when reduced motion is preferred", () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
    } as MediaQueryList);

    render(
      <ActivitySession
        activity={activity}
        onComplete={vi.fn()}
      />,
    );

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
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
    const { container } = render(
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
    expect(container.querySelector('[data-icon="shoulder-rolls"]')).not.toBeNull();
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
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
    expect(screen.getByText(/allow camera access in your browser settings/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /try camera again/i })).toBeDefined();
  });

  it("top-aligns a camera preview that is taller than the viewport", () => {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockReturnValue(new Promise(() => undefined)),
      },
    });

    const { container } = render(
      <ActivitySession
        activity={activity}
        onComplete={vi.fn()}
      />,
    );
    vi.spyOn(
      container.querySelector(".camera-stage") as HTMLDivElement,
      "getBoundingClientRect",
    ).mockReturnValue({ height: 600 } as DOMRect);

    fireEvent.click(screen.getByRole("button", { name: /enable camera/i }));

    expect(scrollIntoView).toHaveBeenLastCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });
});
