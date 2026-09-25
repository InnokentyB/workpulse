import { describe, expect, it } from "vitest";

import { demoScenarios } from "@/data/demo-scenarios";

describe("demoScenarios", () => {
  it("contains exactly the two MVP scenarios", () => {
    expect(demoScenarios.map(({ id }) => id)).toEqual([
      "good-window",
      "meeting-soon",
    ]);
  });

  it("keeps the canonical decision inputs stable", () => {
    expect(
      demoScenarios.map(({ context: scenarioContext }) => ({
        sedentaryMinutes: scenarioContext.sedentaryMinutes,
        minutesToNextMeeting: scenarioContext.minutesToNextMeeting,
        minutesSinceLastActivity: scenarioContext.minutesSinceLastActivity,
      })),
    ).toEqual([
      {
        sedentaryMinutes: 57,
        minutesToNextMeeting: 12,
        minutesSinceLastActivity: 78,
      },
      {
        sedentaryMinutes: 72,
        minutesToNextMeeting: 2,
        minutesSinceLastActivity: 90,
      },
    ]);
  });
});
