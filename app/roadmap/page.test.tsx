import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RoadmapPage from "@/app/roadmap/page";

describe("RoadmapPage", () => {
  it("separates the proposed next slice from tentative and exploratory work", () => {
    render(<RoadmapPage />);

    expect(
      screen.getByRole("heading", {
        name: /from one good decision to a calmer working day/i,
      }),
    ).toBeDefined();
    expect(screen.getByText("Proposed next", { exact: true })).toBeDefined();
    expect(screen.getByText("Tentative", { exact: true })).toBeDefined();
    expect(screen.getByText(/exploratory, not committed/i)).toBeDefined();
  });

  it("lists the product-vision features and links back to the demo", () => {
    render(<RoadmapPage />);

    expect(screen.getByText("Workday boundaries")).toBeDefined();
    expect(screen.getByText("Meal and long-break windows")).toBeDefined();
    expect(screen.getByText("A practical starter library")).toBeDefined();
    expect(screen.getByRole("link", { name: /return to live demo/i })).toHaveProperty(
      "pathname",
      "/",
    );
  });
});
