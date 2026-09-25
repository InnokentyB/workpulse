import rawWorkoutSettings from "@/data/workouts.json";
import type {
  Activity,
  ActivityGuidance,
  ActivityGuidanceStep,
  ActivityVisual,
} from "@/lib/types";

export type WorkoutDefinition = Activity & {
  selection: {
    minimumMinutesSinceLastActivity: number;
  };
};

export type WorkoutSettings = {
  version: number;
  repeatCooldownMinutes: number;
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

function parseVisual(value: unknown, path: string): ActivityVisual {
  const visual = requireRecord(value, path);
  if (visual.kind !== "image" && visual.kind !== "animation") {
    throw new Error(`${path}.kind must be "image" or "animation".`);
  }
  const src = requireString(visual.src, `${path}.src`);
  const isLocalPath = src.startsWith("/") && !src.startsWith("//");
  if (!isLocalPath && !src.startsWith("https://")) {
    throw new Error(`${path}.src must use a local path or HTTPS URL.`);
  }

  return {
    kind: visual.kind,
    src,
    alt: requireString(visual.alt, `${path}.alt`),
  };
}

function parseGuidance(
  value: unknown,
  path: string,
  durationSeconds: number,
): ActivityGuidance {
  const guidance = requireRecord(value, path);
  const position = guidance.position;
  if (position !== "seated" && position !== "standing" && position !== "either") {
    throw new Error(`${path}.position must be "seated", "standing", or "either".`);
  }
  if (!Array.isArray(guidance.steps) || guidance.steps.length === 0) {
    throw new Error(`${path}.steps must contain at least one step.`);
  }
  const steps: ActivityGuidanceStep[] = guidance.steps.map((value, index) => {
    const stepPath = `${path}.steps[${index}]`;
    const step = requireRecord(value, stepPath);
    return {
      label: requireString(step.label, `${stepPath}.label`),
      durationSeconds: requirePositiveInteger(
        step.durationSeconds,
        `${stepPath}.durationSeconds`,
      ),
      ...(step.visual === undefined
        ? {}
        : { visual: parseVisual(step.visual, `${stepPath}.visual`) }),
    };
  });
  const guidanceDuration = steps.reduce(
    (total, step) => total + step.durationSeconds,
    0,
  );
  if (guidanceDuration !== durationSeconds) {
    throw new Error(
      `${path}.steps duration sum must equal durationSeconds (${durationSeconds}).`,
    );
  }

  return {
    position,
    safetyWarning: requireString(
      guidance.safetyWarning,
      `${path}.safetyWarning`,
    ),
    steps,
  };
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
    ...(workout.guidance === undefined
      ? {}
      : {
          guidance: parseGuidance(
            workout.guidance,
            `${path}.guidance`,
            durationSeconds,
          ),
        }),
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
  const version = requirePositiveInteger(settings.version, "version");
  const repeatCooldownMinutes = requireNonNegativeInteger(
    settings.repeatCooldownMinutes,
    "repeatCooldownMinutes",
  );
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

  return { version, repeatCooldownMinutes, transitionBufferSeconds, workouts };
}

const checkedInSettings = parseWorkoutSettings(rawWorkoutSettings);

export function loadWorkoutSettings(): WorkoutSettings {
  return checkedInSettings;
}
