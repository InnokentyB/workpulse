import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { LocalDataControls } from "@/components/LocalDataControls";

describe("LocalDataControls", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("requires confirmation before deleting WorkPulse data", () => {
    window.localStorage.setItem("workpulse.activity-history", "history");

    render(<LocalDataControls />);
    fireEvent.click(
      screen.getByRole("button", { name: /delete all local data/i }),
    );

    expect(window.localStorage.getItem("workpulse.activity-history")).toBe(
      "history",
    );
    expect(
      screen.getByRole("button", { name: /yes, delete it/i }),
    ).toBeDefined();
  });

  it("deletes WorkPulse data but leaves unrelated browser data intact", () => {
    window.localStorage.setItem("workpulse.activity-history", "history");
    window.localStorage.setItem("workpulse.future-setting", "setting");
    window.localStorage.setItem("unrelated.preference", "keep");

    render(<LocalDataControls />);
    fireEvent.click(
      screen.getByRole("button", { name: /delete all local data/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /yes, delete it/i }));

    expect(screen.getByText(/local data deleted/i)).toBeDefined();
    expect(window.localStorage.getItem("workpulse.activity-history")).toBeNull();
    expect(window.localStorage.getItem("workpulse.future-setting")).toBeNull();
    expect(window.localStorage.getItem("unrelated.preference")).toBe("keep");
  });

  it("allows the user to cancel without deleting anything", () => {
    window.localStorage.setItem("workpulse.activity-history", "history");

    render(<LocalDataControls />);
    fireEvent.click(
      screen.getByRole("button", { name: /delete all local data/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /keep my data/i }));

    expect(window.localStorage.getItem("workpulse.activity-history")).toBe(
      "history",
    );
    expect(
      screen.getByRole("button", { name: /delete all local data/i }),
    ).toBeDefined();
  });
});
