import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeedbackWorksheet } from "@/components/FeedbackWorksheet";

describe("FeedbackWorksheet", () => {
  it("builds a reviewable issue draft from the beta questions", () => {
    render(<FeedbackWorksheet />);

    fireEvent.change(screen.getByLabelText(/what were you trying to do/i), {
      target: { value: "Fit movement between meetings" },
    });
    fireEvent.change(
      screen.getByLabelText(/did the suggestion arrive at a useful moment/i),
      { target: { value: "Yes" } },
    );

    const draft = screen.getByLabelText(/github issue draft/i) as HTMLTextAreaElement;
    expect(draft.value).toContain("Fit movement between meetings");
    expect(draft.value).toContain("## Did the suggestion arrive");
    expect(draft.value).toContain("Yes");
  });

  it("never places the user answers in the outbound GitHub URL", () => {
    render(<FeedbackWorksheet />);

    fireEvent.change(screen.getByLabelText(/what were you trying to do/i), {
      target: { value: "private draft words" },
    });

    const link = screen.getByRole("link", { name: /open a github issue/i });
    expect(link.getAttribute("href")).toBe(
      "https://github.com/InnokentyB/workpulse/issues/new",
    );
    expect(link.getAttribute("href")).not.toContain("private");
  });
});
