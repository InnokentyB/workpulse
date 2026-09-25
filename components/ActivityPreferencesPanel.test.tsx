import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ActivityPreferencesPanel } from "@/components/ActivityPreferencesPanel";
import { DEFAULT_ACTIVITY_PREFERENCES } from "@/lib/activity-preferences";

describe("ActivityPreferencesPanel", () => {
  it("reports workspace changes and keeps leaving the desk consistent", () => {
    const onChange = vi.fn();
    render(
      <ActivityPreferencesPanel
        onChange={onChange}
        preferences={DEFAULT_ACTIVITY_PREFERENCES}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /i can stand/i }));
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_ACTIVITY_PREFERENCES,
      canStand: true,
    });

    fireEvent.click(screen.getByRole("checkbox", { name: /i can leave my desk/i }));
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_ACTIVITY_PREFERENCES,
      canLeaveDesk: true,
      canStand: true,
    });
  });

  it("allows an activity to be excluded", () => {
    const onChange = vi.fn();
    render(
      <ActivityPreferencesPanel
        onChange={onChange}
        preferences={DEFAULT_ACTIVITY_PREFERENCES}
      />,
    );

    fireEvent.click(
      screen.getByRole("checkbox", { name: /exclude wall push-ups/i }),
    );
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_ACTIVITY_PREFERENCES,
      excludedActivityIds: ["wall-push-ups"],
    });
  });
});
