import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TimedActivitySession } from "@/components/TimedActivitySession";
import type { Activity } from "@/lib/types";

const activity: Activity = {
  id: "shoulder-reset",
  name: "Shoulder reset",
  durationSeconds: 3,
  instructions: "Move your shoulders slowly.",
  sessionType: "timer",
  steps: ["Roll backward", "Draw together", "Release"],
};

afterEach(() => {
  vi.useRealTimers();
});

describe("TimedActivitySession", () => {
  it("shows the duration and complete sequence before starting", () => {
    render(<TimedActivitySession activity={activity} onComplete={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Shoulder reset" })).toBeDefined();
    expect(screen.getByText("0:03")).toBeDefined();
    expect(screen.getByRole("list").children).toHaveLength(3);
    expect(screen.getByRole("button", { name: /start exercise/i })).toBeDefined();
  });

  it("advances the guidance and completes when the timer ends", async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<TimedActivitySession activity={activity} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /start exercise/i }));
    expect(screen.getByText("Roll backward")).toBeDefined();

    await act(async () => vi.advanceTimersByTimeAsync(1_100));
    expect(screen.getByText("Draw together")).toBeDefined();

    await act(async () => vi.advanceTimersByTimeAsync(1_100));
    await act(async () => vi.advanceTimersByTimeAsync(1_100));
    expect(onComplete).toHaveBeenCalledWith({
      completedSteps: 3,
      mode: "timer",
      verified: false,
    });
  });

  it("supports pause and resume without losing progress", async () => {
    vi.useFakeTimers();
    render(<TimedActivitySession activity={activity} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /start exercise/i }));
    await act(async () => vi.advanceTimersByTimeAsync(1_100));
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    await act(async () => vi.advanceTimersByTimeAsync(2_000));

    expect(screen.getByText("0:02")).toBeDefined();
    expect(screen.getByRole("button", { name: /resume/i })).toBeDefined();
  });
});
