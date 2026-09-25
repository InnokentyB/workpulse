import { describe, expect, it } from "vitest";

import { demoScenarios } from "@/data/demo-scenarios";
import { evaluateIntervention } from "@/lib/decision-engine";
import type { WorkContext } from "@/lib/types";

const goodWindow = demoScenarios[0].context;

function context(overrides: Partial<WorkContext>): WorkContext {
  return { ...goodWindow, ...overrides };
}

describe("evaluateIntervention", () => {
  it("returns the fixed recommendation for the canonical good window", () => {
    const result = evaluateIntervention(goodWindow);

    expect(result).toMatchObject({
      decision: "MOVE_NOW",
      movementNeed: "HIGH",
      interruptionCost: "LOW",
      activity: {
        id: "neck-reset",
        name: "Neck reset",
        durationSeconds: 45,
      },
    });
    expect(result.reason).toContain("12-minute window");
  });

  it("lets an imminent meeting override high movement need", () => {
    const result = evaluateIntervention(demoScenarios[1].context);

    expect(result).toMatchObject({
      decision: "NOT_NOW",
      movementNeed: "HIGH",
      interruptionCost: "HIGH",
    });
    expect(result.reason).toContain("2 minutes");
    expect(result.activity).toBeUndefined();
  });

  it("applies the meeting gate at exactly five minutes", () => {
    const result = evaluateIntervention(
      context({ minutesToNextMeeting: 5 }),
    );

    expect(result.decision).toBe("NOT_NOW");
    expect(result.interruptionCost).toBe("HIGH");
    expect(result.activity).toBeUndefined();
  });

  it("allows a recommendation after the five-minute meeting gate", () => {
    const result = evaluateIntervention(
      context({
        sedentaryMinutes: 75,
        minutesSinceLastActivity: 120,
        minutesToNextMeeting: 6,
      }),
    );

    expect(result.decision).toBe("MOVE_NOW");
    expect(result.interruptionCost).toBe("MEDIUM");
    expect(result.activity).toBeDefined();
  });

  it("hard-gates contexts below forty sedentary minutes", () => {
    const result = evaluateIntervention(
      context({
        sedentaryMinutes: 39,
        minutesSinceLastActivity: 120,
        minutesToNextMeeting: null,
      }),
    );

    expect(result).toMatchObject({
      decision: "NOT_NOW",
      movementNeed: "LOW",
      interruptionCost: "LOW",
    });
    expect(result.reason).toContain("still low");
    expect(result.activity).toBeUndefined();
  });

  it("scores rather than hard-gates exactly forty sedentary minutes", () => {
    const result = evaluateIntervention(
      context({
        sedentaryMinutes: 40,
        minutesSinceLastActivity: 120,
        minutesToNextMeeting: null,
      }),
    );

    expect(result.decision).toBe("MOVE_NOW");
    expect(result.activity).toBeDefined();
  });

  it("returns NOT_NOW when the opportunity score is below threshold", () => {
    const result = evaluateIntervention(
      context({
        sedentaryMinutes: 40,
        minutesSinceLastActivity: 0,
        minutesToNextMeeting: 6,
      }),
    );

    expect(result).toMatchObject({
      decision: "NOT_NOW",
      movementNeed: "MEDIUM",
      interruptionCost: "MEDIUM",
    });
    expect(result.reason).toContain("not yet a strong enough");
    expect(result.activity).toBeUndefined();
  });

  it("explains a recommendation when no meeting is scheduled", () => {
    const result = evaluateIntervention(
      context({ minutesToNextMeeting: null }),
    );

    expect(result.decision).toBe("MOVE_NOW");
    expect(result.reason).toContain("no upcoming meeting");
  });

  it("clamps the score for unusually large readings", () => {
    const result = evaluateIntervention(
      context({
        sedentaryMinutes: 10_000,
        minutesSinceLastActivity: 10_000,
        minutesToNextMeeting: null,
      }),
    );

    expect(result.score).toBe(1);
    expect(result.decision).toBe("MOVE_NOW");
  });

  it("is deterministic for the same context", () => {
    expect(evaluateIntervention(goodWindow)).toEqual(
      evaluateIntervention(goodWindow),
    );
  });

  it.each(demoScenarios)(
    "preserves result invariants for $id",
    ({ context: scenarioContext }) => {
      const result = evaluateIntervention(scenarioContext);

      expect(result.reason.trim().length).toBeGreaterThan(0);
      expect(Boolean(result.activity)).toBe(result.decision === "MOVE_NOW");
    },
  );
});
