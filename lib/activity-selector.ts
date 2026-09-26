import type { Activity } from "./types";

export const ACTIVITIES: readonly Activity[] = [
  {
    id: "neck-reset",
    name: "Neck reset",
    durationSeconds: 45,
    guide: "camera-neck",
    instructions:
      "Slowly turn side to side, lower your chin, and lift your gaze within a comfortable range.",
    movementCount: 4,
    requirements: { camera: true },
  },
  {
    id: "shoulder-rolls",
    name: "Shoulder rolls",
    durationSeconds: 60,
    guide: "camera-shoulders",
    instructions:
      "Make three slow shoulder circles forward, then three backward. Stay within a comfortable range.",
    movementCount: 6,
    requirements: { camera: true },
    steps: [
      "Sit tall and let your arms rest comfortably.",
      "Make three slow shoulder circles forward.",
      "Finish with three slow shoulder circles backward.",
    ],
  },
  {
    id: "eye-care-break",
    name: "Eye care break",
    durationSeconds: 60,
    guide: "guided-steps",
    instructions:
      "Look away from the screen toward something far away, then blink gently or close your eyes briefly if comfortable.",
    movementCount: 2,
    steps: [
      "Look away from the screen for twenty seconds.",
      "Blink gently, or close your eyes briefly if comfortable.",
    ],
  },
  {
    id: "wall-push-ups",
    name: "Wall push-ups",
    durationSeconds: 60,
    guide: "guided-steps",
    instructions:
      "Face a stable wall, place your hands around shoulder height, and complete up to five gentle push-ups at your own pace.",
    movementCount: 5,
    requirements: { stand: true },
    steps: [
      "Stand facing a stable wall with your hands around shoulder height.",
      "Bend your elbows gently to move closer, then push back.",
      "Repeat up to five times, stopping earlier if you prefer.",
    ],
  },
  {
    id: "purposeful-walk",
    name: "Purposeful walk",
    durationSeconds: 180,
    guide: "guided-steps",
    instructions:
      "Step away from your workstation for water, a distant view, or a few comfortable steps, then return when ready.",
    movementCount: 1,
    requirements: { leaveDesk: true, stand: true },
    steps: [
      "Choose an easy purpose: water, a distant view, or a few steps.",
      "Walk at a comfortable pace.",
      "Return when you are ready; finishing early is fine.",
    ],
  },
  {
    id: "quiet-reset",
    name: "Quiet reset",
    durationSeconds: 120,
    guide: "guided-steps",
    instructions:
      "Sit comfortably, feel the support of the chair and floor, and notice your natural breathing without changing it.",
    movementCount: 1,
    requirements: { explicitChoice: true },
    steps: [
      "Sit comfortably with your feet supported.",
      "Notice your natural breathing; there is no need to change it.",
      "Finish whenever you are ready.",
    ],
  },
];

export type ActivitySelectionContext = {
  availableSeconds: number | null;
  cameraAllowed: boolean;
  canLeaveDesk: boolean;
  canStand: boolean;
  excludedActivityIds: readonly string[];
  deprioritizedActivityIds?: readonly string[];
  preferredActivityIds?: readonly string[];
  lastActivityId?: string;
  quietPauseRequested?: boolean;
};

export type ActivitySelection = {
  activity: Activity;
  eligibleActivities: readonly Activity[];
  reason: string;
};

export function formatActivityDuration(durationSeconds: number): string {
  return durationSeconds >= 120 && durationSeconds % 60 === 0
    ? `${durationSeconds / 60} min`
    : `${durationSeconds} sec`;
}

function fitsContext(activity: Activity, context: ActivitySelectionContext) {
  const requirements = activity.requirements;
  return (
    !context.excludedActivityIds.includes(activity.id) &&
    (context.availableSeconds === null ||
      activity.durationSeconds <= context.availableSeconds) &&
    (!requirements?.camera || context.cameraAllowed) &&
    (!requirements?.explicitChoice || context.quietPauseRequested) &&
    (!requirements?.stand || context.canStand) &&
    (!requirements?.leaveDesk || context.canLeaveDesk)
  );
}

export function describeActivityFit(
  activity: Activity,
  availableSeconds: number | null,
): string {
  const windowDescription =
    availableSeconds === null
      ? "your open work window"
      : availableSeconds >= 120 && availableSeconds % 60 === 0
        ? `your ${availableSeconds / 60}-minute window`
        : `your ${availableSeconds}-second window`;

  if (activity.id === "purposeful-walk") {
    return `It fits ${windowDescription} and you said you can step away from your desk.`;
  }
  if (activity.id === "wall-push-ups") {
    return `It fits ${windowDescription} and you said standing movement is possible.`;
  }
  if (activity.id === "eye-care-break") {
    return `It fits ${windowDescription}, stays seated, and needs no camera.`;
  }
  if (activity.id === "quiet-reset") {
    return `It fits ${windowDescription} and can be completed quietly at your desk.`;
  }
  return `It fits ${windowDescription}, stays at your desk, and uses optional camera guidance.`;
}

export function selectActivityForContext(
  context: ActivitySelectionContext,
): ActivitySelection | null {
  const eligibleActivities = ACTIVITIES.filter((activity) =>
    fitsContext(activity, context),
  );
  if (eligibleActivities.length === 0) return null;

  const withoutImmediateRepeat = eligibleActivities.filter(
    (activity) => activity.id !== context.lastActivityId,
  );
  const variedActivities =
    withoutImmediateRepeat.length > 0 ? withoutImmediateRepeat : eligibleActivities;
  const prioritizedActivities = variedActivities.filter(
    (activity) => !context.deprioritizedActivityIds?.includes(activity.id),
  );
  const candidates =
    prioritizedActivities.length > 0 ? prioritizedActivities : variedActivities;

  const learnedPreference = candidates.find((activity) =>
    context.preferredActivityIds?.includes(activity.id),
  );

  const preferredId = context.canLeaveDesk
    ? "purposeful-walk"
    : context.canStand
      ? "wall-push-ups"
      : undefined;
  const preferred = preferredId
    ? candidates.find((activity) => activity.id === preferredId)
    : undefined;
  const activity =
    learnedPreference ?? preferred ?? candidates[0];

  return {
    activity,
    eligibleActivities,
    reason: describeActivityFit(activity, context.availableSeconds),
  };
}

export function selectActivity(activityId = ACTIVITIES[0].id): Activity {
  return (
    ACTIVITIES.find((activity) => activity.id === activityId) ?? ACTIVITIES[0]
  );
}
