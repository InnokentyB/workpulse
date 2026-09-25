import rawWorkoutSettings from "@/data/workouts.json";
import type { Activity } from "@/lib/types";

export type WorkoutDefinition = Activity & {
  selection: {
    minimumMinutesSinceLastActivity: number;
  };
};

export type WorkoutSettings = {
  transitionBufferSeconds: number;
  workouts: WorkoutDefinition[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${path} must be an object.`);
  return value;
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${path} must be a non-empty string.`);
  }
  return value;
}

function requireNonNegativeInteger(value: unknown, path: string): number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`${path} must be a non-negative integer.`);
  }
  return value as number;
}

function requirePositiveInteger(value: unknown, path: string): number {
  const number = requireNonNegativeInteger(value, path);
  if (number === 0) throw new Error(`${path} must be greater than zero.`);
  return number;
}

function parseWorkout(value: unknown, index: number): WorkoutDefinition {
  const path = `workouts[${index}]`;
  const workout = requireRecord(value, path);
  const sessionType = workout.sessionType;

  if (sessionType !== "timer" && sessionType !== "camera-neck") {
    throw new Error(`${path}.sessionType must be "timer" or "camera-neck".`);
  }

  const durationSeconds = requirePositiveInteger(
    workout.durationSeconds,
    `${path}.durationSeconds`,
  );

  if (!Array.isArray(workout.steps) || workout.steps.length === 0) {
    throw new Error(`${path}.steps must contain at least one step.`);
  }

  const selection = requireRecord(workout.selection, `${path}.selection`);

  return {
    id: requireString(workout.id, `${path}.id`),
    name: requireString(workout.name, `${path}.name`),
    durationSeconds,
    instructions: requireString(workout.instructions, `${path}.instructions`),
    sessionType,
    steps: workout.steps.map((step, stepIndex) =>
      requireString(step, `${path}.steps[${stepIndex}]`),
    ),
    selection: {
      minimumMinutesSinceLastActivity: requireNonNegativeInteger(
        selection.minimumMinutesSinceLastActivity,
        `${path}.selection.minimumMinutesSinceLastActivity`,
      ),
    },
  };
}

export function parseWorkoutSettings(value: unknown): WorkoutSettings {
  const settings = requireRecord(value, "workout settings");
  const transitionBufferSeconds = requireNonNegativeInteger(
    settings.transitionBufferSeconds,
    "transitionBufferSeconds",
  );

  if (!Array.isArray(settings.workouts) || settings.workouts.length === 0) {
    throw new Error("workouts must contain at least one workout.");
  }

  const workouts = settings.workouts.map(parseWorkout);
  const ids = new Set<string>();
  for (const workout of workouts) {
    if (ids.has(workout.id)) {
      throw new Error(`Duplicate workout id: ${workout.id}.`);
    }
    ids.add(workout.id);
  }

  if (
    !workouts.some(
      (workout) => workout.selection.minimumMinutesSinceLastActivity === 0,
    )
  ) {
    throw new Error(
      "workouts must include a fallback with minimumMinutesSinceLastActivity set to 0.",
    );
  }

  return { transitionBufferSeconds, workouts };
}

const checkedInSettings = parseWorkoutSettings(rawWorkoutSettings);

export function loadWorkoutSettings(): WorkoutSettings {
  return checkedInSettings;
}
