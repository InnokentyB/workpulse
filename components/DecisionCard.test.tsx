import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DecisionCard } from "@/components/DecisionCard";
import type { DecisionResult } from "@/lib/types";

const recommendation: DecisionResult = {
  decision: "MOVE_NOW",
  movementNeed: "HIGH",
  interruptionCost: "LOW",
  score: 0.75,
  reason: "Movement need is high and the interruption window is favorable.",
  activity: {
    id: "neck-reset",
    name: "Neck reset",
    instructions:
      "Slowly turn side to side, lower your chin, and lift your gaze within a comfortable range.",
    durationSeconds: 45,
  },
};

describe("DecisionCard", () => {
  it("renders the decision, signals, explanation, and activity", () => {
    render(<DecisionCard result={recommendation} onStart={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /move now/i })).toBeDefined();
    expect(screen.getByText("HIGH")).toBeDefined();
    expect(screen.getByText("LOW")).toBeDefined();
    expect(screen.getByText(recommendation.reason)).toBeDefined();
    expect(screen.getByText("Neck reset")).toBeDefined();
  });

  it("starts the offered activity", () => {
    const onStart = vi.fn();
    render(<DecisionCard result={recommendation} onStart={onStart} />);

    fireEvent.click(screen.getByRole("button", { name: /start activity/i }));

    expect(onStart).toHaveBeenCalledOnce();
  });

  it("never offers an activity for NOT_NOW", () => {
    render(
      <DecisionCard
        result={{
          ...recommendation,
          decision: "NOT_NOW",
          interruptionCost: "HIGH",
        }}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /not now/i })).toBeDefined();
    expect(screen.queryByText("Neck reset")).toBeNull();
    expect(screen.queryByRole("button", { name: /start activity/i })).toBeNull();
  });
});
