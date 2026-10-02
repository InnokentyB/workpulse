import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MovementGame } from "./MovementGame";

const mediaPipe = vi.hoisted(() => ({ detect: vi.fn(), close: vi.fn(), create: vi.fn() }));
vi.mock("@mediapipe/tasks-vision", () => ({
  FilesetResolver: { forVisionTasks: vi.fn(async () => ({})) },
  PoseLandmarker: { createFromOptions: mediaPipe.create },
}));

const originalDevices = navigator.mediaDevices;
let frames: Map<number, FrameRequestCallback>;
let sequence: number;
let timestamp: number;
const stop = vi.fn();

function pose(lifted = false) {
  const landmarks = Array.from({ length: 33 }, () => ({ x: .5, y: .2, visibility: 1 }));
  landmarks[11] = { x: .3, y: lifted ? .44 : .5, visibility: 1 };
  landmarks[12] = { x: .7, y: lifted ? .44 : .5, visibility: 1 };
  return landmarks;
}

function frame(landmarks = pose()) {
  mediaPipe.detect.mockReturnValue({ landmarks: [landmarks] });
  const entry = frames.entries().next().value as [number, FrameRequestCallback] | undefined;
  if (!entry) throw new Error("Camera scheduled no inference frame");
  frames.delete(entry[0]);
  timestamp += 200;
  act(() => entry[1](timestamp));
}

beforeEach(() => {
  frames = new Map(); sequence = 0; timestamp = 0;
  vi.clearAllMocks();
  mediaPipe.create.mockResolvedValue({ detectForVideo: mediaPipe.detect, close: mediaPipe.close });
  Object.defineProperty(navigator, "mediaDevices", { configurable: true,
    value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop }] })) } });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++sequence, callback); return sequence; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(2);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(() => {
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: originalDevices });
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});

describe("movement game real camera integration", () => {
  it("preserves two recognized cycles through inference failure and retry without duplicate evidence", async () => {
    render(<MovementGame />);
    const progress = () => within(screen.getByRole("region", { name: "Movement game controls" })).getByText(/\d \/ 6/, { selector: "strong" }).textContent;
    fireEvent.click(screen.getByLabelText("Camera recognition"));
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await screen.findByText("Camera active");
    for (let i = 0; i < 8; i++) frame();
    for (let i = 0; i < 2; i++) { frame(pose(true)); frame(); }
    mediaPipe.detect.mockImplementationOnce(() => { throw new Error("Inference failed"); });
    frame();
    expect(progress()).toBe("2 / 6");
    expect(stop).toHaveBeenCalledOnce();
    expect(mediaPipe.close).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
    expect(screen.getByRole("button", { name: /start new manual run from zero/i })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Try camera again" }));
    await screen.findByText("Camera active");
    for (let i = 0; i < 8; i++) frame();
    expect(progress()).toBe("2 / 6");
    frame(pose(true)); frame(); frame();
    expect(progress()).toBe("3 / 6");
    expect(screen.queryByRole("heading", { name: "Scene complete" })).toBeNull();
  });

  it("retains two cycles across pause, recalibrates, discards a half-cycle, and completes once at six", async () => {
    render(<MovementGame />);
    const progress = () => within(screen.getByRole("region", { name: "Movement game controls" })).getByText(/\d \/ 6/, { selector: "strong" }).textContent;
    fireEvent.click(screen.getByLabelText("Camera recognition"));
    fireEvent.click(screen.getByRole("button", { name: "Start movement game" }));
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await screen.findByText("Camera active");
    for (let i = 0; i < 8; i++) frame();
    for (let i = 0; i < 2; i++) { frame(pose(true)); frame(); }
    expect(progress()).toBe("2 / 6");
    frame(pose(true)); // Leave a half-cycle in the old tracker.
    fireEvent.click(screen.getByRole("button", { name: "Pause game" }));
    expect(stop).toHaveBeenCalledOnce();
    expect(mediaPipe.close).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
    expect(progress()).toBe("2 / 6");
    fireEvent.click(screen.getByRole("button", { name: "Resume game" }));
    expect(screen.getByRole("button", { name: "Enable camera" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await screen.findByText("Camera active");
    for (let i = 0; i < 8; i++) frame();
    frame(); // The neutral return cannot complete the discarded half-cycle.
    expect(progress()).toBe("2 / 6");
    for (let i = 0; i < 4; i++) { frame(pose(true)); frame(); }
    expect(progress()).toBe("6 / 6");
    expect(screen.getAllByRole("heading", { name: "Scene complete" })).toHaveLength(1);
    expect(screen.getByText(/six lift-and-return cycles recognized on this device/i)).toBeDefined();
    expect(screen.queryByText("Camera active")).toBeNull();
    expect(stop).toHaveBeenCalledTimes(2);
    expect(mediaPipe.close).toHaveBeenCalledTimes(2);
    expect(frames.size).toBe(0);
  });
});
