import type { Workday } from "../../lib/timing-lab/engine";

/** A fictional schedule for comparing timing responses, never a live calendar. */
export const SAMPLE_DAY: Workday = {
  startMinute: 9 * 60,
  initialMinute: 9 * 60 + 10,
  endMinute: 17 * 60,
  suggestionMinute: 9 * 60 + 30,
  minimumWindowMinutes: 5,
  blocks: [
    { startMinute: 9 * 60, endMinute: 9 * 60 + 30, kind: "meeting", label: "Team meeting" },
    { startMinute: 10 * 60, endMinute: 10 * 60 + 30, kind: "focus", label: "Focus block" },
    { startMinute: 10 * 60 + 45, endMinute: 11 * 60, kind: "meeting", label: "Team check-in" },
    { startMinute: 11 * 60 + 20, endMinute: 11 * 60 + 40, kind: "focus", label: "Focus block" },
    { startMinute: 12 * 60 + 30, endMinute: 13 * 60, kind: "meeting", label: "Project review" },
    { startMinute: 14 * 60, endMinute: 15 * 60, kind: "focus", label: "Focus block" },
    { startMinute: 16 * 60 + 45, endMinute: 17 * 60, kind: "meeting", label: "Wrap-up meeting" },
  ],
};
