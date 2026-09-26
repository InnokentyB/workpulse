export const PRODUCT_EVENTS_STORAGE_KEY = "workpulse.product-events";
const PRODUCT_EVENTS_VERSION = 1;
const PRODUCT_EVENTS_LIMIT = 500;

export const PRODUCT_EVENT_NAMES = [
  "onboarding_completed",
  "onboarding_skipped",
  "decision_shown",
  "activity_started",
  "activity_completed",
  "activity_dismissed",
  "camera_enabled",
  "camera_failed",
  "feedback_submitted",
  "calendar_connected",
  "calendar_failed",
  "calendar_disconnected",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];
export type ProductEventInput = {
  name: ProductEventName;
  activityId?: string;
};
export type ProductEvent = ProductEventInput & { occurredAt: string };

export type ProductEventStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function isProductEvent(value: unknown): value is ProductEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<ProductEvent>;
  return (
    typeof event.name === "string" &&
    PRODUCT_EVENT_NAMES.includes(event.name as ProductEventName) &&
    (event.activityId === undefined ||
      (typeof event.activityId === "string" && event.activityId.length > 0)) &&
    typeof event.occurredAt === "string" &&
    !Number.isNaN(new Date(event.occurredAt).getTime())
  );
}

export function loadProductEvents(storage: ProductEventStorage): ProductEvent[] {
  try {
    const serialized = storage.getItem(PRODUCT_EVENTS_STORAGE_KEY);
    if (!serialized) return [];
    const payload = JSON.parse(serialized) as {
      version?: unknown;
      events?: unknown;
    };
    if (payload.version !== PRODUCT_EVENTS_VERSION || !Array.isArray(payload.events)) {
      return [];
    }
    return payload.events.filter(isProductEvent);
  } catch {
    return [];
  }
}

export function recordProductEvent(
  storage: ProductEventStorage,
  input: ProductEventInput,
  now: () => Date = () => new Date(),
): ProductEvent {
  const event = { ...input, occurredAt: now().toISOString() };
  const events = [...loadProductEvents(storage), event].slice(-PRODUCT_EVENTS_LIMIT);
  try {
    storage.setItem(
      PRODUCT_EVENTS_STORAGE_KEY,
      JSON.stringify({ version: PRODUCT_EVENTS_VERSION, events }),
    );
  } catch {
    // Event collection is optional and never blocks the product flow.
  }
  return event;
}

export function summarizeProductEvents(storage: ProductEventStorage) {
  const summary = Object.fromEntries(
    PRODUCT_EVENT_NAMES.map((name) => [name, 0]),
  ) as Record<ProductEventName, number>;
  for (const event of loadProductEvents(storage)) summary[event.name] += 1;
  return summary;
}
