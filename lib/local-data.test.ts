import { describe, expect, it, vi } from "vitest";

import {
  clearWorkPulseLocalData,
  listWorkPulseLocalDataKeys,
} from "@/lib/local-data";

function createStorage(entries: Record<string, string>) {
  const values = new Map(Object.entries(entries));

  return {
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
    removeItem: vi.fn((key: string) => values.delete(key)),
    values,
  };
}

describe("WorkPulse local data", () => {
  it("finds every WorkPulse-owned key without including other site data", () => {
    const storage = createStorage({
      "another-product.session": "keep",
      "workpulse.activity-history": "history",
      "workpulse.future-setting": "setting",
    });

    expect(listWorkPulseLocalDataKeys(storage)).toEqual([
      "workpulse.activity-history",
      "workpulse.future-setting",
    ]);
  });

  it("removes known and future WorkPulse data while preserving unrelated keys", () => {
    const storage = createStorage({
      "another-product.session": "keep",
      "workpulse.activity-history": "history",
      "workpulse.intervention-dismissals": "dismissals",
    });

    expect(clearWorkPulseLocalData(storage)).toEqual({
      failedKeys: [],
      removedKeys: [
        "workpulse.activity-history",
        "workpulse.intervention-dismissals",
      ],
    });
    expect([...storage.values.entries()]).toEqual([
      ["another-product.session", "keep"],
    ]);
  });

  it("reports a key that the browser refuses to remove", () => {
    const storage = createStorage({ "workpulse.activity-history": "history" });
    storage.removeItem.mockImplementation(() => {
      throw new DOMException("Storage is unavailable", "SecurityError");
    });

    expect(clearWorkPulseLocalData(storage)).toEqual({
      failedKeys: ["workpulse.activity-history"],
      removedKeys: [],
    });
  });

  it("reports storage that the browser prevents WorkPulse from reading", () => {
    const storage = {
      key: () => null,
      get length(): number {
        throw new DOMException("Storage is unavailable", "SecurityError");
      },
      removeItem: vi.fn(),
    };

    expect(clearWorkPulseLocalData(storage)).toEqual({
      failedKeys: ["workpulse."],
      removedKeys: [],
    });
  });
});
