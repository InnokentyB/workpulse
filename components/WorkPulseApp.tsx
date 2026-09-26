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
import { WorkdaySessionPanel } from "@/components/WorkdaySessionPanel";
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
import { recordProductEvent } from "@/lib/product-events";
import type { DecisionResult, WorkPulseState } from "@/lib/types";
import {
  DEFAULT_WORKDAY_SETTINGS,
  createManualWorkContext,
  endManualWorkSession,
  isWithinWorkday,
  loadManualWorkSession,
  loadWorkdaySettings,
  saveWorkdaySettings,
  startManualWorkSession,
  type ManualWorkSession,
  type WorkdaySettings,
} from "@/lib/workday-session";

const INITIAL_SCENARIO_ID = "good-window";

export function WorkPulseApp() {
  const [mode, setMode] = useState<"workday" | "demo">("workday");
  const [selectedId, setSelectedId] = useState(INITIAL_SCENARIO_ID);
  const [state, setState] = useState<WorkPulseState>("IDLE");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [completion, setCompletion] = useState<ActivityCompletion | null>(null);
  const [history, setHistory] = useState<ActivityHistoryEntry[]>([]);
  const [preferences, setPreferences] = useState<ActivityPreferences>({
    ...DEFAULT_ACTIVITY_PREFERENCES,
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [workdaySettings, setWorkdaySettings] = useState<WorkdaySettings>({
    ...DEFAULT_WORKDAY_SETTINGS,
  });
  const [workSession, setWorkSession] = useState<ManualWorkSession | null>(null);
  const [sessionPersistenceWarning, setSessionPersistenceWarning] = useState<
    string | null
  >(null);
  const [now, setNow] = useState(() => new Date());
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
        setWorkdaySettings(loadWorkdaySettings(window.localStorage));
        setWorkSession(loadManualWorkSession(window.localStorage));
        setNow(new Date());
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!workSession) return;
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, [workSession]);

  const scenario = useMemo(
    () =>
      demoScenarios.find((item) => item.id === selectedId) ?? demoScenarios[0],
    [selectedId],
  );
  const manualContext = useMemo(
    () =>
      workSession
        ? createManualWorkContext(workSession, history, now)
        : null,
    [history, now, workSession],
  );
  const activeContext = mode === "demo" ? scenario.context : manualContext;

  function selectMode(nextMode: "workday" | "demo") {
    setMode(nextMode);
    setState("IDLE");
    setResult(null);
    setCompletion(null);
  }

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
    recordProductEvent(window.localStorage, { name: "onboarding_completed" });
  }

  function skipOnboarding() {
    const nextPreferences: ActivityPreferences = {
      ...preferences,
      onboardingStatus: "skipped",
    };
    updatePreferences(nextPreferences);
    setShowOnboarding(false);
    recordProductEvent(window.localStorage, { name: "onboarding_skipped" });
  }

  function availableSeconds() {
    if (!activeContext) return null;
    return activeContext.minutesToNextMeeting === null
      ? null
      : activeContext.minutesToNextMeeting * 60;
  }

  function evaluate() {
    if (!activeContext) return;
    const nextResult = evaluateIntervention(activeContext);
    if (mode === "workday" && !isWithinWorkday(workdaySettings, now)) {
      setAvailableActivities([]);
      setResult({
        decision: "NOT_NOW",
        movementNeed: nextResult.movementNeed,
        interruptionCost: "LOW",
        score: nextResult.score,
        reason: `It’s outside your saved working hours (${workdaySettings.startTime}–${workdaySettings.endTime}). WorkPulse will stay quiet until your next workday.`,
      });
      setState("NOT_NOW");
      recordProductEvent(window.localStorage, { name: "decision_shown" });
      return;
    }
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
      recordProductEvent(window.localStorage, { name: "decision_shown" });
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
        recordProductEvent(window.localStorage, { name: "decision_shown" });
        return;
      }
      nextResult.activity = selection.activity;
      nextResult.activityReason = selection.reason;
      setAvailableActivities(selection.eligibleActivities);
    }
    setResult(nextResult);
    setState(nextResult.decision === "MOVE_NOW" ? "RECOMMENDED" : "NOT_NOW");
    recordProductEvent(window.localStorage, { name: "decision_shown" });
  }

  function startWorkday() {
    const started = startManualWorkSession(window.localStorage, new Date());
    if (!started) {
      setSessionPersistenceWarning("We couldn’t start a session. Check your device time and try again.");
      return;
    }
    setNow(new Date(started.session.startedAt));
    setWorkSession(started.session);
    setSessionPersistenceWarning(
      started.persisted
        ? null
        : "This session will last only while this tab remains open.",
    );
    setState("IDLE");
    setResult(null);
  }

  function endWorkday() {
    const persisted = endManualWorkSession(window.localStorage);
    setWorkSession(null);
    setSessionPersistenceWarning(
      persisted ? null : "The saved session could not be cleared on this device.",
    );
    setState("IDLE");
    setResult(null);
    setCompletion(null);
  }

  function updateWorkdaySettings(nextSettings: WorkdaySettings): boolean {
    const persisted = saveWorkdaySettings(window.localStorage, nextSettings);
    setWorkdaySettings(nextSettings);
    return persisted;
  }

  function runAgain() {
    setResult(null);
    setState("IDLE");
    setCompletion(null);
  }

  function dismissRecommendation() {
    if (!result?.activity) return;
    recordDismissal(window.localStorage, result.activity.id);
    recordProductEvent(window.localStorage, {
      name: "activity_dismissed",
      activityId: result.activity.id,
    });
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

      <nav className="mode-switch" aria-label="Choose WorkPulse mode">
        <button
          aria-pressed={mode === "workday"}
          onClick={() => selectMode("workday")}
          type="button"
        >
          My workday
          <span>Live time, no calendar required</span>
        </button>
        <button
          aria-pressed={mode === "demo"}
          onClick={() => selectMode("demo")}
          type="button"
        >
          Demo mode
          <span>Try three fixed scenarios</span>
        </button>
      </nav>

      <section
        className="demo-layout"
        aria-label={mode === "demo" ? "WorkPulse decision demo" : "My WorkPulse workday"}
      >
        <aside className="demo-controls">
          {mode === "demo" ? (
            <ScenarioSelector
              onSelect={selectScenario}
              scenarios={demoScenarios}
              selectedId={selectedId}
            />
          ) : (
            <WorkdaySessionPanel
              key={`${workdaySettings.startTime}-${workdaySettings.endTime}`}
              elapsedMinutes={
                workSession
                  ? Math.max(
                      0,
                      Math.floor(
                        (now.getTime() - new Date(workSession.startedAt).getTime()) /
                          60_000,
                      ),
                    )
                  : 0
              }
              minutesSinceLastActivity={manualContext?.minutesSinceLastActivity ?? 0}
              onEnd={endWorkday}
              onSaveSettings={updateWorkdaySettings}
              persistenceWarning={sessionPersistenceWarning}
              session={workSession}
              settings={workdaySettings}
              withinWorkday={isWithinWorkday(workdaySettings, now)}
            />
          )}
          <ActivityPreferencesPanel
            onEditSetup={() => setShowOnboarding(true)}
            onChange={updatePreferences}
            preferences={preferences}
          />
          <div className="privacy-note">
            <span aria-hidden="true">{mode === "demo" ? "Demo" : "Local"}</span>
            <p>
              {mode === "demo"
                ? "Three fixed contexts. No calendar connection or setup required."
                : "Session timing and completed activities stay on this device."}
            </p>
          </div>
        </aside>

        <div className="demo-stage">
          {activeContext ? (
            <WorkContextCard
              context={activeContext}
              source={mode === "demo" ? "demo" : "manual"}
            />
          ) : (
            <section className="workday-empty-stage" aria-labelledby="workday-empty-heading">
              <div>
                <h2 id="workday-empty-heading">Your live context starts with your session.</h2>
                <p>
                  Start a work session to let WorkPulse use real elapsed time. You can
                  end it at any time, and no calendar or account is required.
                </p>
              </div>
              <button className="button button--evaluate" onClick={startWorkday} type="button">
                Start work session <ArrowIcon />
              </button>
            </section>
          )}

          {state === "IDLE" && activeContext ? (
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
              onStart={() => {
                setState("ACTIVE");
                if (result.activity) {
                  recordProductEvent(window.localStorage, {
                    name: "activity_started",
                    activityId: result.activity.id,
                  });
                }
              }}
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
                recordProductEvent(window.localStorage, {
                  name: "activity_completed",
                  activityId: result.activity!.id,
                });
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
                  onSubmit={(feedback) => {
                    recordActivityFeedback(window.localStorage, feedback);
                    recordProductEvent(window.localStorage, {
                      name: "feedback_submitted",
                      activityId: feedback.activityId,
                    });
                  }}
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
