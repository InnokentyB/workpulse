export type Response = "accept" | "snooze" | "dismiss";
export type BlockKind = "meeting" | "focus";

export interface Block {
  startMinute: number;
  endMinute: number;
  kind: BlockKind;
  label: string;
}

export interface Workday {
  startMinute: number;
  endMinute: number;
  initialMinute?: number;
  suggestionMinute: number;
  minimumWindowMinutes: number;
  blocks: readonly Block[];
}

export type TimingDecision = {
  kind: "WAIT" | "MOVE_NOW" | "END_OF_DAY";
  minute: number | null;
  reasonCode: string;
  reason: string;
};

const RESPONSE_DELAYS: Record<Response, number> = {
  accept: 90,
  snooze: 20,
  dismiss: 0,
};

export function formatMinute(minute: number): string {
  const hours = Math.floor(minute / 60);
  return `${String(hours).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

function validate(day: Workday): Block[] {
  if (![day.startMinute, day.endMinute, day.suggestionMinute, day.minimumWindowMinutes, day.initialMinute ?? day.startMinute].every(Number.isInteger)
    || day.startMinute < 0 || day.endMinute > 1440 || day.startMinute >= day.endMinute
    || (day.initialMinute !== undefined && (day.initialMinute < day.startMinute || day.initialMinute >= day.endMinute))
    || day.suggestionMinute < day.startMinute || day.suggestionMinute >= day.endMinute
    || day.minimumWindowMinutes <= 0) {
    throw new RangeError("Invalid workday times");
  }
  const blocks = [...day.blocks].sort((a, b) => a.startMinute - b.startMinute);
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    if (!Number.isInteger(block.startMinute) || !Number.isInteger(block.endMinute)
      || block.startMinute < 0 || block.startMinute >= block.endMinute
      || block.endMinute > 1440) {
      throw new RangeError("Invalid workday blocks");
    }
  }
  const merged: Block[] = [];
  for (const block of blocks) {
    const previous = merged[merged.length - 1];
    if (previous && previous.endMinute >= block.startMinute) {
      merged[merged.length - 1] = { ...previous, endMinute: Math.max(previous.endMinute, block.endMinute) };
    } else merged.push({ ...block });
  }
  return merged;
}

function nextOpen(day: Workday, blocks: Block[], atOrAfter: number): number | null {
  let cursor = Math.max(day.startMinute, atOrAfter);
  for (const block of blocks) {
    if (block.endMinute <= cursor) continue;
    if (cursor + day.minimumWindowMinutes <= Math.min(block.startMinute, day.endMinute)) return cursor;
    if (cursor < block.endMinute) cursor = block.endMinute;
    if (cursor >= day.endMinute) return null;
  }
  return cursor + day.minimumWindowMinutes <= day.endMinute ? cursor : null;
}

function containingBlock(blocks: Block[], minute: number): Block | undefined {
  return blocks.find((block) => block.startMinute <= minute && minute < block.endMinute);
}

export function getDecisionAt(day: Workday, minute: number): TimingDecision {
  const blocks = validate(day);
  if (!Number.isInteger(minute) || minute < day.startMinute || minute >= day.endMinute) {
    throw new RangeError("Minute outside workday");
  }
  const next = nextOpen(day, blocks, minute);
  if (next === null) return {
    kind: "END_OF_DAY", minute: null, reasonCode: "NO_WINDOW",
    reason: "No suitable movement window remains today.",
  };
  if (next === minute) return {
    kind: "MOVE_NOW", minute, reasonCode: "OPEN_WINDOW",
    reason: `A short movement break fits at ${formatMinute(minute)} before the next work block.`,
  };
  const block = containingBlock(blocks, minute);
  return {
    kind: "WAIT", minute: next,
    reasonCode: block ? `BLOCKED_${block.kind.toUpperCase()}` : "WINDOW_TOO_SHORT",
    reason: block
      ? `${block.label} is in progress. The next suitable window opens at ${formatMinute(next)}.`
      : `There is not enough time before the next work block. Try at ${formatMinute(next)}.`,
  };
}

export function getInitialDecision(day: Workday): TimingDecision {
  return getDecisionAt(day, day.initialMinute ?? day.startMinute);
}

export function getNextDecision(day: Workday, response: Response, suggestionMinute: number): TimingDecision {
  const blocks = validate(day);
  if (!(response in RESPONSE_DELAYS)) throw new RangeError("Unknown response");
  if (getDecisionAt(day, suggestionMinute).kind !== "MOVE_NOW") {
    throw new RangeError("Response requires an available suggestion");
  }

  let threshold = suggestionMinute + RESPONSE_DELAYS[response];
  if (response === "dismiss") {
    const nextBlock = blocks.find((block) => block.startMinute > suggestionMinute);
    // Skipping the entire current opportunity means waiting until its next boundary.
    threshold = nextBlock ? nextBlock.endMinute : day.endMinute;
  }
  const next = nextOpen(day, blocks, threshold);
  if (next === null) return {
    kind: "END_OF_DAY", minute: null, reasonCode: `NO_WINDOW_AFTER_${response.toUpperCase()}`,
    reason: `${responseLabel(response)}. No suitable movement window remains today.`,
  };
  const block = blocks.find((item) => item.startMinute < next && item.endMinute > threshold);
  const context = block ? ` ${block.label} blocks the earlier time.` : "";
  const explanations: Record<Response, string> = {
    accept: "You accepted the break, so the next suggestion waits at least 90 minutes.",
    snooze: "You snoozed the break, so the next suggestion waits at least 20 minutes.",
    dismiss: "You dismissed this opportunity, so the next suggestion starts in a later free window.",
  };
  return {
    kind: "MOVE_NOW", minute: next, reasonCode: `AFTER_${response.toUpperCase()}`,
    reason: `${explanations[response]}${context} The next suitable time is ${formatMinute(next)}.`,
  };
}

function responseLabel(response: Response): string {
  return response === "accept" ? "You accepted the break" : response === "snooze"
    ? "You snoozed the break" : "You dismissed this opportunity";
}
