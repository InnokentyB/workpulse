import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TermsPage from "@/app/terms/page";

describe("TermsPage", () => {
  it("states the beta, medical, safety, and outcome boundaries", () => {
    render(<TermsPage />);

    expect(screen.getByText(/early workplace-wellbeing product/i)).toBeDefined();
    expect(screen.getByText(/not a medical device or healthcare service/i)).toBeDefined();
    expect(screen.getByText(/stop immediately if you feel pain/i)).toBeDefined();
    expect(screen.getByText(/does not promise health, productivity/i)).toBeDefined();
  });

  it("links back to the privacy notice", () => {
    render(<TermsPage />);

    expect(screen.getByRole("link", { name: /read privacy notice/i })).toHaveProperty(
      "pathname",
      "/privacy",
    );
  });
});
