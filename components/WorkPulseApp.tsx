"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ActivitySession,
  type ActivityCompletion,
} from "@/components/ActivitySession";
import { ActivityFeedbackCard } from "@/components/ActivityFeedbackCard";
import { ActivityPreferencesPanel } from "@/components/ActivityPreferencesPanel";
import { ActivityHistory } from "@/components/ActivityHistory";
import { DecisionCard } from "@/components/DecisionCard";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { WorkContextCard } from "@/components/WorkContextCard";
import { demoScenarios } from "@/data/demo-scenarios";
import {
  DEFAULT_ACTIVITY_PREFERENCES,
  applyOnboardingAnswers,
  loadActivityPreferences,
  preferredActivityIds as getOnboardingPreferredActivityIds,
  saveActivityPreferences,
  type ActivityPreferences,
  type OnboardingAnswers,
} from "@/lib/activity-preferences";
import {
  loadActivityHistory,
  recordActivityCompletion,
  type ActivityHistoryEntry,
} from "@/lib/activity-history";
import {
  getActivityPreferenceSignals,
  recordActivityFeedback,
} from "@/lib/activity-feedback";
import {
  ACTIVITIES,
  describeActivityFit,
  selectActivity,
  selectActivityForContext,
} from "@/lib/activity-selector";
import { evaluateIntervention } from "@/lib/decision-engine";
import {
  DISMISSAL_COOLDOWN_MINUTES,
  getActiveDismissal,
  getDismissedActivityIds,
  recordDismissal,
} from "@/lib/intervention-cooldown";
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [availableActivities, setAvailableActivities] =
    useState<readonly (typeof ACTIVITIES)[number][]>(ACTIVITIES);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        setHistory(loadActivityHistory(window.localStorage));
        const storedPreferences = loadActivityPreferences(window.localStorage);
        setPreferences(storedPreferences);
        setShowOnboarding(storedPreferences.onboardingStatus === "new");
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

  function completeOnboarding(answers: OnboardingAnswers) {
    const nextPreferences = applyOnboardingAnswers(preferences, answers);
    updatePreferences(nextPreferences);
    setShowOnboarding(false);
  }

  function skipOnboarding() {
    const nextPreferences: ActivityPreferences = {
      ...preferences,
      onboardingStatus: "skipped",
    };
    updatePreferences(nextPreferences);
    setShowOnboarding(false);
  }

  function availableSeconds() {
    return scenario.context.minutesToNextMeeting === null
      ? null
      : scenario.context.minutesToNextMeeting * 60;
  }

  function evaluate() {
    const nextResult = evaluateIntervention(scenario.context);
    const activeDismissal = getActiveDismissal(window.localStorage);
    if (activeDismissal) {
      setAvailableActivities([]);
      setResult({
        ...nextResult,
        decision: "NOT_NOW",
        reason: `You chose to keep working. WorkPulse will stay quiet until ${new Date(
          activeDismissal.cooldownUntil,
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
        activity: undefined,
        activityReason: undefined,
      });
      setState("NOT_NOW");
      return;
    }
    const lastActivityId = history.at(-1)?.activityId;
    if (nextResult.activity) {
      const feedbackSignals = getActivityPreferenceSignals(window.localStorage);
      const preferredActivityIds = [
        ...new Set([
          ...getOnboardingPreferredActivityIds(preferences),
          ...feedbackSignals.preferredActivityIds,
        ]),
      ];
      const deprioritizedActivityIds = [
        ...new Set([
          ...getDismissedActivityIds(window.localStorage),
          ...feedbackSignals.deprioritizedActivityIds,
        ]),
      ];
      const selection = selectActivityForContext({
        ...preferences,
        availableSeconds: availableSeconds(),
        deprioritizedActivityIds,
        lastActivityId,
        preferredActivityIds,
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

  function dismissRecommendation() {
    if (!result?.activity) return;
    recordDismissal(window.localStorage, result.activity.id);
    setAvailableActivities([]);
    setResult({
      ...result,
      decision: "NOT_NOW",
      reason: `Okay. WorkPulse will stay quiet for ${DISMISSAL_COOLDOWN_MINUTES} minutes.`,
      activity: undefined,
      activityReason: undefined,
    });
    setState("NOT_NOW");
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

      {showOnboarding ? (
        <OnboardingFlow
          initialAnswers={preferences.onboardingAnswers}
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      ) : null}

      <section className="demo-layout" aria-label="WorkPulse decision demo">
        <aside className="demo-controls">
          <ScenarioSelector
            onSelect={selectScenario}
            scenarios={demoScenarios}
            selectedId={selectedId}
          />
          <ActivityPreferencesPanel
            onEditSetup={() => setShowOnboarding(true)}
            onChange={updatePreferences}
            preferences={preferences}
          />
          <div className="privacy-note">
            <span aria-hidden="true">Demo</span>
            <p>Three fixed contexts. No calendar connection or setup required.</p>
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
              onDismiss={dismissRecommendation}
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
            <>
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
              {result?.activity ? (
                <ActivityFeedbackCard
                  activityId={result.activity.id}
                  activityName={result.activity.name}
                  onExclude={(activityId) =>
                    updatePreferences({
                      ...preferences,
                      excludedActivityIds: [
                        ...new Set([
                          ...preferences.excludedActivityIds,
                          activityId,
                        ]),
                      ],
                    })
                  }
                  onSubmit={(feedback) =>
                    recordActivityFeedback(window.localStorage, feedback)
                  }
                />
              ) : null}
            </>
          ) : null}
        </div>
      </section>

      <ActivityHistory entries={history} />

      <SiteFooter />
    </main>
  );
}
