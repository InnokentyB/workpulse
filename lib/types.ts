export type Decision = "MOVE_NOW" | "NOT_NOW";

export type Level = "LOW" | "MEDIUM" | "HIGH";

export type WorkContext = {
  sedentaryMinutes: number;
  minutesToNextMeeting: number | null;
  minutesSinceLastActivity: number;
  currentTime: string;
  nextMeetingTitle?: string;
};

export type Activity = {
  id: string;
  name: string;
  durationSeconds: number;
  instructions: string;
  guide: "camera-neck" | "camera-shoulders" | "guided-steps";
  movementCount?: number;
  steps?: readonly string[];
  requirements?: {
    camera?: boolean;
    explicitChoice?: boolean;
    leaveDesk?: boolean;
    stand?: boolean;
  };
};

export type DecisionResult = {
  decision: Decision;
  movementNeed: Level;
  interruptionCost: Level;
  score: number;
  reason: string;
  activity?: Activity;
  activityReason?: string;
};

export type DemoScenario = {
  id: string;
  label: string;
  description: string;
  context: WorkContext;
};

export type WorkPulseState =
  | "IDLE"
  | "NOT_NOW"
  | "RECOMMENDED"
  | "ACTIVE"
  | "COMPLETED";
