import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MovementScene from "./MovementScene";

describe("MovementScene", () => {
  it("keeps all seven trail positions distinct and stable through a pause", () => {
    const { rerender, container } = render(<MovementScene scene="trail" completedCycles={0} status="active" />);
    const positions = new Set<string>();
    for (let cycle = 0; cycle <= 6; cycle++) {
      rerender(<MovementScene scene="trail" completedCycles={cycle} status="active" />);
      expect(screen.getByRole("img", { name: new RegExp(`stop ${cycle} of 6`) })).toBeTruthy();
      const position = container.querySelector(".movement-scene__traveler")!.getAttribute("transform")!;
      positions.add(position);
      rerender(<MovementScene scene="trail" completedCycles={cycle} status="paused" />);
      expect(container.querySelector(".movement-scene__traveler")!.getAttribute("transform")).toBe(position);
    }
    expect(positions.size).toBe(7);
  });

  it("names every lantern stage for people who cannot see the illustration", () => {
    const stages = ["Empty workbench", "Frame assembled", "Panels fitted", "Handle attached", "Wick fitted", "First light", "Lantern glowing"];
    const { rerender, container } = render(<MovementScene scene="workshop" completedCycles={0} status="ready" />);
    for (let cycle = 0; cycle <= 6; cycle++) {
      rerender(<MovementScene scene="workshop" completedCycles={cycle} status="active" />);
      expect(screen.getByRole("img", { name: new RegExp(stages[cycle]) })).toBeTruthy();
      expect(container.querySelector('[aria-live="polite"]')?.textContent).toContain(stages[cycle]);
      const assembly = container.querySelector("svg")!;
      expect(assembly.querySelectorAll('circle[fill="#15684a"]').length).toBe(cycle);
    }
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 2.8, 99])("normalizes malformed progress %s for both scenes", (progress) => {
    const expected = Number.isFinite(progress) ? Math.max(0, Math.min(6, Math.floor(progress))) : 0;
    const { rerender } = render(<MovementScene scene="trail" completedCycles={progress} status="active" />);
    expect(screen.getByText(`${expected} / 6`)).toBeTruthy();
    rerender(<MovementScene scene="workshop" completedCycles={progress} status="active" />);
    expect(screen.getByText(`${expected} / 6`)).toBeTruthy();
  });

  it("shows trail progress only when completed cycles change", () => {
    const { rerender, container } = render(<MovementScene scene="trail" completedCycles={0} status="active" />);
    expect(screen.getByRole("img", { name: /stop 0 of 6/ })).toBeTruthy();
    expect(container.querySelector("figure")?.getAttribute("data-status")).toBe("active");
    rerender(<MovementScene scene="trail" completedCycles={0} status="paused" />);
    expect(screen.getByRole("img", { name: /stop 0 of 6/ })).toBeTruthy();
    rerender(<MovementScene scene="trail" completedCycles={3} status="active" />);
    expect(screen.getByRole("img", { name: /stop 3 of 6/ })).toBeTruthy();
    expect(screen.getByText("3 / 6")).toBeTruthy();
  });

  it("renders each lantern stage and caps out-of-range input", () => {
    const { rerender } = render(<MovementScene scene="workshop" completedCycles={2} status="active" />);
    expect(screen.getByRole("img", { name: /completed 2 of 6 steps/ })).toBeTruthy();
    rerender(<MovementScene scene="workshop" completedCycles={99} status="complete" />);
    expect(screen.getByRole("img", { name: /completed 6 of 6 steps/ })).toBeTruthy();
    rerender(<MovementScene scene="workshop" completedCycles={Number.NaN} status="ready" />);
    expect(screen.getByRole("img", { name: /completed 0 of 6 steps/ })).toBeTruthy();
  });
});
