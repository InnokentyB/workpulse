# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is Alex, a remote product manager who spends most of the day at a laptop and ignores generic movement reminders because they arrive at inconvenient moments.

The initial buyer is an HR or People Operations lead responsible for employee wellbeing, sustainable work habits, and adoption of workplace programmes without adding disruptive overhead.

## Product Purpose

WorkPulse proves one idea: movement need alone is not enough to justify an interruption. The MVP succeeds when a viewer immediately understands why a 12-minute gap produces `MOVE NOW` while a 2-minute gap produces `NOT NOW`.

## Positioning

WorkPulse is a contextual coworker that can deliberately choose not to act. It balances movement need with interruption cost and explains the decisive context in plain language.

## Operating Context

The MVP is a responsive, single-page web demo for a laptop pitch and a 360px mobile viewport. It uses exactly two fixed scenarios and requires no setup or external services.

The initial commercial hypothesis is a limited team pilot, followed by per-active-employee software pricing and an enterprise tier for integrations, governance, and support. Pricing, willingness to pay, procurement, and employer outcomes remain unvalidated until tested with buyers.

## Capabilities and Constraints

- Show sedentary time, time to the next meeting, and time since the last movement.
- Identify calendar context as demo data and keep camera state visible at all times.
- Deterministically return `MOVE NOW` or `NOT NOW`, movement need, interruption cost, and a reason.
- Offer two prototype activities only for `MOVE NOW`: a 45-second neck reset and 60-second shoulder rolls.
- Support optional on-device verification for four guided neck movements, plus a manual fallback.
- Guide shoulder rolls on screen without requesting camera access.
- Keep a browser-only history of completed activities with time, estimated duration, verification mode, and movement count when local storage is available; summarize today's count and the latest completion.
- Request camera access only during the activity and stop it immediately after completion or cancellation.
- Never record, store, upload, or play back video, and never request microphone access.
- Work without authentication, real calendar access, a database, cross-device persistence, or an LLM service.
- Frame activities as workplace-wellbeing suggestions, not medical advice.
- Distinguish working product evidence from roadmap capabilities and unvalidated commercial hypotheses.

## Brand Commitments

The product name is WorkPulse. The tagline is “Move more. Interrupt less.” The voice is calm, direct, transparent, and non-judgmental. `MOVE NOW` and `NOT NOW` must have equal visual authority.

## Evidence on Hand

`WORKPULSE_SPEC.md` is the canonical MVP contract. The working demo, deterministic decision logic, automated tests, and optional on-device verification are available as product evidence. No validated customer pricing, paid pilots, testimonials, clinical evidence, measured employer ROI, or production integrations are present and none may be fabricated.

## Product Principles

1. Do not interrupt unless useful.
2. Context beats fixed schedules.
3. Explain every decision.
4. Keep the demonstration deterministic and repeatable.
5. Make every sensor and data source visible before it can influence a decision.

## Accessibility & Inclusion

All controls must be keyboard accessible, show visible focus states, use semantic labels, and communicate decisions through text rather than color alone.
