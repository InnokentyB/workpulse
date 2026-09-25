"use client";

import { useMemo, useState } from "react";

import {
  ActivitySession,
  type ActivityCompletion,
} from "@/components/ActivitySession";
import { DecisionCard } from "@/components/DecisionCard";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { WorkContextCard } from "@/components/WorkContextCard";
import { demoScenarios } from "@/data/demo-scenarios";
import { evaluateIntervention } from "@/lib/decision-engine";
import type { DecisionResult, WorkPulseState } from "@/lib/types";

const INITIAL_SCENARIO_ID = "good-window";

export function WorkPulseApp() {
  const [selectedId, setSelectedId] = useState(INITIAL_SCENARIO_ID);
  const [state, setState] = useState<WorkPulseState>("IDLE");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [completion, setCompletion] = useState<ActivityCompletion | null>(null);

  const scenario = useMemo(
    () =>
      demoScenarios.find((item) => item.id === selectedId) ?? demoScenarios[0],
    [selectedId],
  );

  function selectScenario(scenarioId: string) {
    setSelectedId(scenarioId);
    setState("IDLE");
    setResult(null);
    setCompletion(null);
  }

  function evaluate() {
    const nextResult = evaluateIntervention(scenario.context);
    setResult(nextResult);
    setState(nextResult.decision === "MOVE_NOW" ? "RECOMMENDED" : "NOT_NOW");
  }

  function runAgain() {
    setResult(null);
    setState("IDLE");
    setCompletion(null);
  }

  const isResultVisible = state === "RECOMMENDED" || state === "NOT_NOW";

  return (
    <main className="app-shell">
      <SiteHeader current="demo" />

      <div className="intro" id="top">
        <h1>Your workday has a rhythm. Find the right moment to move.</h1>
        <p>
          WorkPulse weighs movement need against interruption cost, then makes
          one clear call — without another noisy reminder.
        </p>
      </div>

      <section className="demo-layout" aria-label="WorkPulse decision demo">
        <aside className="demo-controls">
          <ScenarioSelector
            onSelect={selectScenario}
            scenarios={demoScenarios}
            selectedId={selectedId}
          />
          <div className="privacy-note">
            <span aria-hidden="true">Demo</span>
            <p>Two fixed contexts. No calendar connection or setup required.</p>
          </div>
        </aside>

        <div className="demo-stage">
          <WorkContextCard context={scenario.context} />

          {state === "IDLE" ? (
            <section className="ready-panel" aria-labelledby="ready-heading">
              <div>
                <span className="ready-panel__signal" aria-hidden="true" />
                <p>Context is ready</p>
                <h2 id="ready-heading">Is now a good time to move?</h2>
              </div>
              <button className="button button--evaluate" onClick={evaluate} type="button">
                Ask WorkPulse <ArrowIcon />
              </button>
            </section>
          ) : null}

          {isResultVisible && result ? (
            <DecisionCard
              onStart={() => setState("ACTIVE")}
              result={result}
            />
          ) : null}

          {state === "ACTIVE" && result?.activity ? (
            <ActivitySession
              activity={result.activity}
              onComplete={(nextCompletion) => {
                setCompletion(nextCompletion);
                setState("COMPLETED");
              }}
            />
          ) : null}

          {state === "COMPLETED" ? (
            <section className="outcome-panel" aria-live="polite">
              <span className="outcome-panel__icon">
                <CheckIcon />
              </span>
              <div>
                <p>{completion?.verified ? "Movement verified" : "Activity complete"}</p>
                <h2>
                  {completion?.verified
                    ? "Nice work. Neck reset verified."
                    : "Nice work. Back to your day."}
                </h2>
                <span>
                  {completion?.verified
                    ? "Four movements confirmed on this device. No video was recorded. Camera is off."
                    : "Completed without camera verification."}
                </span>
              </div>
              <button className="button button--quiet" onClick={runAgain} type="button">
                Run again
              </button>
            </section>
          ) : null}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
