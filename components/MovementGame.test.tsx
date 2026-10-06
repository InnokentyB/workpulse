import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let cameraProgress: ((amount: number) => void) | undefined;
let cameraFailure: (() => void) | undefined;
vi.mock("@/components/ActivitySession", () => ({
  ActivitySession: ({ onProgress, onCameraFailure }: { onProgress: (amount: number) => void; onCameraFailure: () => void }) => {
    cameraProgress = onProgress;
    cameraFailure = onCameraFailure;
    return <div role="region" aria-label="Camera guide"><button type="button" onClick={() => onProgress(1)}>Recognize cycle</button><button type="button" onClick={onCameraFailure}>Simulate camera failure</button></div>;
  },
}));

import { MovementGame } from "@/components/MovementGame";

beforeEach(() => { cameraProgress = undefined; cameraFailure = undefined; });
function expectProgress(value: number) {
  expect(within(screen.getByRole("region", { name: "Movement game controls" })).getByText(`${value} / 6`, { selector: "strong" })).toBeDefined();
}

describe("MovementGame", () => {
  it.each(["Forest trail", "Workshop"])("plays a seated dance in %s without camera claims", (world) => {
    vi.useFakeTimers();
    try {
      render(<MovementGame />);
      fireEvent.click(screen.getByLabelText("Camera recognition"));
      fireEvent.click(screen.getByLabelText("Desk dance"));
      expect(screen.getByLabelText("Camera recognition")).toHaveProperty("disabled", true);
      expect(screen.getByLabelText("Manual self-report")).toHaveProperty("checked", true);
      fireEvent.click(screen.getByLabelText(world));
      fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
      expect(screen.queryByRole("button", { name: /I completed a movement/ })).toBeNull();
      expect(screen.queryByRole("region", { name: "Camera guide" })).toBeNull();
      for (let i = 0; i < 6; i++) {
        fireEvent.click(screen.getByRole("button", { name: "Start phrase" }));
        act(() => vi.advanceTimersByTime(6000));
        fireEvent.click(screen.getByRole("button", { name: "I followed this phrase" }));
      }
      expectProgress(6);
      expect(screen.getByRole("heading", { name: "Scene complete" })).toBeDefined();
      expect(screen.getByText(/Six dance phrases self-reported/)).toBeDefined();
    } finally { vi.useRealTimers(); }
  });
  it.each(["Forest trail", "Workshop"])("plays all four neck movements in %s and locks the exercise until reset", (world) => {
    render(<MovementGame />);
    fireEvent.click(screen.getByLabelText(world));
    fireEvent.click(screen.getByLabelText(/Neck reset/));
    const controls = screen.getByRole("region", { name: "Movement game controls" });
    expect(within(controls).getByText("0 / 4", { selector: "strong" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    expect(screen.getByLabelText(/Neck reset/).closest("fieldset")).toHaveProperty("disabled", true);
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button", { name: /I completed a movement/ }));
    expect(screen.queryByRole("heading", { name: "Scene complete" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /I completed a movement/ }));
    expect(screen.getByRole("heading", { name: "Scene complete" })).toBeDefined();
    expect(within(controls).getByText("4 / 4", { selector: "strong" })).toBeDefined();
    expect(screen.getByText(/Four movements self-reported/)).toBeDefined();
    expect(screen.getByRole("img", { name: /(?:stop 4 of 4|4 of 4 steps.*Lantern glowing)/ })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "New run" }));
    fireEvent.click(screen.getByLabelText(/Shoulder rolls/));
    expectProgress(0);
  });

  it("previews both distinct scenes before starting while progress stays at zero", () => {
    render(<MovementGame />);
    expect(screen.getByRole("img", { name: /Summit trail.*stop 0 of 6/i })).toBeDefined();
    expectProgress(0);
    fireEvent.click(screen.getByLabelText("Workshop"));
    expect(screen.getByRole("img", { name: /Lantern workshop.*0 of 6 steps.*Empty workbench/i })).toBeDefined();
    expect(screen.queryByRole("img", { name: /Summit trail/i })).toBeNull();
    expectProgress(0);
    fireEvent.click(screen.getByLabelText("Forest trail"));
    expect(screen.getByRole("img", { name: /Summit trail.*stop 0 of 6/i })).toBeDefined();
    expect(screen.queryByRole("img", { name: /Lantern workshop/i })).toBeNull();
    expectProgress(0);
  });

  it("clamps batched camera evidence at six and rejects a callback after a new run", () => {
    render(<MovementGame />);
    fireEvent.click(screen.getByLabelText("Camera recognition"));
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    const callback = cameraProgress;
    act(() => callback?.(4));
    expectProgress(4);
    act(() => { callback?.(5); callback?.(1); });
    expectProgress(6);
    expect(screen.getAllByRole("heading", { name: "Scene complete" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "New run" }));
    act(() => callback?.(1));
    expectProgress(0);
    expect(screen.queryByRole("heading", { name: "Scene complete" })).toBeNull();
    expect(screen.getByRole("button", { name: "Start movement game" })).toBeDefined();
  });

  it("ignores failures from the previous camera generation after reset", () => {
    render(<MovementGame />);
    fireEvent.click(screen.getByLabelText("Camera recognition"));
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    const staleFailure = cameraFailure;
    fireEvent.click(screen.getByRole("button", { name: "Reset game" }));
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    fireEvent.click(screen.getByRole("button", { name: "Recognize cycle" }));
    fireEvent.click(screen.getByRole("button", { name: "Recognize cycle" }));
    fireEvent.click(screen.getByRole("button", { name: "Recognize cycle" }));
    act(() => staleFailure?.());
    expect(screen.queryByRole("button", { name: /start new manual run from zero/i })).toBeNull();
    expectProgress(3);
  });
  it("completes exactly once with six bounded manual self-reports and starts a new run", () => {
    render(<MovementGame />);
    fireEvent.click(screen.getByLabelText("Workshop"));
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    const manual = screen.getByRole("button", { name: /I completed a movement/i });
    for (let index = 0; index < 7; index++) fireEvent.click(manual);
    expect(screen.getByRole("heading", { name: "Scene complete" })).toBeDefined();
    expect(screen.getByText(/six movements self-reported.*not camera verified/i)).toBeDefined();
    expectProgress(6);
    fireEvent.click(screen.getByRole("button", { name: "New run" }));
    expectProgress(0);
    expect(screen.getByRole("button", { name: "Start movement game" })).toBeDefined();
  });

  it("keeps recognized progress while paused and drops stale camera callbacks", () => {
    render(<MovementGame />);
    fireEvent.click(screen.getByLabelText("Camera recognition"));
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    fireEvent.click(screen.getByRole("button", { name: "Recognize cycle" }));
    cameraProgress?.(Number.NaN);
    cameraProgress?.(0.5);
    expectProgress(1);
    const previousRunCallback = cameraProgress;
    fireEvent.click(screen.getByRole("button", { name: "Pause game" }));
    expect(screen.queryByRole("region", { name: "Camera guide" })).toBeNull();
    previousRunCallback?.(2);
    expectProgress(1);
    fireEvent.click(screen.getByRole("button", { name: "Resume game" }));
    for (let index = 0; index < 5; index++) fireEvent.click(screen.getByRole("button", { name: "Recognize cycle" }));
    expect(screen.getByText(/six lift-and-return cycles recognized on this device/i)).toBeDefined();
    expectProgress(6);
    expect(screen.queryByRole("button", { name: /I completed a movement/i })).toBeNull();
  });

  it("never asks for a camera in a manual run and resets mid-run", () => {
    const getUserMedia = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
    render(<MovementGame />);
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    fireEvent.click(screen.getByRole("button", { name: /I completed a movement/i }));
    fireEvent.click(screen.getByRole("button", { name: "Reset game" }));
    expectProgress(0);
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("pauses at two manual movements, resumes at three, and locks choices until reset", () => {
    render(<MovementGame />);
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    expect(screen.getByLabelText("Workshop").closest("fieldset")).toHaveProperty("disabled", true);
    expect(screen.getByLabelText("Camera recognition").closest("fieldset")).toHaveProperty("disabled", true);
    for (let index = 0; index < 2; index++) fireEvent.click(screen.getByRole("button", { name: /I completed a movement/i }));
    fireEvent.click(screen.getByRole("button", { name: "Pause game" }));
    expectProgress(2);
    expect(screen.queryByRole("button", { name: /I completed a movement/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Resume game" }));
    fireEvent.click(screen.getByRole("button", { name: /I completed a movement/i }));
    expectProgress(3);
    fireEvent.click(screen.getByRole("button", { name: "Reset game" }));
    expect(screen.getByLabelText("Workshop").closest("fieldset")).toHaveProperty("disabled", false);
    expect(screen.getByLabelText("Camera recognition").closest("fieldset")).toHaveProperty("disabled", false);
  });

  it("ignores a late camera callback after terminal completion", () => {
    render(<MovementGame />);
    fireEvent.click(screen.getByLabelText("Camera recognition"));
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    const oldCallback = cameraProgress;
    for (let index = 0; index < 6; index++) fireEvent.click(screen.getByRole("button", { name: "Recognize cycle" }));
    oldCallback?.(1);
    expectProgress(6);
    expect(screen.getAllByRole("heading", { name: "Scene complete" })).toHaveLength(1);
  });

  it("offers a fresh unverified manual session when camera fails", () => {
    render(<MovementGame />);
    fireEvent.click(screen.getByLabelText("Camera recognition"));
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    fireEvent.click(screen.getByRole("button", { name: "Recognize cycle" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate camera failure" }));
    fireEvent.click(screen.getByRole("button", { name: /start new manual run from zero/i }));
    expectProgress(0);
    expect(screen.queryByRole("region", { name: "Camera guide" })).toBeNull();
    expect(screen.getByRole("button", { name: /I completed a movement/i })).toBeDefined();
  });
});
