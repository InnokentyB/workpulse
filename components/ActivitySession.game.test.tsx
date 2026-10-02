import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ActivitySession } from "./ActivitySession";
import { selectActivity } from "@/lib/activity-selector";

const mediaPipe = vi.hoisted(() => ({ detect: vi.fn(), close: vi.fn(), create: vi.fn(), resolve: vi.fn() }));
vi.mock("@mediapipe/tasks-vision", () => ({
  FilesetResolver: { forVisionTasks: mediaPipe.resolve },
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
  mediaPipe.resolve.mockResolvedValue({});
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

describe("game camera bridge", () => {
  it.each([
    ["missing device", "NotFoundError", false],
    ["busy device", "NotReadableError", false],
    ["missing browser API", "api", false],
    ["video playback", "play", true],
    ["WASM loading", "wasm", true],
    ["model loading", "model", true],
  ] as const)("handles %s failure without progress and permits retry", async (_name, reason, acquiredStream) => {
    if (reason === "api") {
      Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: undefined });
    } else if (reason === "play") {
      vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error("Playback failed"));
    } else if (reason === "wasm") {
      mediaPipe.resolve.mockRejectedValueOnce(new Error("WASM failed"));
    } else if (reason === "model") {
      mediaPipe.create.mockRejectedValueOnce(new Error("Model failed"));
    } else {
      vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(new DOMException("Unavailable", reason));
    }
    const progress = vi.fn();
    const failure = vi.fn();
    render(<ActivitySession activity={selectActivity("shoulder-rolls")}
      gameMode onProgress={progress} onCameraFailure={failure} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await screen.findByRole("alert");
    expect(failure).toHaveBeenCalledOnce();
    expect(progress).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalledTimes(acquiredStream ? 1 : 0);
    expect(mediaPipe.close).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
    if (reason === "api") {
      Object.defineProperty(navigator, "mediaDevices", { configurable: true,
        value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop }] })) } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Try camera again" }));
    await screen.findByText("Camera active");
    expect(progress).not.toHaveBeenCalled();
  });

  it("releases a model that finishes loading after cancellation and permits a fresh retry", async () => {
    let resolveModel!: (model: unknown) => void;
    mediaPipe.create.mockImplementationOnce(() => new Promise((resolve) => { resolveModel = resolve; }));
    const failure = vi.fn();
    render(<ActivitySession activity={selectActivity("shoulder-rolls")}
      gameMode onProgress={vi.fn()} onCameraFailure={failure} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await waitFor(() => expect(mediaPipe.create).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(stop).toHaveBeenCalledOnce();
    await act(async () => resolveModel({ detectForVideo: mediaPipe.detect, close: mediaPipe.close }));
    expect(mediaPipe.close).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
    expect(failure).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await screen.findByText("Camera active");
    expect(mediaPipe.create).toHaveBeenCalledTimes(2);
  });

  it("recovers from denied permission without granting any movement evidence", async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(new DOMException("Denied", "NotAllowedError"));
    const progress = vi.fn();
    const failure = vi.fn();
    render(<ActivitySession activity={selectActivity("shoulder-rolls")}
      gameMode onProgress={progress} onCameraFailure={failure} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await screen.findByText(/Camera permission was declined/);
    expect(failure).toHaveBeenCalledOnce();
    expect(progress).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Try camera again" }));
    await screen.findByText("Camera active");
    expect(progress).not.toHaveBeenCalled();
  });

  it("discards a half-cycle when stopped and recalibrates before resumed recognition", async () => {
    const progress = vi.fn();
    render(<ActivitySession activity={selectActivity("shoulder-rolls")}
      gameMode progressCount={2} onProgress={progress} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await screen.findByText("Camera active");
    for (let i = 0; i < 8; i++) frame();
    frame(pose(true));
    fireEvent.click(screen.getByRole("button", { name: "Stop camera" }));
    expect(frames.size).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await screen.findByText("Camera active");
    for (let i = 0; i < 8; i++) frame();
    expect(progress).not.toHaveBeenCalled();
    frame(pose(true)); frame();
    expect(progress).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("reports an inference failure and releases camera resources for manual fallback", async () => {
    const failure = vi.fn();
    render(<ActivitySession activity={selectActivity("shoulder-rolls")}
      gameMode onProgress={vi.fn()} onCameraFailure={failure} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await screen.findByText("Camera active");
    mediaPipe.detect.mockImplementationOnce(() => { throw new Error("Inference failed"); });
    frame();
    expect(failure).toHaveBeenCalledOnce();
    expect(stop).toHaveBeenCalledOnce();
    expect(mediaPipe.close).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });

  it("sends only complete shoulder cycles to the game and stops resources on pause/unmount", async () => {
    const progress = vi.fn();
    const complete = vi.fn();
    const { unmount } = render(<ActivitySession activity={selectActivity("shoulder-rolls")}
      gameMode progressCount={0} onProgress={progress} onComplete={complete} />);
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    await screen.findByText("Camera active");
    for (let i = 0; i < 8; i++) frame();
    frame(pose(true)); frame(pose(true));
    expect(progress).not.toHaveBeenCalled();
    frame();
    expect(progress).toHaveBeenCalledExactlyOnceWith(1);
    frame(); frame();
    expect(progress).toHaveBeenCalledTimes(1);
    expect(complete).not.toHaveBeenCalled();
    unmount();
    expect(stop).toHaveBeenCalledOnce();
    expect(mediaPipe.close).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });

  it("does not start a camera after an in-flight permission request was cancelled", async () => {
    let resolveStream!: (stream: MediaStream) => void;
    const pending = new Promise<MediaStream>((resolve) => { resolveStream = resolve; });
    vi.mocked(navigator.mediaDevices.getUserMedia).mockReturnValue(pending);
    const { unmount } = render(<ActivitySession activity={selectActivity("shoulder-rolls")}
      gameMode onProgress={vi.fn()} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Enable camera" }));
    unmount();
    await act(async () => resolveStream({ getTracks: () => [{ stop }] } as unknown as MediaStream));
    await waitFor(() => expect(stop).toHaveBeenCalledOnce());
    expect(mediaPipe.create).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });
});
