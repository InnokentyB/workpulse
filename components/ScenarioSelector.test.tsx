import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ScenarioSelector } from "@/components/ScenarioSelector";
import { demoScenarios } from "@/data/demo-scenarios";

describe("ScenarioSelector", () => {
  it("renders every demo choice in the native selector and radio group", () => {
    render(
      <ScenarioSelector
        scenarios={demoScenarios}
        selectedId="good-window"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    const selectedRadio = screen.getByRole("radio", {
      name: /good time to move/i,
    }) as HTMLInputElement;
    expect(selectedRadio.checked).toBe(true);
  });

  it("reports choices from both selector controls", () => {
    const onSelect = vi.fn();
    render(
      <ScenarioSelector
        scenarios={demoScenarios}
        selectedId="good-window"
        onSelect={onSelect}
      />,
    );

    fireEvent.change(screen.getByLabelText(/choose the workday context/i), {
      target: { value: "meeting-soon" },
    });
    fireEvent.click(screen.getByRole("radio", { name: /meeting starts soon/i }));

    expect(onSelect).toHaveBeenNthCalledWith(1, "meeting-soon");
    expect(onSelect).toHaveBeenNthCalledWith(2, "meeting-soon");
  });
});
