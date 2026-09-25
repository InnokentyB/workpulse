import { selectActivity } from "./activity-selector";
import type { WorkoutSettings } from "./workout-settings";
import type {
  DecisionResult,
  Level,
  WorkContext,
} from "./types";

const MINIMUM_SEDENTARY_MINUTES = 40;
const MEETING_GATE_MINUTES = 5;
const MOVE_NOW_THRESHOLD = 0.65;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function toLevel(value: number): Level {
  if (value >= 0.67) return "HIGH";
  if (value >= 0.34) return "MEDIUM";
  return "LOW";
}

export function evaluateIntervention(
  context: WorkContext,
  options: {
    settings?: WorkoutSettings;
    excludedActivityIds?: readonly string[];
  } = {},
): DecisionResult {
  const movementScore = clamp(
    (context.sedentaryMinutes / 75) * 0.7 +
      (context.minutesSinceLastActivity / 120) * 0.3,
    0,
    1,
  );
  const opportunityScore =
    context.minutesToNextMeeting === null
      ? 1
      : clamp(context.minutesToNextMeeting / 15, 0, 1);
  const score = Number(
    (movementScore * 0.65 + opportunityScore * 0.35).toFixed(2),
  );
  const movementNeed = toLevel(movementScore);
  const interruptionCost = toLevel(1 - opportunityScore);

  if (
    context.minutesToNextMeeting !== null &&
    context.minutesToNextMeeting <= MEETING_GATE_MINUTES
  ) {
    return {
      decision: "NOT_NOW",
      movementNeed,
      interruptionCost: "HIGH",
      score,
      reason: `You need movement, but your next meeting starts in ${context.minutesToNextMeeting} minutes. I'll check again afterwards.`,
    };
  }

  if (context.sedentaryMinutes < MINIMUM_SEDENTARY_MINUTES) {
    return {
      decision: "NOT_NOW",
      movementNeed: "LOW",
      interruptionCost,
      score,
      reason: "Your movement need is still low. WorkPulse will check again later.",
    };
  }

  if (score >= MOVE_NOW_THRESHOLD) {
    const windowDescription =
      context.minutesToNextMeeting === null
        ? "no upcoming meeting"
        : `a ${context.minutesToNextMeeting}-minute window before your next meeting`;
    const activity = selectActivity(
      { ...context, excludedActivityIds: options.excludedActivityIds },
      options.settings,
    );

    if (!activity) {
      return {
        decision: "NOT_NOW",
        movementNeed,
        interruptionCost,
        score,
        reason:
          "Movement would be useful, but no configured activity fits the protected time before your next meeting.",
      };
    }

    return {
      decision: "MOVE_NOW",
      movementNeed,
      interruptionCost,
      score,
      reason: `You've been sitting for ${context.sedentaryMinutes} minutes and have ${windowDescription}.`,
      activity,
      activityReason:
        context.minutesToNextMeeting === null
          ? `Selected because your calendar is open and you last moved ${context.minutesSinceLastActivity} minutes ago.`
          : `Selected for your ${context.minutesToNextMeeting}-minute window and because you last moved ${context.minutesSinceLastActivity} minutes ago.`,
    };
  }

  return {
    decision: "NOT_NOW",
    movementNeed,
    interruptionCost,
    score,
    reason: "This is not yet a strong enough movement opportunity. WorkPulse will check again later.",
  };
}
