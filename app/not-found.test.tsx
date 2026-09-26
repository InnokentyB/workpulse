import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "@/app/not-found";

describe("NotFound", () => {
  it("offers recovery without implying local data was lost", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: /path is not part/i })).toBeDefined();
    expect(screen.getByText(/local activity data has not been affected/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /return to workpulse/i })).toHaveProperty(
      "pathname",
      "/",
    );
    expect(screen.getByRole("link", { name: /report a broken link/i })).toHaveProperty(
      "pathname",
      "/feedback",
    );
  });
});
