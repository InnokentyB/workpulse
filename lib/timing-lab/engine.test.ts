import { describe, expect, it } from "vitest";
import { SAMPLE_DAY } from "../../data/timing-lab/sample-day";
import { formatMinute, getDecisionAt, getInitialDecision, getNextDecision } from "./engine";
import type { Workday } from "./engine";

describe("timing lab workday", () => {
  it("waits during a meeting, then offers the first suitable open window", () => {
    expect(getInitialDecision(SAMPLE_DAY)).toMatchObject({
      kind: "WAIT", minute: 570, reasonCode: "BLOCKED_MEETING",
    });
    expect(getDecisionAt(SAMPLE_DAY, 569)).toMatchObject({ kind: "WAIT", minute: 570 });
    expect(getDecisionAt(SAMPLE_DAY, 570)).toMatchObject({ kind: "MOVE_NOW", minute: 570 });
  });

  it("makes three responses produce different, explained next times", () => {
    const results = (["accept", "snooze", "dismiss"] as const)
      .map((response) => getNextDecision(SAMPLE_DAY, response, SAMPLE_DAY.suggestionMinute));
    expect(results.map((result) => result.minute)).toEqual([660, 590, 630]);
    expect(results.map((result) => result.reasonCode)).toEqual([
      "AFTER_ACCEPT", "AFTER_SNOOZE", "AFTER_DISMISS",
    ]);
    for (const result of results) {
      expect(result.kind).toBe("MOVE_NOW");
      expect(result.reason).toContain(formatMinute(result.minute!));
      expect(getDecisionAt(SAMPLE_DAY, result.minute!).kind).toBe("MOVE_NOW");
    }
  });

  it("moves snooze past a blocked interval instead of recommending inside it", () => {
    const result = getNextDecision(SAMPLE_DAY, "snooze", 9 * 60 + 50);
    expect(result.minute).toBe(10 * 60 + 30);
    expect(result.reason).toContain("Focus block");
  });

  it("treats a too-short free gap as WAIT and permits an exact-length window", () => {
    expect(getDecisionAt(SAMPLE_DAY, 10 * 60 + 42)).toMatchObject({
      kind: "WAIT", minute: 660, reasonCode: "WINDOW_TOO_SHORT",
    });
    expect(getDecisionAt(SAMPLE_DAY, 16 * 60 + 40)).toMatchObject({
      kind: "MOVE_NOW", minute: 1000,
    });
  });

  it("returns end of day when a response leaves no suitable window", () => {
    expect(getDecisionAt(SAMPLE_DAY, 16 * 60 + 41)).toMatchObject({
      kind: "END_OF_DAY", minute: null,
    });
    for (const response of ["accept", "snooze", "dismiss"] as const) {
      const result = getNextDecision(SAMPLE_DAY, response, 16 * 60 + 40);
      expect(result).toMatchObject({ kind: "END_OF_DAY", minute: null });
      expect(result.reason).toContain("No suitable movement window remains today");
    }
  });

  it("rejects responses to blocked moments and malformed schedules", () => {
    expect(() => getNextDecision(SAMPLE_DAY, "accept", 550)).toThrow(RangeError);
    expect(() => getDecisionAt(SAMPLE_DAY, 1020)).toThrow(RangeError);
    const invalid: Workday = {
      ...SAMPLE_DAY,
      blocks: [...SAMPLE_DAY.blocks, {
        startMinute: 11 * 60 + 40, endMinute: 11 * 60 + 10,
        kind: "meeting", label: "Overlap",
      }],
    };
    expect(() => getInitialDecision(invalid)).toThrow(/Invalid workday blocks/);
  });

  it("normalizes overlapping and adjacent blocked intervals", () => {
    const day: Workday = {
      startMinute: 540, endMinute: 600, suggestionMinute: 550, minimumWindowMinutes: 5,
      blocks: [
        { startMinute: 560, endMinute: 570, kind: "focus", label: "Focus" },
        { startMinute: 550, endMinute: 560, kind: "meeting", label: "Meeting" },
        { startMinute: 565, endMinute: 580, kind: "meeting", label: "Follow-up" },
      ],
    };
    expect(getDecisionAt(day, 550)).toMatchObject({ kind: "WAIT", minute: 580 });
  });

  it("does not mutate scenario blocks when inspecting an unsorted schedule", () => {
    const blocks = [...SAMPLE_DAY.blocks].reverse();
    const day = { ...SAMPLE_DAY, blocks };
    getInitialDecision(day);
    expect(blocks[0].label).toBe("Wrap-up meeting");
  });

  it("never offers an incomplete or blocked slot over every minute of the sample day", () => {
    for (let minute = SAMPLE_DAY.startMinute; minute < SAMPLE_DAY.endMinute; minute++) {
      const result = getDecisionAt(SAMPLE_DAY, minute);
      if (result.kind !== "MOVE_NOW") continue;
      expect(minute + SAMPLE_DAY.minimumWindowMinutes).toBeLessThanOrEqual(SAMPLE_DAY.endMinute);
      expect(SAMPLE_DAY.blocks.every((block) =>
        minute + SAMPLE_DAY.minimumWindowMinutes <= block.startMinute || minute >= block.endMinute,
      )).toBe(true);
    }
  });

  it("handles exact block boundaries and searches across consecutive blocks", () => {
    expect(getDecisionAt(SAMPLE_DAY, 600)).toMatchObject({ kind: "WAIT", minute: 630 });
    expect(getDecisionAt(SAMPLE_DAY, 629)).toMatchObject({ kind: "WAIT", minute: 630 });
    expect(getDecisionAt(SAMPLE_DAY, 630)).toMatchObject({ kind: "MOVE_NOW", minute: 630 });
    const consecutive: Workday = {
      startMinute: 540, endMinute: 600, suggestionMinute: 580, minimumWindowMinutes: 5,
      blocks: [
        { startMinute: 550, endMinute: 565, kind: "meeting", label: "First" },
        { startMinute: 565, endMinute: 580, kind: "focus", label: "Second" },
      ],
    };
    expect(getDecisionAt(consecutive, 550)).toMatchObject({ kind: "WAIT", minute: 580 });
  });

  it("respects workday bounds and rejects non-finite inputs", () => {
    const empty: Workday = {
      startMinute: 540, endMinute: 555, suggestionMinute: 540, minimumWindowMinutes: 5, blocks: [],
    };
    expect(getDecisionAt(empty, 540)).toMatchObject({ kind: "MOVE_NOW", minute: 540 });
    expect(getDecisionAt(empty, 550)).toMatchObject({ kind: "MOVE_NOW", minute: 550 });
    expect(getDecisionAt(empty, 551)).toMatchObject({ kind: "END_OF_DAY", minute: null });
    expect(() => getDecisionAt(empty, Number.NaN)).toThrow(RangeError);
    expect(() => getDecisionAt({ ...empty, endMinute: Number.POSITIVE_INFINITY }, 540)).toThrow(RangeError);
    expect(() => getDecisionAt({ ...empty, minimumWindowMinutes: 0 }, 540)).toThrow(RangeError);
    expect(() => getDecisionAt({ ...empty, blocks: [
      { startMinute: -1, endMinute: 550, kind: "focus", label: "Invalid" },
    ] }, 540)).toThrow(RangeError);
  });

  it("is deterministic and leaves source blocks untouched for every response", () => {
    const snapshot = JSON.stringify(SAMPLE_DAY);
    for (const response of ["accept", "snooze", "dismiss"] as const) {
      const first = getNextDecision(SAMPLE_DAY, response, SAMPLE_DAY.suggestionMinute);
      expect(getNextDecision(SAMPLE_DAY, response, SAMPLE_DAY.suggestionMinute)).toEqual(first);
      expect(first.minute).toBeGreaterThan(SAMPLE_DAY.suggestionMinute);
    }
    expect(JSON.stringify(SAMPLE_DAY)).toBe(snapshot);
  });

  it("delays an accepted break when its threshold coincides with a focus block", () => {
    // 09:50 + 90 minutes is exactly 11:20, the start of the focus block.
    const result = getNextDecision(SAMPLE_DAY, "accept", 590);
    expect(result).toMatchObject({ kind: "MOVE_NOW", minute: 700, reasonCode: "AFTER_ACCEPT" });
    expect(result.reason).toContain("Focus block blocks the earlier time");
    expect(result.reason).toContain("11:40");
  });

  it("skips a short gap after a snooze threshold and does not re-offer a dismissed window", () => {
    // 10:31 + 20 falls in the 10:45–11:00 meeting; it resumes at 11:00.
    expect(getNextDecision(SAMPLE_DAY, "snooze", 631)).toMatchObject({
      kind: "MOVE_NOW", minute: 660,
    });
    // Dismiss at the start of a 30-minute opening skips that entire opening.
    expect(getNextDecision(SAMPLE_DAY, "dismiss", 570)).toMatchObject({
      kind: "MOVE_NOW", minute: 630,
    });
  });

  it("normalizes a block crossing the day start and never suggests before the day", () => {
    const day: Workday = {
      startMinute: 540, endMinute: 600, suggestionMinute: 560, minimumWindowMinutes: 5,
      blocks: [{ startMinute: 520, endMinute: 560, kind: "meeting", label: "Morning meeting" }],
    };
    expect(getInitialDecision(day)).toMatchObject({ kind: "WAIT", minute: 560 });
    expect(getDecisionAt(day, 560)).toMatchObject({ kind: "MOVE_NOW", minute: 560 });
  });

  it("rejects a four-minute gap but accepts an exact five-minute gap", () => {
    const day: Workday = {
      startMinute: 540, endMinute: 600, suggestionMinute: 540, minimumWindowMinutes: 5,
      blocks: [
        { startMinute: 550, endMinute: 560, kind: "meeting", label: "One" },
        { startMinute: 564, endMinute: 580, kind: "focus", label: "Two" },
      ],
    };
    expect(getDecisionAt(day, 545)).toMatchObject({ kind: "MOVE_NOW", minute: 545 });
    expect(getDecisionAt(day, 546)).toMatchObject({ kind: "WAIT", minute: 580 });
    expect(getDecisionAt(day, 560)).toMatchObject({ kind: "WAIT", minute: 580 });
    expect(getDecisionAt(day, 580)).toMatchObject({ kind: "MOVE_NOW", minute: 580 });
  });

  it("keeps end-of-day and blocked-delay explanations aligned with the response", () => {
    const accepted = getNextDecision(SAMPLE_DAY, "accept", 590);
    expect(accepted.reason).toContain("accepted");
    expect(accepted.reason).toContain("90 minutes");
    expect(accepted.reason).toContain("Focus block");
    const snoozed = getNextDecision(SAMPLE_DAY, "snooze", 570);
    expect(snoozed.reason).toContain("snoozed");
    expect(snoozed.reason).toContain("20 minutes");
    const dismissed = getNextDecision(SAMPLE_DAY, "dismiss", 1000);
    expect(dismissed.reason).toContain("dismissed");
    expect(dismissed.reason).not.toMatch(/learned|calendar access|live/i);
  });
});
