import type { Metadata } from "next";
import Link from "next/link";

import { ArrowIcon } from "@/components/icons";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "What’s next — WorkPulse",
  description:
    "The proposed next product slices for WorkPulse, grounded in the product vision.",
};

const nearTermFeatures = [
  {
    title: "Real calendar connection",
    detail:
      "With explicit permission, replace fixed demo context with upcoming events and free windows from the person’s own calendar.",
    signal: "First integration priority",
  },
  {
    title: "Workday boundaries",
    detail:
      "Let people define when work starts, when it should end, and when ordinary movement prompts should stay quiet.",
    signal: "Protect time outside work",
  },
  {
    title: "Meal and long-break windows",
    detail:
      "Find a useful calendar gap inside a user-defined window without food logging, calorie scoring, or moral language.",
    signal: "Protect a routine, not judge it",
  },
  {
    title: "Activities that fit the moment",
    detail:
      "Choose by available time and whether the person can stand, leave the desk, or briefly look away from the screen.",
    signal: "Now in prototype",
  },
  {
    title: "A practical starter library",
    detail:
      "Add seated neck and shoulder movement, an eye-distance break, standing mobility, and a five-minute walk.",
    signal: "Six local activities",
  },
  {
    title: "Preferences and exclusions",
    detail:
      "Let people rule out unsuitable activities and state what is possible in their current workspace.",
    signal: "User constraints always win",
  },
] as const;

const nextFeatures = [
  "Learn from completion and dismissal without turning activity into a streak.",
  "Understand whether a meeting is audio-only, interactive, or presenting.",
  "Keep notification controls private and provide export and deletion.",
  "Support user-defined medication or therapy schedules only after privacy, reliability, and safety review.",
] as const;

const exploration = [
  "Optional on-device posture checks",
  "Ergonomic workspace self-assessment",
  "Daylight and evening-screen routines",
  "Temperature and CO₂ sensor integrations",
  "Wearables, walking pads, and standing desks",
] as const;

export default function RoadmapPage() {
  return (
    <main className="app-shell roadmap-page">
      <SiteHeader current="roadmap" />

      <section className="roadmap-intro">
        <div>
          <h1>From one good decision to a calmer working day.</h1>
        </div>
        <div className="roadmap-intro__copy">
          <p>
            WorkPulse begins with movement timing. The next version should
            coordinate a few user-owned routines without becoming another
            dashboard to manage.
          </p>
          <span>Proposed direction, not a release promise.</span>
          <small>Product direction · September 2026</small>
        </div>
      </section>

      <ol className="phase-rail" aria-label="Product development phases">
        <li data-state="done">
          <span>P0</span>
          <strong>Context proof</strong>
          <small>Working now</small>
        </li>
        <li data-state="next">
          <span>P0.5</span>
          <strong>Personal prototype</strong>
          <small>Proposed next</small>
        </li>
        <li data-state="later">
          <span>P1</span>
          <strong>Private routines</strong>
          <small>Tentative</small>
        </li>
      </ol>

      <section className="roadmap-focus" aria-labelledby="near-term-heading">
        <aside>
          <h2 id="near-term-heading">Useful for one real workday.</h2>
          <p>Proposed next slice · P0.5</p>
          <span>
            The goal is usefulness without adding medical complexity. This
            slice depends on local settings, schedule persistence, and one
            arbitration system for competing prompts.
          </span>
        </aside>

        <div className="feature-register">
          {nearTermFeatures.map((feature) => (
            <article key={feature.title}>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.detail}</p>
              </div>
              <strong>{feature.signal}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-next" aria-labelledby="next-heading">
        <div className="roadmap-next__heading">
          <h2 id="next-heading">Adapt privately, after the foundations hold.</h2>
          <p>Tentative follow-on · P1</p>
        </div>
        <ul>
          {nextFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className="roadmap-explore" aria-labelledby="explore-heading">
        <div>
          <h2 id="explore-heading">Ambient assistance</h2>
          <p>Exploratory, not committed</p>
        </div>
        <ul>
          {exploration.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="roadmap-guardrails" aria-labelledby="guardrails-heading">
        <div>
          <h2 id="guardrails-heading">The boundaries do not move.</h2>
          <p>
            User-owned data, explicit permissions, no employer surveillance,
            no medical diagnosis, and no raw camera retention by default.
          </p>
        </div>
        <Link className="button button--evaluate" href="/">
          Return to live demo <ArrowIcon />
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
