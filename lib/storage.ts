import type { InterventionRecord } from "./types";

const STORAGE_KEY = "workpulse.interventions.v1";

export function loadInterventionHistory(): InterventionRecord[] {
  if (typeof window === "undefined") return [];

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  if (!storedValue) return [];

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? (parsedValue as InterventionRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveInterventionHistory(
  history: InterventionRecord[],
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function appendInterventionRecord(record: InterventionRecord): void {
  saveInterventionHistory([...loadInterventionHistory(), record]);
}

export function clearInterventionHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
