export const PRODUCT_EVENT_STORAGE_KEY = "workpulse.product-events.v1";

const QUEUE_VERSION = 1 as const;
const EVENT_SCHEMA_VERSION = 1 as const;
const DEFAULT_MAX_EVENTS = 100;
const MAX_CONTEXT_KEYS = 20;
const MAX_FIELD_LENGTH = 160;

export type ProductEventName =
  | "recommendation_shown"
  | "activity_started"
  | "activity_completed"
  | "activity_completed_manual"
  | "camera_permission_denied"
  | "camera_start_failed"
  | "activity_skipped";

export type ProductEventContextValue = string | number | boolean | null;

export interface ProductEvent {
  schemaVersion: typeof EVENT_SCHEMA_VERSION;
  name: ProductEventName;
  activityId: string;
  timestamp: string;
  reason?: string;
  context?: Record<string, ProductEventContextValue>;
}

export interface ProductEventInput {
  activityId: string;
  reason?: string;
  context?: Record<string, ProductEventContextValue>;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ProductEventTracker {
  track(name: ProductEventName, input: ProductEventInput): ProductEvent;
  getEvents(): ProductEvent[];
  clear(): void;
}

interface StoredEventQueue {
  version: typeof QUEUE_VERSION;
  events: ProductEvent[];
}

interface ProductEventTrackerOptions {
  storage?: StorageLike;
  now?: () => Date;
  maxEvents?: number;
}

const EVENT_NAMES = new Set<ProductEventName>([
  "recommendation_shown",
  "activity_started",
  "activity_completed",
  "activity_completed_manual",
  "camera_permission_denied",
  "camera_start_failed",
  "activity_skipped",
]);

function sanitizeText(value: string): string {
  return value.slice(0, MAX_FIELD_LENGTH);
}

function isContextValue(value: unknown): value is ProductEventContextValue {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function sanitizeContext(
  context: ProductEventInput["context"],
): Record<string, ProductEventContextValue> | undefined {
  if (!context || typeof context !== "object" || Array.isArray(context)) {
    return undefined;
  }

  const entries = Object.entries(context)
    .filter(([, value]) => isContextValue(value))
    .slice(0, MAX_CONTEXT_KEYS)
    .map(([key, value]) => [
      sanitizeText(key),
      typeof value === "string" ? sanitizeText(value) : value,
    ]);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function isProductEvent(value: unknown): value is ProductEvent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const event = value as Partial<ProductEvent>;
  return (
    event.schemaVersion === EVENT_SCHEMA_VERSION &&
    typeof event.name === "string" &&
    EVENT_NAMES.has(event.name as ProductEventName) &&
    typeof event.activityId === "string" &&
    typeof event.timestamp === "string" &&
    (event.reason === undefined || typeof event.reason === "string") &&
    (event.context === undefined ||
      (event.context !== null &&
        typeof event.context === "object" &&
        !Array.isArray(event.context) &&
        Object.values(event.context).every(isContextValue)))
  );
}

function cloneEvent(event: ProductEvent): ProductEvent {
  return {
    ...event,
    ...(event.context ? { context: { ...event.context } } : {}),
  };
}

function readQueue(storage?: StorageLike): ProductEvent[] {
  if (!storage) return [];

  try {
    const raw = storage.getItem(PRODUCT_EVENT_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return [];
    }

    const queue = parsed as Partial<StoredEventQueue>;
    if (
      queue.version !== QUEUE_VERSION ||
      !Array.isArray(queue.events) ||
      !queue.events.every(isProductEvent)
    ) {
      return [];
    }

    return queue.events.map(cloneEvent);
  } catch {
    return [];
  }
}

function persistQueue(storage: StorageLike | undefined, events: ProductEvent[]) {
  if (!storage) return;

  try {
    const queue: StoredEventQueue = { version: QUEUE_VERSION, events };
    storage.setItem(PRODUCT_EVENT_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Analytics must never interrupt the exercise flow.
  }
}

export function createProductEventTracker(
  options: ProductEventTrackerOptions = {},
): ProductEventTracker {
  const now = options.now ?? (() => new Date());
  const maxEvents =
    Number.isInteger(options.maxEvents) && (options.maxEvents ?? 0) > 0
      ? options.maxEvents!
      : DEFAULT_MAX_EVENTS;
  let events = readQueue(options.storage).slice(-maxEvents);

  return {
    track(name, input) {
      const context = sanitizeContext(input.context);
      const event: ProductEvent = {
        schemaVersion: EVENT_SCHEMA_VERSION,
        name,
        activityId: sanitizeText(input.activityId),
        timestamp: now().toISOString(),
        ...(input.reason ? { reason: sanitizeText(input.reason) } : {}),
        ...(context ? { context } : {}),
      };

      events = [...events, event].slice(-maxEvents);
      persistQueue(options.storage, events);
      return cloneEvent(event);
    },

    getEvents() {
      return events.map(cloneEvent);
    },

    clear() {
      events = [];
      if (!options.storage) return;

      try {
        options.storage.removeItem(PRODUCT_EVENT_STORAGE_KEY);
      } catch {
        // Keep clear best-effort for disabled or quota-limited storage.
      }
    },
  };
}
