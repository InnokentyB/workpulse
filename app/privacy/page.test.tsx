import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacyPage from "@/app/privacy/page";

describe("PrivacyPage", () => {
  it("describes local storage, camera processing, and calendar status", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: /movement data stays close/i })).toBeDefined();
    expect(screen.getByText(/stay in this browser’s local storage/i)).toBeDefined();
    expect(screen.getByText(/does not record, save, or upload/i)).toBeDefined();
    expect(
      screen.getByText(/connection infrastructure is prepared but remains disabled/i),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: /delete all local data/i })).toBeDefined();
  });

  it("links to terms and the live demo", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("link", { name: /read terms/i })).toHaveProperty(
      "pathname",
      "/terms",
    );
    expect(screen.getByRole("link", { name: /live demo/i })).toHaveProperty(
      "pathname",
      "/",
    );
  });
});
