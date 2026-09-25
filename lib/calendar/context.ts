import type { CalendarBusyPeriod } from "@/lib/calendar/types";

export type CalendarWorkContext = {
  isBusy: boolean;
  minutesToNextMeeting: number | null;
  freeWindowMinutes: number | null;
  nextBusyStart: string | null;
  currentBusyEnd: string | null;
};

type NumericPeriod = { start: number; end: number };

function normalizePeriods(periods: readonly CalendarBusyPeriod[]): NumericPeriod[] {
  const valid = periods
    .map((period) => ({
      start: Date.parse(period.start),
      end: Date.parse(period.end),
    }))
    .filter(
      (period) =>
        Number.isFinite(period.start) &&
        Number.isFinite(period.end) &&
        period.end > period.start,
    )
    .sort((left, right) => left.start - right.start);

  return valid.reduce<NumericPeriod[]>((merged, period) => {
    const previous = merged.at(-1);
    if (previous && period.start <= previous.end) {
      previous.end = Math.max(previous.end, period.end);
    } else {
      merged.push({ ...period });
    }
    return merged;
  }, []);
}

function wholeMinutes(milliseconds: number): number {
  return Math.max(0, Math.floor(milliseconds / 60_000));
}

export function deriveCalendarWorkContext(
  periods: readonly CalendarBusyPeriod[],
  now: Date = new Date(),
): CalendarWorkContext {
  const nowMs = now.getTime();
  const normalized = normalizePeriods(periods);
  const current = normalized.find(
    (period) => period.start <= nowMs && period.end > nowMs,
  );

  if (current) {
    return {
      isBusy: true,
      minutesToNextMeeting: 0,
      freeWindowMinutes: 0,
      nextBusyStart: new Date(current.start).toISOString(),
      currentBusyEnd: new Date(current.end).toISOString(),
    };
  }

  const next = normalized.find((period) => period.start > nowMs);
  return {
    isBusy: false,
    minutesToNextMeeting: next
      ? wholeMinutes(next.start - nowMs)
      : null,
    freeWindowMinutes: next ? wholeMinutes(next.start - nowMs) : null,
    nextBusyStart: next ? new Date(next.start).toISOString() : null,
    currentBusyEnd: null,
  };
}
