# WorkPulse

## Build With AI: Basics project

This repository imports the WorkPulse baseline from
[`InnokentyB/workpulse`](https://github.com/InnokentyB/workpulse) at commit
`5c047ed1ae63a4d834e07025449dcd3bdc5e21c5` (created during the
hackathon submission period). The new work for this entry is the
**Timing Lab** feedback loop: after Accept, Snooze or Dismiss, show the next
appropriate movement window and explain the change. See
[`devpost/scope.md`](./devpost/scope.md), [`devpost/prd.md`](./devpost/prd.md), and
[`devpost/spec.md`](./devpost/spec.md). Branches and acceptance cases are in
[`devpost/user-scenarios.md`](./devpost/user-scenarios.md) and
[`devpost/test-scenarios.md`](./devpost/test-scenarios.md). The existing features
described below are the imported baseline.

### Timing Lab demo

Open [http://localhost:3000/timing-lab](http://localhost:3000/timing-lab), or
follow **Timing Lab** from the main navigation. The fictional day starts in a
meeting at 09:10. Advance to the 09:30 opening, then try Accept, Snooze, and
Dismiss, resetting between branches. Their next suitable windows are 11:00,
09:50, and 10:30 respectively. The five-minute break requirement and 20/90-minute
response delays are illustrative demo rules, not health guidance. The lab needs
no calendar connection, camera, account, environment variables, or external
runtime service. Responses live only in page memory.

### Movement game

Open `/play` and choose **Forest trail** or **Workshop**. Each of six completed
cycles advances the traveler or assembles a lantern. Manual self-report can
demonstrate the complete game without a camera; its result is unverified.
Optional camera mode counts shoulder lift-and-return proxy cycles using the
existing on-device tracker. It does not assess exercise form or full rotation.
Pause preserves the count, and camera resume requires fresh calibration. A new
run resets the scene. No game progress or reward is persisted in this version.
Automated tests use mocked camera landmarks; real webcam recognition and a
responsive browser walkthrough still need hands-on validation.

The feature's TDPD and test catalog are
[`devpost/character-game-tdpd.md`](./devpost/character-game-tdpd.md) and
[`devpost/character-game-test-scenarios.md`](./devpost/character-game-test-scenarios.md).
The current traceability matrix, completed checks and open manual acceptance
gates are in [`devpost/character-game-validation.md`](./devpost/character-game-validation.md).

**Move more. Interrupt less.**

WorkPulse is a hackathon prototype for the Workplace Wellbeing track. It is an AI coworker that decides whether now is a good moment to interrupt a desk worker for a short movement break.

The core product principle is:

> Use deterministic logic for decisions that must be reliable; use AI for choices that benefit from flexibility.

## Current status

The MVP is a responsive single-page demo built around one proof: two contexts
with high movement need produce different decisions because interruption cost
is different. It includes deterministic `MOVE NOW` / `NOT NOW` decisions,
clear explanations, two selectable activities, and a minimal `Start → Done` loop.
The context panel labels the calendar input as demo data. During the movement
activity, the user can explicitly enable the browser camera and let an on-device
pose model guide a four-movement neck reset. The shoulder-roll activity can use
the same optional camera flow to check six lift-and-return cycles on-device, with
manual completion available for either activity. Video is never recorded,
stored, or uploaded, and the camera stops when verification completes. Completed
activities are recorded in a local, browser-only history with time, duration,
verification mode, and movement count; the history also summarizes today's count
and the latest activity.

The `/for-teams` route presents the buyer story for HR and People Operations:
the interruption problem, WorkPulse's contextual decision model, a bounded
pilot, validation metrics, and explicitly labelled commercial hypotheses. It
does not claim validated pricing or employer outcomes.

The canonical product and engineering specification remains
[`WORKPULSE_SPEC.md`](./WORKPULSE_SPEC.md).

The `/roadmap` page translates the near-term direction from
[`PRODUCT_VISION.md`](./PRODUCT_VISION.md) into a public, clearly labelled view
of proposed, tentative, and exploratory features.

The first real-calendar infrastructure is provider-neutral and documented in
[`CALENDAR_INTEGRATION.md`](./CALENDAR_INTEGRATION.md). Google Calendar is the
primary adapter and reads free/busy data only; Microsoft, Apple, and generic
CalDAV are registered as planned providers. Live connection still requires
OAuth endpoints, server-side encrypted token storage, and deployment
credentials.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Product demo: [http://localhost:3000](http://localhost:3000)
- Commercial presentation: [http://localhost:3000/for-teams](http://localhost:3000/for-teams)
- Timing Lab: [http://localhost:3000/timing-lab](http://localhost:3000/timing-lab)
- Movement game: [http://localhost:3000/play](http://localhost:3000/play)
- Google Calendar inspector: [http://localhost:3000/calendar](http://localhost:3000/calendar) (requires local OAuth configuration; see [`CALENDAR_INTEGRATION.md`](./CALENDAR_INTEGRATION.md))

## Verify

```bash
npm run lint
npm test
npm run build
```

## Project structure

```text
app/                    Next.js App Router entry points, including /roadmap
app/api/calendar/       Safe provider discovery endpoint
components/             Responsive product UI and interaction tests
data/demo-scenarios.ts  Stable scenarios for the live demo
lib/calendar/           Provider contracts, registry, Google adapter, context
lib/types.ts            Domain contracts
lib/decision-engine.ts  Reliable MOVE_NOW / NOT_NOW decision logic and tests
lib/activity-selector.ts
WORKPULSE_SPEC.md       Canonical product, engineering, and pitch spec
```

## Scope guardrail

The core MVP proves that a decision not to interrupt is as valuable as a
decision to intervene. The main demo uses labelled fixed calendar data.
The separately approved Timing Lab, optional movement game and Google Calendar
inspector extend that baseline. Live calendar access requires local OAuth
configuration. Continuous camera monitoring, video recording, persistent game
rewards, databases and LLM dependencies remain outside this slice.
