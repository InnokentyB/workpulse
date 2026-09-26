export const INTERVENTION_DISMISSALS_STORAGE_KEY =
  "workpulse.intervention-dismissals";
const INTERVENTION_DISMISSALS_VERSION = 1;
const DISMISSAL_HISTORY_LIMIT = 100;
export const DISMISSAL_COOLDOWN_MINUTES = 15;

export type InterventionDismissal = {
  activityId: string;
  dismissedAt: string;
  cooldownUntil: string;
};

export type CooldownStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

function isDismissal(value: unknown): value is InterventionDismissal {
  if (!value || typeof value !== "object") return false;
  const dismissal = value as Partial<InterventionDismissal>;
  return (
    typeof dismissal.activityId === "string" &&
    dismissal.activityId.trim().length > 0 &&
    isValidDate(dismissal.dismissedAt) &&
    isValidDate(dismissal.cooldownUntil)
  );
}

export function loadDismissals(
  storage: CooldownStorage,
): InterventionDismissal[] {
  try {
    const serialized = storage.getItem(INTERVENTION_DISMISSALS_STORAGE_KEY);
    if (!serialized) return [];
    const payload = JSON.parse(serialized) as {
      version?: unknown;
      dismissals?: unknown;
    };
    if (
      payload.version !== INTERVENTION_DISMISSALS_VERSION ||
      !Array.isArray(payload.dismissals)
    ) {
      return [];
    }
    return payload.dismissals.filter(isDismissal);
  } catch {
    return [];
  }
}

export function recordDismissal(
  storage: CooldownStorage,
  activityId: string,
  now: () => Date = () => new Date(),
): InterventionDismissal {
  const dismissedAt = now();
  const record = {
    activityId,
    dismissedAt: dismissedAt.toISOString(),
    cooldownUntil: new Date(
      dismissedAt.getTime() + DISMISSAL_COOLDOWN_MINUTES * 60_000,
    ).toISOString(),
  };
  const dismissals = [...loadDismissals(storage), record].slice(
    -DISMISSAL_HISTORY_LIMIT,
  );
  try {
    storage.setItem(
      INTERVENTION_DISMISSALS_STORAGE_KEY,
      JSON.stringify({
        version: INTERVENTION_DISMISSALS_VERSION,
        dismissals,
      }),
    );
  } catch {
    // The current session still honors the dismissal even without persistence.
  }
  return record;
}

export function getActiveDismissal(
  storage: CooldownStorage,
  now: () => Date = () => new Date(),
): InterventionDismissal | null {
  const currentTime = now().getTime();
  return (
    [...loadDismissals(storage)]
      .reverse()
      .find((dismissal) => new Date(dismissal.cooldownUntil).getTime() > currentTime) ??
    null
  );
}
