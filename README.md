# WorkPulse

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
deployment credentials and a migrated PostgreSQL database. The `/account`
route implements Google sign-in, separate calendar consent, encrypted token
storage, connection removal, and account deletion; it remains in a clear setup
state until those deployment settings are supplied.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Product demo: [http://localhost:3000](http://localhost:3000)
- Commercial presentation: [http://localhost:3000/for-teams](http://localhost:3000/for-teams)

## Verify

```bash
npm run lint
npm test
npm run build
```

Account setup also requires the server variables in `.env.example` and the
PostgreSQL migration:

```bash
npm run db:migrate
```

## Project structure

```text
app/                    Next.js App Router entry points, including /roadmap
app/api/calendar/       Safe provider discovery endpoint
app/account/            Account and calendar connection settings
components/             Responsive product UI and interaction tests
db/migrations/          PostgreSQL account and connection schema
data/demo-scenarios.ts  Stable scenarios for the live demo
lib/calendar/           Provider contracts, registry, Google adapter, context
lib/types.ts            Domain contracts
lib/decision-engine.ts  Reliable MOVE_NOW / NOT_NOW decision logic and tests
lib/activity-selector.ts
WORKPULSE_SPEC.md       Canonical product, engineering, and pitch spec
```

## Scope guardrail

The MVP exists only to prove that a correct decision not to interrupt is as
valuable as a decision to intervene. Dismissal cooldowns, personalization,
continuous camera monitoring, video recording, live calendar authorization,
authentication, databases, and LLM dependencies are explicitly outside this
slice. Provider-neutral calendar infrastructure is present, but the demo still
uses labelled fixed calendar data until the connection flow is implemented.
