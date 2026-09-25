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
  },
  {
    id: "shoulder-window",
    label: "Time for shoulders",
    description: "A longer movement gap with enough time for a focused reset.",
    context: {
      sedentaryMinutes: 72,
      minutesToNextMeeting: 7,
      minutesSinceLastActivity: 100,
      currentTime: "14:13",
      nextMeetingTitle: "Design Review",
    },
  },
  {
    id: "full-reset-window",
    label: "Time for a full reset",
    description: "A long movement gap with room for a three-minute break.",
    context: {
      sedentaryMinutes: 95,
      minutesToNextMeeting: 8,
      minutesSinceLastActivity: 130,
      currentTime: "15:22",
      nextMeetingTitle: "Roadmap Review",
    },
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
  },
];
