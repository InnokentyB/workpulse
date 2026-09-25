import type { DemoScenario } from "@/lib/types";

export const demoScenarios: DemoScenario[] = [
  {
    id: "good-window",
    label: "Good time to move",
    description: "High movement need and a safe gap before the next meeting.",
    context: {
      sedentaryMinutes: 57,
      minutesToNextMeeting: 12,
      minutesSinceLastActivity: 78,
      currentTime: "14:03",
      nextMeetingTitle: "Design Review",
    },
    expectedDecision: "MOVE_NOW",
  },
  {
    id: "meeting-soon",
    label: "Meeting starts soon",
    description: "Movement is needed, but interruption cost is too high.",
    context: {
      sedentaryMinutes: 72,
      minutesToNextMeeting: 2,
      minutesSinceLastActivity: 90,
      currentTime: "14:18",
      nextMeetingTitle: "Design Review",
    },
    expectedDecision: "NOT_NOW",
  },
  {
    id: "low-need",
    label: "Low movement need",
    description: "There is time available, but an intervention is unnecessary.",
    context: {
      sedentaryMinutes: 25,
      minutesToNextMeeting: 30,
      minutesSinceLastActivity: 25,
      currentTime: "11:15",
      nextMeetingTitle: "Team Sync",
    },
    expectedDecision: "NOT_NOW",
  },
];
