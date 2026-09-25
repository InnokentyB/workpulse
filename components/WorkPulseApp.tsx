"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ActivitySession,
} from "@/components/ActivitySession";
import { DecisionCard } from "@/components/DecisionCard";
import { ArrowIcon, CheckIcon, PulseMark } from "@/components/icons";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { WorkContextCard } from "@/components/WorkContextCard";
import { demoScenarios } from "@/data/demo-scenarios";
import {
  loadActivityHistory,
  minutesSinceLastCompletion,
  recentActivityIds,
  recordActivityCompletion,
  type ActivityHistoryEntry,
} from "@/lib/activity-history";
import { evaluateIntervention } from "@/lib/decision-engine";
import {
  createProductEventTracker,
  type ProductEventTracker,
} from "@/lib/product-events";
import {
  loadRuntimeWorkoutSettings,
  type RuntimeWorkoutSettings,
} from "@/lib/runtime-workout-settings";
import type {
  ActivityCompletion,
  DecisionResult,
  WorkPulseState,
} from "@/lib/types";
import { loadWorkoutSettings } from "@/lib/workout-settings";

const INITIAL_SCENARIO_ID = "good-window";

export function WorkPulseApp() {
  const [selectedId, setSelectedId] = useState(INITIAL_SCENARIO_ID);
  const [state, setState] = useState<WorkPulseState>("IDLE");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [completion, setCompletion] = useState<ActivityCompletion | null>(null);
  const [history, setHistory] = useState<ActivityHistoryEntry[]>([]);
  const [catalog, setCatalog] = useState<RuntimeWorkoutSettings>({
    settings: loadWorkoutSettings(),
    source: "bundled",
  });
  const trackerRef = useRef<ProductEventTracker | null>(null);

  function tracker(): ProductEventTracker {
    trackerRef.current ??= createProductEventTracker({ storage: window.localStorage });
    return trackerRef.current;
  }

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setHistory(loadActivityHistory(window.localStorage));
    });
    void loadRuntimeWorkoutSettings({ storage: window.localStorage }).then(
      (nextCatalog) => {
        if (active) setCatalog(nextCatalog);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const scenario = useMemo(
    () =>
      demoScenarios.find((item) => item.id === selectedId) ?? demoScenarios[0],
    [selectedId],
  );
  const activeContext = useMemo(
    () => {
      const storedMinutes = minutesSinceLastCompletion(history);
      return {
        ...scenario.context,
        minutesSinceLastActivity:
          storedMinutes ?? scenario.context.minutesSinceLastActivity,
      };
    },
    [history, scenario.context],
  );
  const excludedActivityIds = useMemo(
    () => recentActivityIds(history, catalog.settings.repeatCooldownMinutes),
    [catalog.settings.repeatCooldownMinutes, history],
  );

  function selectScenario(scenarioId: string) {
    setSelectedId(scenarioId);
    setState("IDLE");
    setResult(null);
    setCompletion(null);
  }

  function evaluate() {
    const nextResult = evaluateIntervention(activeContext, {
      settings: catalog.settings,
      excludedActivityIds,
    });
    setResult(nextResult);
    setState(nextResult.decision === "MOVE_NOW" ? "RECOMMENDED" : "NOT_NOW");
    if (nextResult.activity) {
      tracker().track("recommendation_shown", {
        activityId: nextResult.activity.id,
        context: {
          minutesToNextMeeting: activeContext.minutesToNextMeeting,
          minutesSinceLastActivity: activeContext.minutesSinceLastActivity,
          catalogVersion: catalog.settings.version,
        },
      });
    }
  }

  function runAgain() {
    setResult(null);
    setState("IDLE");
    setCompletion(null);
  }

  const isResultVisible = state === "RECOMMENDED" || state === "NOT_NOW";

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="WorkPulse home">
          <PulseMark />
          <span>WorkPulse</span>
        </a>
        <p>Move more. Interrupt less.</p>
      </header>

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
            <span aria-hidden="true">Catalog</span>
            <p>
              Version {catalog.settings.version} · {catalog.source === "remote" ? "Live" : catalog.source === "cache" ? "Saved" : "Built in"}
              {catalog.warning ? <small role="status">{catalog.warning}</small> : null}
            </p>
          </div>
        </aside>

        <div className="demo-stage">
          <WorkContextCard context={activeContext} />

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
              onSkip={() => {
                if (result.activity) {
                  tracker().track("activity_skipped", {
                    activityId: result.activity.id,
                    reason: "recommendation_dismissed",
                  });
                }
                runAgain();
              }}
              onStart={() => {
                if (result.activity) {
                  tracker().track("activity_started", {
                    activityId: result.activity.id,
                  });
                }
                setState("ACTIVE");
              }}
              result={result}
            />
          ) : null}

          {state === "ACTIVE" && result?.activity ? (
            <ActivitySession
              activity={result.activity}
              onEvent={(event) =>
                tracker().track(event, { activityId: result.activity!.id })
              }
              onComplete={(nextCompletion) => {
                setCompletion(nextCompletion);
                const nextHistory = recordActivityCompletion(
                  window.localStorage,
                  {
                    activityId: result.activity!.id,
                    completionMode: nextCompletion.mode,
                  },
                );
                setHistory(nextHistory);
                tracker().track(
                  nextCompletion.mode === "manual"
                    ? "activity_completed_manual"
                    : "activity_completed",
                  {
                    activityId: result.activity!.id,
                    context: {
                      completedSteps: nextCompletion.completedSteps,
                      verified: nextCompletion.verified,
                    },
                  },
                );
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
                    ? `Nice work. ${result?.activity?.name ?? "Movement"} verified.`
                    : `Nice work. ${result?.activity?.name ?? "Activity"} complete.`}
                </h2>
                <span>
                  {completion?.verified
                    ? "Four movements confirmed on this device. No video was recorded. Camera is off."
                    : completion?.mode === "timer"
                      ? "Guided sequence complete."
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

      <footer>
        <PulseMark />
        <p>
          A workplace wellbeing prototype. Activity suggestions are not medical
          advice.
        </p>
      </footer>
    </main>
  );
}
