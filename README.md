# WorkPulse

**Move more. Interrupt less.**

WorkPulse is a hackathon prototype for the Workplace Wellbeing track. It is an AI coworker that decides whether now is a good moment to interrupt a desk worker for a short movement break.

The core product principle is:

> Use deterministic logic for decisions that must be reliable; use AI for choices that benefit from flexibility.

## Current status

This repository contains:

- a runnable Next.js, TypeScript, and Tailwind starter;
- the canonical product and engineering specification in [`WORKPULSE_SPEC.md`](./WORKPULSE_SPEC.md);
- typed domain contracts;
- a deterministic decision-engine starter;
- a deterministic activity selector;
- browser-local persistence helpers;
- canonical demo scenarios.

The product UI has intentionally not been implemented yet.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run lint
npm run build
```

## Project structure

```text
app/                    Next.js App Router entry points
components/             Product UI components
data/demo-scenarios.ts  Stable scenarios for the live demo
lib/types.ts            Domain contracts
lib/decision-engine.ts  Reliable MOVE_NOW / NOT_NOW decision logic
lib/activity-selector.ts
lib/storage.ts          localStorage boundary
WORKPULSE_SPEC.md       Canonical product, engineering, and pitch spec
```

## Scope guardrail

P0 is complete only when the deployed demo reliably shows that a correct decision not to interrupt is as valuable as a decision to intervene. Camera verification, real calendar integration, authentication, and LLM personalization must not block that core loop.
