"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ActivitySession,
  type ActivityCompletion,
} from "@/components/ActivitySession";
import { ActivityPreferencesPanel } from "@/components/ActivityPreferencesPanel";
import { ActivityHistory } from "@/components/ActivityHistory";
import { DecisionCard } from "@/components/DecisionCard";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { WorkContextCard } from "@/components/WorkContextCard";
import { demoScenarios } from "@/data/demo-scenarios";
import {
  DEFAULT_ACTIVITY_PREFERENCES,
  loadActivityPreferences,
  saveActivityPreferences,
  type ActivityPreferences,
} from "@/lib/activity-preferences";
import {
  loadActivityHistory,
  recordActivityCompletion,
  type ActivityHistoryEntry,
} from "@/lib/activity-history";
import {
  ACTIVITIES,
  describeActivityFit,
  selectActivity,
  selectActivityForContext,
} from "@/lib/activity-selector";
import { evaluateIntervention } from "@/lib/decision-engine";
import type { DecisionResult, WorkPulseState } from "@/lib/types";

const INITIAL_SCENARIO_ID = "good-window";

export function WorkPulseApp() {
  const [selectedId, setSelectedId] = useState(INITIAL_SCENARIO_ID);
  const [state, setState] = useState<WorkPulseState>("IDLE");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [completion, setCompletion] = useState<ActivityCompletion | null>(null);
  const [history, setHistory] = useState<ActivityHistoryEntry[]>([]);
  const [preferences, setPreferences] = useState<ActivityPreferences>({
    ...DEFAULT_ACTIVITY_PREFERENCES,
  });
  const [availableActivities, setAvailableActivities] =
    useState<readonly (typeof ACTIVITIES)[number][]>(ACTIVITIES);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        setHistory(loadActivityHistory(window.localStorage));
        setPreferences(loadActivityPreferences(window.localStorage));
      }
    });
    return () => {
      active = false;
    };
  }, []);

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

  function updatePreferences(nextPreferences: ActivityPreferences) {
    setPreferences(nextPreferences);
    saveActivityPreferences(window.localStorage, nextPreferences);
    setState("IDLE");
    setResult(null);
    setCompletion(null);
  }

  function availableSeconds() {
    return scenario.context.minutesToNextMeeting === null
      ? null
      : scenario.context.minutesToNextMeeting * 60;
  }

  function evaluate() {
    const nextResult = evaluateIntervention(scenario.context);
    const lastActivityId = history.at(-1)?.activityId;
    if (nextResult.activity) {
      const selection = selectActivityForContext({
        ...preferences,
        availableSeconds: availableSeconds(),
        lastActivityId,
      });
      if (!selection) {
        setAvailableActivities([]);
        setResult({
          ...nextResult,
          decision: "NOT_NOW",
          reason:
            "Movement would help, but no activity fits the options you selected. Adjust what works right now or try later.",
          activity: undefined,
        });
        setState("NOT_NOW");
        return;
      }
      nextResult.activity = selection.activity;
      nextResult.activityReason = selection.reason;
      setAvailableActivities(selection.eligibleActivities);
    }
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
          <ActivityPreferencesPanel
            onChange={updatePreferences}
            preferences={preferences}
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
              activities={availableActivities}
              onActivitySelect={(activityId) => {
                const activity = selectActivity(activityId);
                setResult((current) =>
                  current
                    ? {
                        ...current,
                        activity,
                        activityReason: describeActivityFit(
                          activity,
                          availableSeconds(),
                        ),
                      }
                    : current,
                );
              }}
              onStart={() => setState("ACTIVE")}
              result={result}
            />
          ) : null}

          {state === "ACTIVE" && result?.activity ? (
            <ActivitySession
              activity={result.activity}
              onComplete={(nextCompletion) => {
                setCompletion(nextCompletion);
                setHistory(
                  recordActivityCompletion(window.localStorage, {
                    activityId: result.activity!.id,
                    activityName: result.activity!.name,
                    completionMode: nextCompletion.mode,
                    durationSeconds: result.activity!.durationSeconds,
                    movements: nextCompletion.movements,
                  }),
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
                    ? `${completion.movements} movements confirmed on this device. No video was recorded. Camera is off.`
                    : completion?.mode === "guided"
                      ? "Completed with on-screen guidance. No camera was used."
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

      <ActivityHistory entries={history} />

      <SiteFooter />
    </main>
  );
}
