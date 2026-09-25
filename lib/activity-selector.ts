import type { Activity } from "./types";

const MVP_ACTIVITY: Activity = {
  id: "neck-reset",
  name: "Neck reset",
  durationSeconds: 45,
  instructions:
    "Slowly turn side to side, lower your chin, and lift your gaze within a comfortable range.",
};

export function selectActivity(): Activity {
  return MVP_ACTIVITY;
}
