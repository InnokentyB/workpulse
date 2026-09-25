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
};

export type InterventionOutcome = "completed" | "dismissed" | "skipped";

export type InterventionRecord = {
  id: string;
  createdAt: string;
  context: WorkContext;
  decision: Decision;
  reason: string;
  activity?: Activity;
  outcome?: InterventionOutcome;
};

export type DecisionResult = {
  decision: Decision;
  movementNeed: Level;
  interruptionCost: Level;
  score: number;
  reason: string;
  activity?: Activity;
};

export type DemoScenario = {
  id: string;
  label: string;
  description: string;
  context: WorkContext;
  expectedDecision: Decision;
};

export type WorkPulseState =
  | "IDLE"
  | "EVALUATING"
  | "NOT_NOW"
  | "RECOMMENDED"
  | "ACTIVE"
  | "DISMISSED"
  | "COMPLETED";
