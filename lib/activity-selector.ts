import type { Activity, InterventionRecord } from "./types";

export const activities: Activity[] = [
  {
    id: "squats-10",
    name: "10 squats",
    durationSeconds: 60,
    instructions: "Complete ten controlled squats at a comfortable pace.",
  },
  {
    id: "shoulder-stretch-60",
    name: "60-second shoulder stretch",
    durationSeconds: 60,
    instructions: "Relax your shoulders and stretch gently for one minute.",
  },
];

export function selectActivity(history: InterventionRecord[]): Activity {
  const squatDismissals = history.filter(
    (record) => record.activity?.id === "squats-10" && record.outcome === "dismissed",
  ).length;
  const stretchCompletions = history.filter(
    (record) =>
      record.activity?.id === "shoulder-stretch-60" &&
      record.outcome === "completed",
  ).length;
  const squatCompletions = history.filter(
    (record) => record.activity?.id === "squats-10" && record.outcome === "completed",
  ).length;

  if (squatDismissals >= 2 && stretchCompletions > squatCompletions) {
    return activities[1];
  }

  return activities[0];
}
