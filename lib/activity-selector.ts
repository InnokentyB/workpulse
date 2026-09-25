import {
  loadWorkoutSettings,
  type WorkoutSettings,
} from "./workout-settings";
import type { Activity, WorkContext } from "./types";

type ActivitySelectionContext = Pick<
  WorkContext,
  "minutesSinceLastActivity" | "minutesToNextMeeting"
> & { excludedActivityIds?: readonly string[] };

const DEFAULT_SETTINGS = loadWorkoutSettings();

export const ACTIVITY_CATALOG: Activity[] = DEFAULT_SETTINGS.workouts;

function availableMovementSeconds(
  minutesToNextMeeting: number | null,
  transitionBufferSeconds: number,
): number {
  if (minutesToNextMeeting === null) return Number.POSITIVE_INFINITY;
  return Math.max(
    0,
    minutesToNextMeeting * 60 - transitionBufferSeconds,
  );
}

export function selectActivity(
  context: ActivitySelectionContext,
  settings: WorkoutSettings = DEFAULT_SETTINGS,
): Activity | undefined {
  const availableSeconds = availableMovementSeconds(
    context.minutesToNextMeeting,
    settings.transitionBufferSeconds,
  );
  const byLongestDuration = [...settings.workouts].sort(
    (first, second) => second.durationSeconds - first.durationSeconds,
  );
  const bestFit = byLongestDuration.find(
    (workout) =>
      !context.excludedActivityIds?.includes(workout.id) &&
      context.minutesSinceLastActivity >=
        workout.selection.minimumMinutesSinceLastActivity &&
      workout.durationSeconds <= availableSeconds,
  );

  return bestFit;
}
