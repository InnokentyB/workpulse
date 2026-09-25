import type { Metadata } from "next";
import Link from "next/link";

import { ArrowIcon, PulseMark } from "@/components/icons";

export const metadata: Metadata = {
  title: "WorkPulse for Teams — Wellbeing without the interruption tax",
  description:
    "See how WorkPulse turns context-aware movement prompts into a measurable, privacy-conscious workplace wellbeing pilot.",
};

const pilotSignals = [
  ["Activation", "Do employees opt in when the value is clear?"],
  ["Timing quality", "Did the suggestion arrive at a useful moment?"],
  ["Follow-through", "Was the suggested micro-activity completed?"],
  ["Restraint", "How often did WorkPulse correctly choose not to interrupt?"],
] as const;

const commercialSteps = [
  {
    name: "Pilot",
    audience: "One team · up to 150 people",
    price: "€2.5k–€5k",
    unit: "fixed · 6 weeks",
    detail:
      "A bounded test of adoption, timing quality, privacy expectations, and the buyer’s reporting needs.",
  },
  {
    name: "Team",
    audience: "Distributed knowledge teams",
    price: "€4–€8",
    unit: "active employee / month",
    detail:
      "Annual software access with contextual interventions, personal controls, and aggregate programme signals.",
  },
  {
    name: "Enterprise",
    audience: "Multi-team organisations",
    price: "€25k+",
    unit: "annual platform minimum",
    detail:
      "Governance, SSO, calendar and collaboration integrations, deployment support, and agreed reporting boundaries.",
  },
] as const;

export default function ForTeamsPage() {
  return (
    <main className="business-page">
      <template
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html: `<!--
THESIS: Employee attention is a finite workplace resource; this page refuses the generic wellness-benefits catalogue and makes interruption quality the commercial argument.
OWN-WORLD: Warm paper, ink-green signal fields, brown hold states, ruled ledgers, lime action cues, and measured Geist typography extend the WorkPulse signal desk.
STORY: See the interruption problem, understand the decision mechanism, compare employee and buyer value, then inspect a pilot and a clearly labelled pricing hypothesis.
FIRST VIEWPORT: A large argument occupies the left while a live-looking two-column interruption ledger on the right contrasts a fixed reminder with a contextual HOLD decision; the demo action sits in the header and repeats after the pilot model.
FORM: Interruption ledger, grounded structure 3 of 7, surface seed aa0860ff; code-led execution.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`,
        }}
      />

      <header className="business-header">
        <Link className="brand" href="/" aria-label="WorkPulse home">
          <PulseMark />
          <span>WorkPulse</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link className="business-nav-link" href="/">
            Product demo
          </Link>
          <a className="button button--business" href="#pilot-model">
            Pilot model <ArrowIcon />
          </a>
        </nav>
      </header>

      <section className="business-hero" aria-labelledby="business-title">
        <div className="business-hero__argument">
          <h1 id="business-title">
            <span className="business-title--desktop">The problem is not the break. It is the wrong interruption.</span>
            <span className="business-title--mobile">A break at the wrong moment is another interruption.</span>
          </h1>
          <p>
            WorkPulse helps desk workers move when a useful window appears —
            and stays quiet when focus or a meeting matters more.
          </p>
          <div className="business-hero__actions">
            <Link className="button button--business" href="/">
              See the live decision <ArrowIcon />
            </Link>
            <a className="business-text-link" href="#commercial-model">
              Explore the business model
            </a>
          </div>
        </div>

        <div className="interruption-ledger" aria-label="Interruption decision comparison">
          <div className="ledger-heading">
            <span>Same movement need</span>
            <strong>Different decision</strong>
          </div>
          <div className="ledger-context">
            <div>
              <span>Sedentary time</span>
              <strong>72 min</strong>
            </div>
            <div>
              <span>Next meeting</span>
              <strong>2 min</strong>
            </div>
          </div>
          <div className="ledger-comparison">
            <div className="ledger-row ledger-row--timer">
              <div>
                <span>Fixed reminder</span>
                <strong>MOVE NOW</strong>
              </div>
              <p>Timer expired. Context ignored.</p>
            </div>
            <div className="ledger-row ledger-row--pulse">
              <div>
                <span>WorkPulse</span>
                <strong>NOT NOW</strong>
              </div>
              <p>High need, but the interruption cost is higher.</p>
            </div>
          </div>
          <p className="ledger-conclusion">
            Restraint is not a missing notification. It is the product working.
          </p>
        </div>
      </section>

      <section className="business-problem" aria-labelledby="problem-title">
        <div className="section-intro">
          <h2 id="problem-title">Generic reminders lose in both directions.</h2>
          <p>
            A schedule cannot see the difference between a natural pause and
            the two minutes before an important call.
          </p>
        </div>
        <div className="problem-ledger">
          <article>
            <h3>Too early: the prompt becomes noise.</h3>
            <p>People dismiss it, mute it, and learn that wellbeing software is another demand on attention.</p>
          </article>
          <article>
            <h3>Too late: the useful window has already closed.</h3>
            <p>Movement turns into a task for later, then disappears behind the next block of work.</p>
          </article>
          <article>
            <h3>Too opaque: HR can buy activity, not trust.</h3>
            <p>Without a reason, employees cannot tell whether the prompt respects their day or simply follows a timer.</p>
          </article>
        </div>
      </section>

      <section className="decision-mechanism" aria-labelledby="mechanism-title">
        <div className="mechanism-copy">
          <h2 id="mechanism-title">WorkPulse looks for an intervention window.</h2>
          <p>
            It weighs the need to move against the cost of stopping now. The
            result is one explainable call, not a stream of reminders.
          </p>
          <dl className="mechanism-definitions">
            <div>
              <dt>Movement need</dt>
              <dd>Sedentary time and time since the last activity.</dd>
            </div>
            <div>
              <dt>Opportunity</dt>
              <dd>The usable gap before the next known commitment.</dd>
            </div>
            <div>
              <dt>Interruption cost</dt>
              <dd>Whether acting now would collide with the workday.</dd>
            </div>
          </dl>
        </div>

        <div className="decision-equation" aria-label="WorkPulse decision logic">
          <div className="equation-input">
            <span>Need</span>
            <strong>High</strong>
          </div>
          <span className="equation-symbol" aria-hidden="true">×</span>
          <div className="equation-input">
            <span>Opportunity</span>
            <strong>Low</strong>
          </div>
          <span className="equation-symbol" aria-hidden="true">→</span>
          <div className="equation-output">
            <span>Useful action</span>
            <strong>HOLD</strong>
            <p>Check again after the meeting.</p>
          </div>
        </div>
      </section>

      <section className="two-sided-value" aria-labelledby="value-title">
        <h2 id="value-title">One decision. Value on both sides.</h2>
        <div className="value-sides">
          <article className="value-side value-side--employee">
            <h3>For employees, a small intervention earns the right to interrupt.</h3>
            <ul>
              <li>A reason for every recommendation</li>
              <li>Short activities that fit the available moment</li>
              <li>Freedom to decline without guilt or repeated nagging</li>
              <li>Explicit, optional, on-device camera guidance</li>
            </ul>
          </article>
          <article className="value-side value-side--buyer">
            <h3>For People Ops, wellbeing is designed around adoption, not volume.</h3>
            <ul>
              <li>A low-setup pilot for one real team</li>
              <li>Aggregate programme signals, never a manager view of individuals</li>
              <li>Clear boundaries for data, consent, and integrations</li>
              <li>A path from timing validation to enterprise rollout</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="pilot-model" id="pilot-model" aria-labelledby="pilot-title">
        <div className="section-intro section-intro--inverse">
          <h2 id="pilot-title">Start with a decision, not a deployment.</h2>
          <p>
            A six-week pilot should answer whether WorkPulse is useful enough
            to earn a place in the workday — before a company buys integrations
            or a broad rollout.
          </p>
        </div>
        <div className="pilot-structure">
          <div className="pilot-frame">
            <span>Proposed pilot</span>
            <strong>50–150</strong>
            <p>voluntary participants in one desk-based team</p>
          </div>
          <ol>
            <li><strong>Week 0</strong><span>Privacy review, team framing, and baseline expectations.</span></li>
            <li><strong>Weeks 1–4</strong><span>Use the product in real workdays and collect timing feedback.</span></li>
            <li><strong>Week 5</strong><span>Review aggregate signals and employee interviews.</span></li>
            <li><strong>Week 6</strong><span>Decide: stop, refine, or expand with integrations.</span></li>
          </ol>
        </div>
        <div className="pilot-signals" aria-label="Pilot measurement plan">
          {pilotSignals.map(([name, description]) => (
            <div key={name}>
              <strong>{name}</strong>
              <span>{description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="commercial-model" id="commercial-model" aria-labelledby="commercial-title">
        <div className="commercial-heading">
          <div>
            <h2 id="commercial-title">Land with a pilot. Expand with evidence.</h2>
            <p>
              The cleanest model is B2B SaaS priced per active employee, with a
              paid pilot up front and a platform minimum when enterprise work begins.
            </p>
          </div>
          <p className="hypothesis-note">
            Pricing below is a validation hypothesis, not a published offer.
          </p>
        </div>

        <div className="commercial-steps">
          {commercialSteps.map((step) => (
            <article key={step.name}>
              <div className="commercial-step__name">
                <strong>{step.name}</strong>
                <span>{step.audience}</span>
              </div>
              <div className="commercial-step__price">
                <strong>{step.price}</strong>
                <span>{step.unit}</span>
              </div>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>

        <div className="commercial-logic">
          <p>
            <strong>Why this model:</strong> the buyer can fund a bounded test,
            the product earns expansion through usage, and enterprise complexity
            is priced only when governance and integrations become real work.
          </p>
          <p>
            <strong>Later, not first:</strong> insurer distribution, benefit
            marketplaces, and white-label partnerships may reduce acquisition
            cost, but they should follow direct buyer validation.
          </p>
        </div>
      </section>

      <section className="business-close" aria-labelledby="close-title">
        <PulseMark />
        <h2 id="close-title">A wellbeing product should protect attention while it protects movement.</h2>
        <p>
          The working demo already proves the core behaviour: sometimes the
          best intervention is the one WorkPulse decides not to make.
        </p>
        <Link className="button button--business" href="/">
          Try both decisions <ArrowIcon />
        </Link>
      </section>

      <footer className="business-footer">
        <span>WorkPulse</span>
        <p>Commercial assumptions are for validation. Activity suggestions are not medical advice.</p>
      </footer>
    </main>
  );
}
