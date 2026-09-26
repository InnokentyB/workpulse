import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "@/app/error";

describe("ErrorPage", () => {
  it("offers retry and a feedback path", () => {
    const reset = vi.fn();
    render(<ErrorPage reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: /report the problem/i })).toHaveProperty(
      "pathname",
      "/feedback",
    );
  });
});
