import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DanceSession } from "./DanceSession";

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function phrase() {
  fireEvent.click(screen.getByRole("button", { name: "Start phrase" }));
  act(() => vi.advanceTimersByTime(6000));
}

describe("Desk dance", () => {
  it("requires eight beats and explicit confirmation, never timer-only completion", () => {
    const progress = vi.fn();
    render(<DanceSession gameMode onProgress={progress} onComplete={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "I followed this phrase" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Start phrase" }));
    act(() => vi.advanceTimersByTime(5250));
    expect(screen.queryByRole("button", { name: "I followed this phrase" })).toBeNull();
    act(() => vi.advanceTimersByTime(750));
    expect(progress).not.toHaveBeenCalled();
    const confirm = screen.getByRole("button", { name: "I followed this phrase" });
    fireEvent.click(confirm); fireEvent.click(confirm);
    expect(progress).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("pauses and repeats an unfinished phrase without awarding progress", () => {
    const progress = vi.fn();
    render(<DanceSession gameMode onProgress={progress} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Start phrase" }));
    act(() => vi.advanceTimersByTime(2250));
    fireEvent.click(screen.getByRole("button", { name: "Pause phrase" }));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByLabelText("Beat 0 of 8")).toBeDefined();
    expect(screen.queryByRole("button", { name: "I followed this phrase" })).toBeNull();
    phrase();
    fireEvent.click(screen.getByRole("button", { name: "Repeat phrase" }));
    act(() => vi.advanceTimersByTime(6000));
    expect(progress).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "I followed this phrase" }));
    expect(progress).toHaveBeenCalledOnce();
  });

  it("offers seated and standing instructions and completes six guided unverified phrases", () => {
    const complete = vi.fn();
    render(<DanceSession onComplete={complete} />);
    expect(screen.getByText(/Stay seated. Tap your left heel/)).toBeDefined();
    fireEvent.click(screen.getByLabelText("Standing dance"));
    expect(screen.getByText(/Step left and bring your right foot/)).toBeDefined();
    for (let i = 0; i < 6; i++) {
      phrase();
      expect(screen.getByLabelText("Standing dance").closest("fieldset")).toHaveProperty("disabled", true);
      fireEvent.click(screen.getByRole("button", { name: "I followed this phrase" }));
    }
    expect(complete).toHaveBeenCalledExactlyOnceWith({ mode: "guided", movements: 6, verified: false });
  });

  it("pauses when the page is hidden and removes timers on navigation", () => {
    const progress = vi.fn();
    const { unmount } = render(<DanceSession gameMode onProgress={progress} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Start phrase" }));
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    fireEvent(document, new Event("visibilitychange"));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByLabelText("Beat 0 of 8")).toBeDefined();
    expect(progress).not.toHaveBeenCalled();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("falls back to visual beats if audio is unavailable", async () => {
    vi.stubGlobal("AudioContext", undefined);
    render(<DanceSession onComplete={vi.fn()} />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Sound on" })));
    expect(screen.getByText(/Sound is unavailable/)).toBeDefined();
    phrase();
    expect(screen.getByRole("button", { name: "I followed this phrase" })).toBeDefined();
  });

  it("starts audio only by opt-in and closes it on pause and unmount", async () => {
    const close = vi.fn(async () => undefined);
    const start = vi.fn();
    const create = vi.fn();
    class Audio {
      currentTime = 0;
      destination = {};
      close = close;
      resume = vi.fn(async () => undefined);
      constructor() { create(); }
      createOscillator() { return { frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn(), start, stop: vi.fn(), onended: null }; }
      createGain() { return { gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() }; }
    }
    vi.stubGlobal("AudioContext", Audio);
    const { unmount } = render(<DanceSession onComplete={vi.fn()} />);
    expect(create).not.toHaveBeenCalled();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Sound on" })));
    fireEvent.click(screen.getByRole("button", { name: "Start phrase" }));
    act(() => vi.advanceTimersByTime(750));
    expect(start).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Pause phrase" }));
    expect(close).toHaveBeenCalledOnce();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Sound on" })));
    unmount();
    expect(close).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
});
