import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ActivityFeedbackCard } from "@/components/ActivityFeedbackCard";

describe("ActivityFeedbackCard", () => {
  it("submits a lightweight two-answer review", () => {
    const onSubmit = vi.fn();
    render(
      <ActivityFeedbackCard
        activityId="neck-reset"
        activityName="Neck reset"
        onExclude={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /just right/i }));
    fireEvent.click(screen.getByRole("radio", { name: /^yes$/i }));
    fireEvent.click(screen.getByRole("button", { name: /save feedback/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      activityId: "neck-reset",
      load: "just-right",
      repeat: "yes",
    });
    expect(screen.getByText(/thanks — this stays on this device/i)).toBeDefined();
  });

  it("can permanently exclude the completed activity", () => {
    const onExclude = vi.fn();
    render(
      <ActivityFeedbackCard
        activityId="neck-reset"
        activityName="Neck reset"
        onExclude={onExclude}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /do not suggest neck reset again/i }),
    );

    expect(onExclude).toHaveBeenCalledWith("neck-reset");
  });
});
