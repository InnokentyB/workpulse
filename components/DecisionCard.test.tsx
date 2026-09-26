import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DecisionCard } from "@/components/DecisionCard";
import { ACTIVITIES } from "@/lib/activity-selector";
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
    guide: "camera-neck",
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

    fireEvent.click(screen.getByRole("button", { name: /start neck reset/i }));

    expect(onStart).toHaveBeenCalledOnce();
  });

  it("lets the user dismiss a recommendation", () => {
    const onDismiss = vi.fn();
    render(
      <DecisionCard
        onDismiss={onDismiss}
        onStart={vi.fn()}
        result={recommendation}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^not now$/i }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("lets the user choose between the two available activities", () => {
    const onActivitySelect = vi.fn();
    const { container } = render(
      <DecisionCard
        activities={ACTIVITIES}
        onActivitySelect={onActivitySelect}
        onStart={vi.fn()}
        result={recommendation}
      />,
    );

    expect(screen.getByRole("radio", { name: /neck reset/i })).toHaveProperty(
      "checked",
      true,
    );
    expect(container.querySelector('[data-icon="neck-reset"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="shoulder-rolls"]')).not.toBeNull();
    expect(screen.getByRole("heading", { name: /how to do neck reset/i })).toBeDefined();
    expect(screen.getByText(recommendation.activity!.instructions)).toBeDefined();
    fireEvent.click(screen.getByRole("radio", { name: /shoulder rolls/i }));
    expect(onActivitySelect).toHaveBeenCalledWith("shoulder-rolls");
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
    expect(screen.queryByRole("button", { name: /^start /i })).toBeNull();
  });
});
