# WorkPulse

**Move more. Interrupt less.**

WorkPulse is a hackathon prototype for the Workplace Wellbeing track. It is an AI coworker that decides whether now is a good moment to interrupt a desk worker for a short movement break.

The core product principle is:

> Use deterministic logic for decisions that must be reliable; use AI for choices that benefit from flexibility.

## Current status

The MVP is a responsive single-page demo built around one proof: two contexts
with high movement need produce different decisions because interruption cost
is different. It includes deterministic `MOVE NOW` / `NOT NOW` decisions,
clear explanations, one fixed activity, and a minimal `Start → Done` loop.
The context panel labels the calendar input as demo data. During the movement
activity, the user can explicitly enable the browser camera and let an on-device
pose model guide a four-movement neck reset. Video is never recorded, stored, or
uploaded, and the camera stops when verification completes. Completed activities
are recorded in a local, browser-only history with time, duration, verification
mode, and movement count.

The canonical product and engineering specification remains
[`WORKPULSE_SPEC.md`](./WORKPULSE_SPEC.md).

The `/roadmap` page translates the near-term direction from
[`PRODUCT_VISION.md`](./PRODUCT_VISION.md) into a public, clearly labelled view
of proposed, tentative, and exploratory features.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run lint
npm test
npm run build
```

## Project structure

```text
app/                    Next.js App Router entry points, including /roadmap
components/             Responsive product UI and interaction tests
data/demo-scenarios.ts  Stable scenarios for the live demo
lib/types.ts            Domain contracts
lib/decision-engine.ts  Reliable MOVE_NOW / NOT_NOW decision logic and tests
lib/activity-selector.ts
WORKPULSE_SPEC.md       Canonical product, engineering, and pitch spec
```

## Scope guardrail

The MVP exists only to prove that a correct decision not to interrupt is as
valuable as a decision to intervene. Dismissal cooldowns, personalization,
continuous camera monitoring, video recording, real calendar integration,
authentication, databases, and LLM
dependencies are explicitly outside this slice.
