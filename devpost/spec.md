---
doc: spec
status: approved
---

# WorkPulse Timing Lab — Technical Spec

Revised after the decision to import the existing WorkPulse application. The baseline is the public `InnokentyB/workpulse` repository at commit `5c047ed1ae63a4d834e07025449dcd3bdc5e21c5`; the timing-feedback extension is implemented here. Status: approved implementation baseline.

## How This Works, In Plain Language

The existing application already decides whether movement fits a person's current work context. The new lab will show a sample workday and let the person respond to a suggestion. Explicit rules find the next suitable window, explain how the response affected it, and allow a reset for comparison. The sample and rules are labeled as a simulation, not a trained model.

## The Core Journey Through the System

The sample schedule provides a blocked moment and then an open one. The lab's pure timing decision supplies the WAIT/MOVE NOW card without changing the imported app's decision engine. The response rule uses Accept, Snooze or Dismiss plus later schedule windows to return a next time and reason. The page renders the result and timeline; Reset restores the start. Implements `prd.md > The Core Journey`.

## Stack

Retain the imported Next.js 16, React 19, TypeScript, CSS and Vitest setup, including its lockfile. This avoids rebuilding working context logic or introducing a second app stack. The new timing logic should be a pure module with focused tests. The source repository's pinned versions and dependencies must be checked at install time. Documentation: [Next.js](https://nextjs.org/docs), [React](https://react.dev/learn), [TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html), [Vitest](https://vitest.dev/guide/). No new external service is required for the lab.

## Where It Runs and How Someone Tries It

Run `npm ci` and `npm run dev`, then open the local URL shown by Next.js (normally `http://localhost:3000`). The lab must be accessible from the application's main screen or a clearly linked route. `npm test` and `npm run build` verify it. Record the required video from the browser. Public repository and video are required; deployment is optional. Demo mode uses no keys or account.

## Look and Feel

Use the imported application's established visual language while making the lab's timeline, decision and explanation easy to read. Calm, direct copy, no guilt or implied medical scoring. Implements `prd.md > Look and Feel`.

## Components

### Imported Context Decision

The imported `lib/decision-engine.ts` and `lib/calendar/context.ts` continue to power their original flows. The lab uses its own deterministic schedule gate in `lib/timing-lab/engine.ts`, so the imported behavior is unchanged. Implements `prd.md > Simulated Workday and Decision`.

### Workday Scenario

One explicit fictional schedule with blocked and open windows. Check that it exercises all three response branches. Implements `prd.md > Simulated Workday and Decision`.

### Feedback Timing Engine

A pure function maps schedule, current suggestion and response to the next valid time and reason code. It never recommends during a blocked interval; when none remains, it returns end of day. Snooze waits at least 20 minutes; Dismiss skips the present open window; Accept waits at least 90 minutes. These are demo parameters, not health guidance. Implements `prd.md > Response and Next Recommendation`, `States and Boundaries`.

### Lab Surface

A route or component in `app/` renders the timeline, current decision, response buttons, resulting explanation and reset. It must work alongside the imported app without requiring the camera or a live calendar. Implements `prd.md > Screens and Layout`, `Replay`.

## Data Model

Reuse existing context types where suitable. The new lab needs a fixed `Block { startMinute, endMinute, kind, label }`, `Response = accept|snooze|dismiss`, and `TimingResult { nextMinute?, reasonCode }`. The sample is source data; current position and response live in page memory and reset on reload. Display times are offsets within a fictional day.

## File Structure

```text
workpulse-timing-lab/
├── app/                    # imported Next.js routes and styling
│   └── timing-lab/         # new focused page
├── components/             # imported UI; new lab UI as needed
├── data/                   # imported scenarios and new sample day
├── lib/                    # imported context logic and new feedback engine
├── devpost/                # Skill Pack scope, PRD and spec
├── public/                 # imported assets
├── package.json            # imported scripts and dependencies
├── package-lock.json
├── README.md               # setup, demo path and provenance
└── LICENSE                 # to add before public submission
```

Existing imported files remain unless a concrete conflict requires a change. Exact new filenames follow repository conventions.

## External Services and Dependencies

The new lab has no external runtime calls. Other imported application features may have optional integrations; demo mode must work without them. See imported `.env.example` and README before changing configuration.

## Important Failure Modes

- No suitable later window → show an end-of-day result and Reset.
- Imported context rule conflicts with sample timeline → reconcile definitions before rendering; never show MOVE NOW inside a blocked block.
- Camera or calendar permission unavailable → the lab remains usable with the fictional schedule.

## What Was Simplified and Why

The new experiment uses a fixed day and explicit rules; it does not add real calendar synchronization, learned preferences or more activity verification. The imported application remains the foundation, while the demo focuses on the new timing loop.

## Decisions

- **Learner choice:** Import the existing WorkPulse files into a separate repository and develop this feature there.
- **Implemented:** Keep the imported stack and add `/timing-lab`, a pure timing module, and a link in the main navigation.
- **Demo policy:** A five-minute suitable window; Accept +90 minutes, Snooze +20 minutes, Dismiss skips the current open interval. The sample day is fixed, and response state is not persisted.
- **Provenance:** Identify the imported baseline in the README/submission and distinguish the new extension. The baseline was created during the hackathon submission period, before registration.

## Character Game Extension

The optional `/play` experience adds movement-powered character scenes beside the Timing Lab. The implementation contract and branch catalog are in `character-game-tdpd.md`; acceptance checks are in `character-game-test-scenarios.md`. The user authorized this extension and implementation on 2 October 2026.

Two original SVG scenes share a six-cycle progression: Trail raises a traveler to a summit, Workshop assembles a lantern. Camera progress comes from the existing shoulder lift-and-return tracker. Explicit manual demo input is self-reported and unverified. A paused run retains progress; camera resume recalibrates. The game requires no Google credentials or live calendar, and has no persistent rewards in this slice.
