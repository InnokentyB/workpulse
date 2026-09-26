import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FeedbackPage from "@/app/feedback/page";

describe("FeedbackPage", () => {
  it("explains the beta learning goal and exposes an explicit GitHub path", () => {
    render(<FeedbackPage />);

    expect(
      screen.getByRole("heading", { name: /make the next interruption worth it/i }),
    ).toBeDefined();
    expect(screen.getByText(/nothing typed here is sent or saved/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /open a github issue/i })).toHaveProperty(
      "hostname",
      "github.com",
    );
  });
});
