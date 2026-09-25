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
  },
  {
    id: "shoulder-rolls",
    name: "Shoulder rolls",
    durationSeconds: 60,
    guide: "camera-shoulders",
    instructions:
      "Make three slow shoulder circles forward, then three backward. Stay within a comfortable range.",
    movementCount: 6,
    steps: [
      "Sit tall and let your arms rest comfortably.",
      "Make three slow shoulder circles forward.",
      "Finish with three slow shoulder circles backward.",
    ],
  },
];

export function selectActivity(activityId = ACTIVITIES[0].id): Activity {
  return (
    ACTIVITIES.find((activity) => activity.id === activityId) ?? ACTIVITIES[0]
  );
}
