import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TimingLab } from "@/components/TimingLab";

function reachSuggestion() {
  fireEvent.click(screen.getByRole("button", { name: /advance to open window/i }));
  expect(screen.getByRole("heading", { name: "MOVE NOW" })).toBeDefined();
}

describe("TimingLab", () => {
  it("waits through a meeting, offers a break, and changes the recommendation after snooze", () => {
    render(<TimingLab />);
    expect(screen.getByRole("heading", { name: "WAIT" })).toBeDefined();
    expect(screen.getByText(/next available window/i)).toBeDefined();
    expect(screen.getByText(/moment explored/i).parentElement?.textContent).toContain("09:10");
    expect(screen.queryByRole("button", { name: "Snooze" })).toBeNull();
    reachSuggestion();

    fireEvent.click(screen.getByRole("button", { name: "Snooze" }));
    const decision = screen.getByRole("region", { name: /decision/i });
    expect(within(decision).getByText("09:50", { selector: "strong" })).toBeDefined();
    expect(within(decision).getByText(/after snooze/i, { selector: ".timing-lab__result-label" })).toBeDefined();
    expect(within(decision).getByRole("heading", { name: "NEXT MOVE WINDOW" })).toBeDefined();
    expect(screen.getByText(/moment explored/i).parentElement?.textContent).toContain("09:30");
    expect(screen.queryByRole("button", { name: "Snooze" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /reset workday/i }));
    expect(screen.getByRole("heading", { name: "WAIT" })).toBeDefined();
    expect(screen.queryByText(/after snooze/i)).toBeNull();
  });

  it("resets both the waiting state and an unanswered suggestion without refreshing", () => {
    render(<TimingLab />);
    fireEvent.click(screen.getByRole("button", { name: /reset workday/i }));
    expect(screen.getByRole("heading", { name: "WAIT" })).toBeDefined();
    reachSuggestion();
    fireEvent.click(screen.getByRole("button", { name: /reset workday/i }));
    expect(screen.getByRole("heading", { name: "WAIT" })).toBeDefined();
    expect(screen.getByText(/moment explored/i).parentElement?.textContent).toContain("09:10");
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
  });

  it.each([
    ["Accept", "11:00"],
    ["Dismiss", "10:30"],
  ])("returns the distinct %s branch and allows replay", (choice, time) => {
    render(<TimingLab />);
    reachSuggestion();
    fireEvent.click(screen.getByRole("button", { name: choice }));
    const decision = screen.getByRole("region", { name: /decision/i });
    expect(within(decision).getByText(time, { selector: "strong" })).toBeDefined();
    expect(within(decision).getByText(new RegExp(`after ${choice.toLowerCase()}`, "i"), { selector: ".timing-lab__result-label" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /reset workday/i }));
    reachSuggestion();
  });
});
