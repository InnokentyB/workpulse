"use client";

import { useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SAMPLE_DAY } from "@/data/timing-lab/sample-day";
import { formatMinute, getDecisionAt, getNextDecision } from "@/lib/timing-lab/engine";

type Response = "accept" | "snooze" | "dismiss";

const responseLabels: Record<Response, string> = {
  accept: "Accept",
  snooze: "Snooze",
  dismiss: "Dismiss",
};

export function TimingLab() {
  const [minute, setMinute] = useState(SAMPLE_DAY.initialMinute ?? SAMPLE_DAY.startMinute);
  const [response, setResponse] = useState<Response | null>(null);
  const atSuggestion = minute === SAMPLE_DAY.suggestionMinute;
  const initial = getDecisionAt(SAMPLE_DAY, minute);
  const decision = response
    ? getNextDecision(SAMPLE_DAY, response, SAMPLE_DAY.suggestionMinute)
    : initial;

  function reset() {
    setMinute(SAMPLE_DAY.initialMinute ?? SAMPLE_DAY.startMinute);
    setResponse(null);
  }

  return (
    <main className="app-shell timing-lab">
      <SiteHeader current="lab" />
      <header className="timing-lab__intro">
        <p className="timing-lab__eyebrow">WorkPulse / Timing Lab</p>
        <h1>A better moment to move.</h1>
        <p>
          Explore one fictional workday. See how a meeting and your response
          change the next movement suggestion.
        </p>
      </header>

      <div className="timing-lab__grid">
        <section className="timing-lab__schedule" aria-labelledby="lab-schedule">
          <div className="timing-lab__section-head">
            <div>
              <p className="timing-lab__eyebrow">01 / Context</p>
              <h2 id="lab-schedule">The workday</h2>
            </div>
            <span className="timing-lab__clock"><small>Moment explored</small>{formatMinute(minute)}</span>
          </div>
          <p className="timing-lab__hint">A fixed simulation, not your live calendar.</p>
          <ol className="timing-lab__blocks">
            {SAMPLE_DAY.blocks.map((block) => (
              <li
                key={`${block.startMinute}-${block.label}`}
                data-current={block.startMinute <= minute && minute < block.endMinute ? "true" : undefined}
              >
                <span>{formatMinute(block.startMinute)}–{formatMinute(block.endMinute)}</span>
                <strong>{block.label}</strong>
                <small>{block.kind}</small>
              </li>
            ))}
          </ol>
          <div className="timing-lab__milestones" aria-label="Simulation progress">
            <span aria-current={!atSuggestion && !response ? "step" : undefined}>Meeting conflict</span>
            <span aria-current={atSuggestion && !response ? "step" : undefined}>Open window</span>
            <span aria-current={response ? "step" : undefined}>Next decision</span>
          </div>
          {!atSuggestion && !response && (
            <button
              className="button button--primary"
              type="button"
              onClick={() => setMinute(SAMPLE_DAY.suggestionMinute)}
            >
              Advance to open window
            </button>
          )}
          <button className="button timing-lab__reset" type="button" onClick={reset}>
            Reset workday
          </button>
        </section>

        <section className="timing-lab__decision" aria-label="Timing decision">
          <p className="timing-lab__eyebrow">02 / Decision</p>
          <div aria-live="polite" aria-atomic="true">
            <h2 id="lab-decision">
              {decision.kind === "END_OF_DAY" ? "No suitable window remains today" : response ? "NEXT MOVE WINDOW" : decision.kind === "MOVE_NOW" ? "MOVE NOW" : "WAIT"}
            </h2>
            {response && (
              <p className="timing-lab__result-label">After {responseLabels[response].toLowerCase()}</p>
            )}
            {decision.minute !== null && (
              <p className="timing-lab__next-time">
                {response ? "Next suggested time" : decision.kind === "WAIT" ? "Next available window" : "Current suggestion"}: <strong>{formatMinute(decision.minute)}</strong>
              </p>
            )}
            <p className="timing-lab__reason">{decision.reason}</p>
          </div>

          {atSuggestion && !response && decision.kind === "MOVE_NOW" && (
            <fieldset className="timing-lab__responses">
              <legend>What would you do?</legend>
              {(Object.keys(responseLabels) as Response[]).map((choice) => (
                <button className="button button--quiet" type="button" key={choice} onClick={() => setResponse(choice)}>
                  {responseLabels[choice]}
                </button>
              ))}
            </fieldset>
          )}
        </section>
      </div>
      <p className="timing-lab__footnote">
        Timing rules are illustrative. This simulation does not use a real calendar or provide medical advice.
      </p>
      <SiteFooter />
    </main>
  );
}
