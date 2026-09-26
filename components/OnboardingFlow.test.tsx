import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OnboardingFlow } from "@/components/OnboardingFlow";

describe("OnboardingFlow", () => {
  it("collects the four documented answers and completes setup", () => {
    const onComplete = vi.fn();
    render(<OnboardingFlow onComplete={onComplete} onSkip={vi.fn()} />);

    fireEvent.click(screen.getByRole("radio", { name: /in an office/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("radio", { name: /people are nearby/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("radio", { name: /around the room/i }));
    fireEvent.click(
      screen.getByRole("checkbox", { name: /window with a distant view/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /^walking$/i }));
    fireEvent.click(
      screen.getByRole("checkbox", { name: /movement at my desk/i }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: /don’t suggest jumping/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /save my setup/i }));

    expect(onComplete).toHaveBeenCalledWith({
      workplace: "office",
      visibility: "people-nearby",
      breakSpace: "room",
      hasDistantView: true,
      preferredFormats: ["walk", "desk"],
      avoidJumpsOrFloor: true,
    });
  });

  it("keeps setup optional and limits format choices to two", () => {
    const onSkip = vi.fn();
    render(<OnboardingFlow onComplete={vi.fn()} onSkip={onSkip} />);

    fireEvent.click(screen.getByRole("button", { name: /skip for now/i }));
    expect(onSkip).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /^walking$/i }));
    fireEvent.click(
      screen.getByRole("checkbox", { name: /gentle stretch or yoga/i }),
    );

    expect(screen.getByRole("checkbox", { name: /^dance$/i })).toHaveProperty(
      "disabled",
      true,
    );
  });
});
