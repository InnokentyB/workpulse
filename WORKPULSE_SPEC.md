# WorkPulse — Canonical Product & Engineering Specification

**Version:** 0.4  
**Date:** 25 September 2026  
**Track:** Workplace Wellbeing  
**Tagline:** Move more. Interrupt less.  
**Product promise:** The AI coworker that knows when to get you away from your computer.

This document is the single source of truth for the WorkPulse hackathon prototype. Where earlier ideas conflict with this document, this document wins.

---

## 1. Executive summary

WorkPulse is a contextual workplace-wellbeing agent for people who spend most of the day at a computer. Its central ability is not reminding a person to move. Its central ability is deciding whether movement is worth interrupting the person **right now**.

The core demonstration compares two superficially similar situations:

- after 57 sedentary minutes with 12 minutes before the next meeting, WorkPulse says `MOVE NOW`;
- after 72 sedentary minutes with only 2 minutes before the next meeting, WorkPulse says `NOT NOW`.

The second decision matters as much as the first. That contrast is the clearest evidence that WorkPulse is a contextual agent rather than a timer.

---

## 2. User need

### 2.1 Context

Desk-based workers often spend long, uninterrupted periods in front of a computer. Most already know they should stand, walk, stretch, or exercise periodically. The problem is execution during the workday.

Fixed reminders ignore context. They can fire two minutes before a meeting, during focused work, immediately after the user has moved, or after the same suggestion has already been rejected several times. Because these reminders are poorly timed, users dismiss them and eventually stop noticing them.

### 2.2 Core need

> Help me stay physically active during a desk-based workday without forcing me to constantly think about it and without unnecessarily interrupting my work.

The user should not have to maintain another habit tracker or continually decide when a break fits. WorkPulse should make a small, explainable decision on the user's behalf while leaving the user free to accept or decline it.

### 2.3 Problem statement

Conventional products ask:

> When should the next reminder fire?

WorkPulse asks:

> Given the user's current work context and recent behaviour, should I interrupt them now, and if so, what is the smallest useful intervention?

---

## 3. Jobs To Be Done

### Primary JTBD

> When I am absorbed in desk work, help me take short physical breaks at appropriate moments, so that I move regularly without managing reminders myself or disrupting important work.

### Supporting jobs

| Job | JTBD statement |
|---|---|
| Timing | When my workday is busy, identify a moment when an interruption will cause minimal disruption. |
| Activity selection | When a movement break is appropriate, suggest something I can realistically complete in the available time and environment. |
| Accountability | When I accept an activity, make completion immediate and visible rather than turning it into another task to manage. |
| Adaptation | When I repeatedly accept or reject interventions, use that behaviour to make future suggestions less annoying and more useful. |
| Trust | When the system uses work context or a camera, explain what is processed and avoid retaining unnecessary sensitive data. |

---

## 4. Personas

### 4.1 Primary hackathon persona: Alex

Alex is a remote product manager who spends roughly eight hours a day at a laptop, alternating between meetings and focused work. Alex understands the value of movement but routinely ignores generic “time to stand up” notifications because they arrive at inconvenient moments.

Alex needs:

- almost no setup;
- a recommendation that fits the real workday;
- a short activity that can start immediately;
- freedom to decline without being nagged again;
- a clear reason for every intervention.

### 4.2 Broader target users

The same need applies to software engineers, analysts, designers, founders, support staff, and other knowledge workers who spend 6–10 hours per day at a computer.

### 4.3 Anti-persona for the MVP

The prototype is not designed for clinical rehabilitation, injury treatment, managed employee surveillance, professional athletic training, or users who require medically prescribed activity plans.

---

## 5. Canonical scope

### The five-line contract

> **Track:** Workplace Wellbeing  
> **Building:** An AI coworker that finds the least disruptive moment to get you moving.  
> **For:** A remote product manager who spends eight hours at a laptop and routinely ignores movement reminders.  
> **ONE feature:** WorkPulse decides whether now is a good moment to interrupt the user for movement.  
> **Done at 16:00:** A public web demo where two different workday situations produce the right `MOVE NOW` or `NOT NOW` decision, with a clear reason and an activity the user can complete.

### Scope rule

The product exists when the decision loop works. Camera verification, live calendar data, LLM personalization, authentication, and cloud persistence may enhance the story, but none defines the core product and none may block the public P0 demo.

---

## 6. Product hypothesis and success signals

### Hypothesis

> Context-aware movement interventions will be completed more often and dismissed less often than fixed-time reminders because they balance movement need with interruption cost.

### Hackathon success signals

- Judges understand the problem within 20 seconds.
- The two main scenarios produce visibly different, correct decisions.
- The reason behind each decision is understandable without technical explanation.
- The user can complete or dismiss an intervention without configuration.
- The demo works reliably from a public URL.

### Future product metrics

- recommendation acceptance rate;
- accepted-activity completion rate;
- dismissal rate;
- repeat dismissal rate for the same activity;
- interventions per active day;
- percentage of interventions made inside low-cost windows;
- user-reported interruption quality;
- retention after the novelty period.

These future metrics are not required for the hackathon build.

---

## 7. Product principles

### 7.1 Do not interrupt unless useful

A correct decision not to interrupt is as valuable as a decision to intervene.

### 7.2 Choose the smallest useful intervention

WorkPulse should not demand a workout. It should fit a useful 30–90-second action into the available window.

### 7.3 Context beats schedules

The system should reason about movement need, opportunity, and interruption cost rather than fire every fixed number of minutes.

### 7.4 Explain every decision

The user should see why WorkPulse chose `MOVE NOW` or `NOT NOW`. Hidden intelligence looks arbitrary and is harder to trust.

### 7.5 Verify without surveillance

If camera verification is enabled, it starts only after explicit user action. Raw video remains in the browser and is neither stored nor sent to a model or backend.

### 7.6 Deterministic where reliability matters; AI where flexibility helps

Hard scheduling gates, cooldowns, scores, and safety constraints are deterministic. AI may personalize the activity or wording after a reliable decision has already been made.

### 7.7 The user remains in control

Every recommendation can be declined. A decline creates a cooldown, not punishment, guilt, or an escalating notification.

---

## 8. Core product loop

```text
Observe work context
        ↓
Assess movement need
        ↓
Assess interruption cost
        ↓
Apply hard gates
        ↓
Decide MOVE NOW / NOT NOW
        ↓
Explain the decision
        ↓
If MOVE NOW, select a tiny activity
        ↓
User completes or dismisses it
        ↓
Persist the outcome locally
        ↓
Use history in the next decision
```

---

## 9. User scenarios

### US-01 — Good moment to move

> As a desk worker, when I have been sitting for a long time and have a sufficient gap before my next commitment, I want WorkPulse to suggest a short activity so that I can move without disrupting my work.

Input:

```text
Sitting: 57 minutes
Next meeting: 12 minutes
Last activity: 78 minutes ago
```

Expected result:

```text
MOVE NOW
Movement need: HIGH
Interruption cost: LOW
Suggested activity: 10 squats, less than one minute
```

### US-02 — Bad moment despite high need

> As a desk worker, when I need movement but an important commitment is about to start, I want WorkPulse not to interrupt me and to reconsider later.

Input:

```text
Sitting: 72 minutes
Next meeting: 2 minutes
Last activity: 90 minutes ago
```

Expected result:

```text
NOT NOW
Movement need: HIGH
Interruption cost: HIGH
Reason: Your meeting starts in 2 minutes. I'll check again afterwards.
```

### US-03 — Low movement need

> As a desk worker who moved recently, I do not want WorkPulse to interrupt me merely because a free calendar window exists.

Input:

```text
Sitting: 25 minutes
Next meeting: 30 minutes
Last activity: 25 minutes ago
```

Expected result: `NOT NOW` because movement need is low.

### US-04 — Accept and complete an activity

> When WorkPulse proposes an activity, I want to start it immediately without configuring anything.

Flow:

```text
MOVE NOW → Start → Activity session → Complete → Outcome saved
```

### US-05 — Dismiss an activity

> When an activity is inconvenient, I want to decline it without being bothered again immediately.

Flow:

```text
MOVE NOW → Not now → Dismissal saved → 15-minute cooldown
```

### US-06 — Adapt the recommendation

> When I repeatedly reject one activity and complete another, I want WorkPulse to favour the activity I actually respond to.

Example history:

```text
Squats: 1 completed, 3 dismissed
Stretch: 4 completed, 1 dismissed
```

Expected next selection: `60-second shoulder stretch`.

This is a P1 scenario and must not delay P0.

---

## 10. MVP scope

### P0 — must ship

- Single responsive web page.
- Visible work context: sedentary time, next meeting, last movement.
- Demo selector with at least the good-window, meeting-soon, and low-need scenarios.
- Deterministic decision engine with hard gates and scoring.
- `MOVE NOW` and `NOT NOW` states.
- Visible movement-need and interruption-cost levels.
- Plain-language explanation of every decision.
- Deterministic activity suggestion after `MOVE NOW`.
- `Start`, `Complete`, and `Not now` actions.
- Local intervention history.
- Cooldown after dismissal.
- Public deployment.

### P1 — only after deployed P0 passes acceptance

- Preference-aware activity selection from local history.
- Optional LLM-generated wording or activity personalization with schema validation and deterministic fallback.
- More polished transitions and activity timer.

### P2 — wow feature

- User-initiated, on-device camera verification for squats.

### P3 — post-hackathon

- Real calendar integration.
- Background scheduling.
- Richer behavioural learning.
- Multiple device support.

---

## 11. Definition of Done

By 16:00, a public web demo exists in which different workday states produce appropriate `MOVE NOW` or `NOT NOW` decisions, WorkPulse explains each decision, and the user can complete or dismiss a proposed activity. The outcome persists and is available to the next decision.

### Required acceptance cases

| ID | Scenario | Expected outcome |
|---|---|---|
| A | Sitting 57 min; meeting in 12 min; last activity 78 min ago | `MOVE NOW` with high need, low cost, explanation, and activity |
| B | Sitting 72 min; meeting in 2 min; last activity 90 min ago | `NOT NOW` because the meeting gate overrides movement score |
| C | Sitting 25 min; meeting in 30 min; last activity 25 min ago | `NOT NOW` because movement need is low |
| D | User starts and completes activity | `completed` record appears in history |
| E | User selects `Not now` | `dismissed` record is saved and cooldown prevents immediate repetition |
| F | Page reload after recorded outcome | Local history remains available |

### Operational acceptance

- Demo is reachable at a public HTTPS URL.
- It works in a clean/incognito browser session.
- It works without Google Calendar, authentication, camera permission, or an LLM API.
- Core paths work at a mobile viewport even if the live pitch uses a laptop.
- A backup recording or screenshots exist before submission.

---

## 12. Engineering architecture

The hackathon build is a single Next.js application. A distributed system, database, authentication service, and job scheduler are unnecessary.

```text
┌──────────────────────────────────┐
│ Web UI                           │
│ context · scenarios · decision   │
│ activity flow · history          │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│ Deterministic Decision Engine    │
│ hard gates · scores · reasons    │
└────────────────┬─────────────────┘
                 │ MOVE NOW only
                 ▼
┌──────────────────────────────────┐
│ Activity Selector                │
│ deterministic default/fallback   │
│ optional validated LLM in P1     │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│ Browser-local Persistence        │
│ intervention history · outcomes  │
└──────────────────────────────────┘
```

### Stack

- Next.js App Router;
- React;
- TypeScript with strict checking;
- Tailwind CSS;
- `localStorage` for P0 history;
- Vercel for deployment;
- optional browser-only pose detection for P2.

### Module boundaries

```text
app/
  page.tsx
components/
  ScenarioSelector.tsx
  WorkContextCard.tsx
  DecisionCard.tsx
  ActivityCard.tsx
  ActivitySession.tsx
  InterventionHistory.tsx
lib/
  types.ts
  decision-engine.ts
  activity-selector.ts
  storage.ts
data/
  demo-scenarios.ts
```

The UI consumes domain functions. The domain functions do not import React or browser APIs. Storage is isolated behind a small browser-safe boundary.

---

## 13. Domain model

```ts
type WorkContext = {
  sedentaryMinutes: number;
  minutesToNextMeeting: number | null;
  minutesSinceLastActivity: number;
  currentTime: string;
  nextMeetingTitle?: string;
};

type Activity = {
  id: string;
  name: string;
  durationSeconds: number;
  instructions: string;
};

type InterventionOutcome = "completed" | "dismissed" | "skipped";

type InterventionRecord = {
  id: string;
  createdAt: string;
  context: WorkContext;
  decision: "MOVE_NOW" | "NOT_NOW";
  reason: string;
  activity?: Activity;
  outcome?: InterventionOutcome;
};

type DecisionResult = {
  decision: "MOVE_NOW" | "NOT_NOW";
  movementNeed: "LOW" | "MEDIUM" | "HIGH";
  interruptionCost: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  reason: string;
  activity?: Activity;
};
```

### Invariants

- A `MOVE_NOW` result includes an activity.
- A `NOT_NOW` result does not start an activity.
- Every decision includes a non-empty reason.
- Times and durations are non-negative.
- A stored record captures the context used for its decision.
- Camera-derived data, if enabled, stores only the activity result and never raw frames.

---

## 14. UI state machine

```text
IDLE
  │ Evaluate
  ▼
EVALUATING
  ├──────────────► NOT_NOW ─────────────► IDLE
  │
  ▼
RECOMMENDED
  ├── Not now ──► DISMISSED ────────────► IDLE
  │
  └── Start ────► ACTIVE ── Complete ──► COMPLETED ──► IDLE
```

### Transition rules

- Selecting a new demo scenario returns the interface to `IDLE` before evaluation.
- `EVALUATING` is transient and prevents duplicate evaluations.
- `NOT_NOW` shows the reason and creates no active exercise.
- `DISMISSED` persists an outcome and activates cooldown.
- `COMPLETED` persists an outcome and updates history.
- Reloading restores history but not a partially active session.

---

## 15. Decision model

### 15.1 Hard gates

Hard gates are evaluated before the score and always win.

```text
IF next meeting <= 5 minutes
THEN NOT_NOW

IF an intervention was dismissed < 15 minutes ago
THEN NOT_NOW

IF sedentary time < 40 minutes
THEN NOT_NOW
```

The meeting gate prevents a high movement score from generating an obviously disruptive recommendation.

### 15.2 Scoring

```text
movementNeed = clamp(
  sedentaryMinutes / 75 × 0.70
  + minutesSinceLastActivity / 120 × 0.30,
  0,
  1
)

opportunity =
  next meeting unknown ? 1
  : clamp(minutesToNextMeeting / 15, 0, 1)

decisionScore =
  movementNeed × 0.65
  + opportunity × 0.35
```

```text
score >= 0.65 → MOVE_NOW
score < 0.65  → NOT_NOW
```

### 15.3 Explainability

The explanation should name the decisive context, not expose an opaque number alone.

Good-window example:

> You've been sitting for 57 minutes and have a 12-minute window before your next meeting.

Meeting-gate example:

> You need movement, but your next meeting starts in 2 minutes. I'll check again afterwards.

### 15.4 Activity selection

P0 defaults to `10 squats` lasting about 45–60 seconds. A `60-second shoulder stretch` is the deterministic fallback.

P1 preference rule:

```text
IF squats were dismissed at least twice
AND stretch completions exceed squat completions
THEN prefer stretch
ELSE prefer squats
```

An optional LLM may personalize activity or wording only after `MOVE_NOW`. The deterministic selector remains the fallback, and the LLM cannot override hard gates.

---

## 16. Functional requirements

### FR-01 — Load work context

The system shall represent sedentary minutes, minutes until the next meeting, minutes since the last activity, current time, and an optional meeting title. P0 shall load this information from fixed demo scenarios.

**Acceptance:** switching scenarios replaces the visible context without stale values.

### FR-02 — Evaluate intervention

The system shall expose a pure `evaluateIntervention(context, history)` function that applies hard gates before scoring and returns a typed `DecisionResult`.

**Acceptance:** scenarios A, B, and C match the Definition of Done table.

### FR-03 — Explain the decision

The system shall display the decision, movement-need level, interruption-cost level, and a plain-language reason.

**Acceptance:** a viewer can explain why the two main scenarios differ without seeing source code.

### FR-04 — Select activity

The system shall attach a deterministic activity only to a `MOVE_NOW` result.

**Acceptance:** the good-window scenario recommends a sub-90-second activity; `NOT_NOW` does not show a start action.

### FR-05 — Present intervention controls

The system shall offer `Start` and `Not now` for a recommendation.

**Acceptance:** `Start` opens the active session; `Not now` records dismissal and acknowledges the cooldown.

### FR-06 — Complete an activity

The P0 activity session shall show the activity name, instructions, and a completion action. A timer or rep counter may be added but is not required.

**Acceptance:** completing an activity produces a visible confirmation and a persisted `completed` record.

### FR-07 — Persist and display history

The system shall save intervention records in `localStorage` and render today's outcomes in reverse chronological order.

**Acceptance:** completed and dismissed outcomes survive a page reload.

### FR-08 — Apply dismissal cooldown

The system shall suppress a new recommendation for 15 minutes after dismissal.

**Acceptance:** reevaluation during cooldown returns `NOT_NOW` with a cooldown explanation.

### FR-09 — Reset demo state

The demo shall provide a clear way to reset local history so the pitch can be rehearsed and repeated.

**Acceptance:** reset removes stored records and returns the interface to a known initial state.

### FR-10 — Optional personalization

After P0 is deployed, the selector may use outcomes to prefer better-performing activities.

**Acceptance:** the learned-preference fixture selects stretch under the stated preference rule.

---

## 17. Non-functional requirements

### NFR-01 — Reliability

The three canonical decisions must be deterministic and repeatable. Core demo behaviour must not depend on network access or an AI provider.

### NFR-02 — Performance

Scenario evaluation should feel immediate, with a target under 100 ms on a typical laptop. Initial page load should remain suitable for a live demo on shared venue Wi-Fi.

### NFR-03 — Accessibility

All controls must be keyboard accessible, have visible focus states, use semantic labels, and communicate decision state through text rather than colour alone.

### NFR-04 — Responsive design

The primary flow must remain usable from 360 px mobile width through a desktop presentation viewport.

### NFR-05 — Privacy

P0 data remains in the browser. No raw camera video, calendar content, or intervention history is transmitted. Any later transmission requires explicit disclosure and a narrow purpose.

### NFR-06 — Safety and claims

Copy must frame activities as workplace wellbeing suggestions, not medical advice. It must avoid disease-prevention, diagnosis, treatment, or guaranteed health claims.

### NFR-07 — Maintainability

Decision logic must remain independent from React and browser persistence. Types must be shared rather than duplicated across components.

### NFR-08 — Demo recoverability

The presenter must be able to return to a known state in one action. The demo should have screenshots or a short backup recording.

### NFR-09 — Security

No secrets may be placed in client code. Parsed browser storage is treated as untrusted, camera access is user initiated, and any future LLM output is schema validated before display.

---

## 18. Test strategy

### 18.1 Unit tests — decision engine

| Test | Expected |
|---|---|
| 57 sedentary, meeting in 12, last activity 78 | `MOVE_NOW` |
| 72 sedentary, meeting in 2, last activity 90 | `NOT_NOW`; meeting hard gate |
| 25 sedentary, meeting in 30, last activity 25 | `NOT_NOW`; sedentary hard gate |
| No upcoming meeting and high movement need | `MOVE_NOW` |
| Dismissed 5 minutes ago in otherwise good window | `NOT_NOW`; cooldown |
| Dismissed 16 minutes ago in good window | cooldown no longer blocks |
| Boundary at meeting in 5 minutes | `NOT_NOW` |
| Boundary at 40 sedentary minutes | evaluated by score rather than low-need gate |
| `MOVE_NOW` result | contains an activity and a reason |
| `NOT_NOW` result | contains a reason and no active session |

### 18.2 Unit tests — activity selection

- With no history, select squats.
- With two squat dismissals but no stronger stretch history, retain deterministic default.
- With at least two squat dismissals and more stretch completions than squat completions, select stretch.

### 18.3 Storage tests

- Missing key returns an empty array.
- Invalid JSON returns an empty array without crashing.
- Appending a record preserves existing records.
- Clearing history removes the key.

### 18.4 Component tests

- Scenario selector exposes all canonical cases.
- Decision card renders decision and explanation.
- `NOT_NOW` does not render `Start`.
- `Start` enters the activity session.
- `Not now` persists dismissal.
- `Complete` persists completion and updates history.

### 18.5 End-to-end pitch path

1. Open clean public URL.
2. Select good-window scenario and evaluate.
3. Confirm `MOVE NOW`, explanation, and squats.
4. Start and complete the activity.
5. Confirm history entry.
6. Select meeting-soon scenario and evaluate.
7. Confirm `NOT NOW` and meeting explanation.
8. Reload and confirm persisted history.
9. Reset state and confirm repeatability.

### 18.6 Manual camera checks, only if P2 ships

- Permission denied produces a graceful manual-completion fallback.
- No camera is available produces the same fallback.
- Rep counting does not retain images or video.
- The camera indicator stops when the session ends.

---

## 19. Implementation priorities

| Priority | Deliverable | Exit condition |
|---|---|---|
| P0.1 | Next.js page and scenario selector | Three contexts can be selected and viewed |
| P0.2 | Domain types and decision engine | A/B/C unit cases pass |
| P0.3 | Decision card | `MOVE NOW` and `NOT NOW` are visually distinct and explained |
| P0.4 | Activity controls | Start, complete, and dismiss flows work |
| P0.5 | Local history and cooldown | Outcomes persist and influence reevaluation |
| P0.6 | Responsive polish and reset | Pitch can be repeated from a known state |
| P0.7 | Deployment | Public URL passes the end-to-end pitch path |
| P0.8 | Submission assets | TAIKAI copy, screenshot, and backup demo are ready |
| P1 | Preference adaptation and optional LLM | P0 remains functional if AI is unavailable |
| P2 | Camera verification | User-initiated local verification is stable with fallback |
| P3 | Calendar integration | Deferred beyond hackathon |

**Gate:** no P1 work begins until deployed P0 passes scenarios A and B.

---

## 20. Hackathon timeline

| Time | Organizer milestone | WorkPulse milestone |
|---|---|---|
| 10:30 | Building starts | Confirm canonical scope and start from stable scaffold |
| 11:00 | Something on screen | Responsive context screen and scenario selector visible |
| 11:00–13:00 | Core build | Context → decision → explanation → intervention loop works |
| 13:00 | Core feature works | Scenarios A, B, and C pass; complete/dismiss paths work |
| 13:00–14:00 | Extend carefully | Add persistence, cooldown, and only then optional polish |
| 14:00 | Deployment begins | Stop product exploration and deploy P0 |
| 14:30 | Public link | Verify URL on phone and in incognito |
| 14:30–15:15 | Demo polish | Improve copy, transitions, reset, and reliability only |
| 15:15 | Feature freeze | Change code only for a blocking demo defect |
| 15:15–15:45 | Submission | Finalize TAIKAI copy, screenshot, URL, and backup |
| 15:45 | Submitted | Rehearse the pitch against a timer |
| 16:00 | Pitches | Deliver a 90–110-second live story |

---

## 21. Main-screen content

```text
WORKPULSE
Move more. Interrupt less.

You've been sitting
57 MIN

Next meeting
Design Review
in 12 MIN

Movement need       HIGH
Interruption cost   LOW

┌─────────────────────────────────┐
│            MOVE NOW             │
│                                 │
│ You have a good window.         │
│ Let's do 10 squats.             │
│                                 │
│ [ Start ]       [ Not now ]     │
└─────────────────────────────────┘

Why?
You've been sitting for 57 minutes
and have 12 minutes before your
next meeting.
```

The demo-scenario control must be visible but visually secondary. The decision remains the focal point.

---

## 22. Live demo flow

### Pre-demo setup

- Open the public URL in a clean browser.
- Reset local demo state.
- Keep the good-window scenario selected.
- Close unrelated tabs and notifications.
- Keep the backup recording immediately accessible.

### Live sequence

1. Introduce Alex and the failure of timer reminders.
2. Show `57 min sitting`, `12 min to meeting`, and `78 min since movement`.
3. Run WorkPulse and reveal `MOVE NOW`.
4. Point to high movement need, low interruption cost, and the explanation.
5. Start `10 squats` and complete the activity using the manual P0 flow.
6. Show the completed record in history.
7. Switch to the meeting-soon scenario: `72 min sitting`, `2 min to meeting`.
8. Run WorkPulse and reveal `NOT NOW`.
9. Deliver the line: **“That's the difference between a reminder and an agent.”**
10. Close on deterministic decisions, optional private verification, and the product promise.

### Demo fallback order

1. Live public URL.
2. Local build.
3. Backup recording.
4. Screenshots with narrated state transitions.

---

## 23. Two-minute pitch

### 0:00–0:15 — Hook

> AI is getting really good at keeping us at our computers. So we built an AI coworker whose job is to get you away from yours.

### 0:15–0:35 — Problem

> Meet Alex, a remote product manager. Alex knows he should move, but ignores every “time to stand up” notification. The problem is not motivation. A timer has no idea whether Alex has been sitting for an hour, whether a meeting starts in two minutes, or whether this is a good moment to interrupt.

### 0:35–1:20 — Live demo

> This is WorkPulse. Alex has been sitting for 57 minutes, and the next meeting is in 12. WorkPulse balances movement need with interruption cost and says: `MOVE NOW`. It explains the decision and offers ten squats in under a minute. Alex can start immediately, complete the activity, and WorkPulse records the result.

> Now Alex has been sitting even longer, but the next meeting starts in two minutes. WorkPulse says: `NOT NOW`. The movement need is high, but interrupting now would be a bad decision.

> That's the difference between a reminder and an agent.

### 1:20–1:42 — Why it is reliable

> WorkPulse uses deterministic rules for decisions that must be reliable, and AI only for choices that benefit from flexibility, such as personalizing an activity. It learns from what the user completes or dismisses without letting a model override hard constraints.

### 1:42–1:55 — Privacy and close

> Camera verification is optional and runs on-device, so raw video never needs to leave the browser. AI usually helps us work more. WorkPulse helps us stop at the right moment. Move more. Interrupt less.

---

## 24. TAIKAI submission copy

### Name

**WorkPulse**

### Tagline

**Move more. Interrupt less.**

### One-line description

**An AI coworker that finds the least disruptive moment to get you moving.**

### Short description

WorkPulse is a workplace-wellbeing agent that decides when it is actually a good moment to move. It balances sedentary time, the gap before the next meeting, and recent behaviour to avoid badly timed reminders, recommends a tiny activity, explains its decision, and remembers what the user completed or dismissed.

### Problem

Traditional movement reminders interrupt people on a fixed timer. They do not know that a meeting starts in two minutes, that the user moved recently, or that the same exercise has already been dismissed several times. Poor timing turns useful advice into notification noise.

### Solution

WorkPulse treats movement as a contextual decision: **Do you need to move, and is now a good time?** Reliable rules protect meetings and cooldowns; a transparent score balances movement need with opportunity; a short activity is offered only when the interruption is worthwhile.

### What makes it agentic

WorkPulse observes context, makes an autonomous decision, explains it, acts through an intervention, records the result, and uses that outcome in the next decision. Crucially, it can decide not to act.

### Responsible AI and privacy

The core decision is deterministic and works without an external AI service. Optional AI personalization cannot override safety gates. Optional camera verification runs locally in the browser, with no raw video stored or uploaded.

### Built with

Next.js, React, TypeScript, Tailwind CSS, browser-local persistence, deterministic decision logic, and optional on-device pose detection.

### Suggested submission image

Use the main decision screen showing the good-window scenario, `MOVE NOW`, high movement need, low interruption cost, a short explanation, and the `10 squats` activity. If a second image is allowed, use the meeting-soon `NOT NOW` state to show the contrast.

---

## 25. Optional camera extension

Camera verification is P2 and begins only after the deployed P0 loop is stable.

### Flow

```text
User selects Start with camera
        ↓
Browser requests permission
        ↓
Pose landmarks are calculated locally
        ↓
Squat state changes are detected
        ↓
Rep counter reaches 10
        ↓
Outcome saved as completed and verified
```

### Privacy contract

- Camera activation is explicit and limited to the active session.
- Raw frames never leave the browser.
- Video is not recorded.
- The server receives no biometric or pose-landmark stream.
- If any result is stored, it is limited to activity type, repetitions, completion time, and a boolean verification flag.
- Denied permission or unreliable detection falls back to manual completion without blocking the demo.

### Camera exit criteria

- Ten clear squats are counted reliably under venue lighting.
- False double-counting is controlled through a simple standing/down state machine.
- Permission denial and missing camera states are graceful.
- Camera tracks stop when the session ends.
- The feature can be disabled instantly without affecting the rest of the product.

---

## 26. Non-goals

The hackathon prototype will not include:

- medical diagnosis, treatment, health-risk scoring, or disease-prevention claims;
- a real Google or Microsoft Calendar integration;
- authentication, accounts, teams, manager dashboards, or employee monitoring;
- cloud database, Supabase, or cross-device sync;
- wearables or phone-sensor integration;
- payments, financial penalties, rewards, or Stellar integration added solely for a sponsor track;
- a mobile-native application;
- nutrition, sleep, mood, or general wellness coaching;
- complex autonomous orchestration or multiple collaborating agents;
- an LLM deciding whether it is safe to interrupt;
- mandatory camera use;
- storage or upload of raw camera footage;
- a large exercise library;
- background notifications that must operate when the page is closed.

These may be future directions, but introducing them during P0 would weaken the central story and increase demo risk.

---

## 27. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Feature creep | Enforce the P0 deployment gate before any P1/P2 work |
| LLM latency or outage | Keep core decisions and fallback activity fully deterministic |
| Venue Wi-Fi failure | Maintain a local build plus backup recording/screenshots |
| Camera permission or pose failure | Manual completion is the default P0 path |
| Decision appears arbitrary | Show movement need, interruption cost, and a plain-language reason |
| User feels nagged | Respect dismissal cooldown and treat `NOT NOW` as valuable |
| Health claims create scrutiny | Position as workplace wellbeing, not healthcare |
| Local state breaks the demo | Provide one-action reset and rehearse from a clean session |
| Calendar integration consumes time | Use fixed, believable demo contexts |

---

## 28. Final checklist

### Product

- [ ] The five-line canonical scope is unchanged.
- [ ] Good-window scenario returns `MOVE NOW`.
- [ ] Meeting-soon scenario returns `NOT NOW` because of the hard gate.
- [ ] Low-need scenario returns `NOT NOW`.
- [ ] Every decision has a clear reason.
- [ ] The activity is under 90 seconds.
- [ ] Complete and dismiss flows both work.
- [ ] Dismissal activates cooldown.
- [ ] History persists across reload.
- [ ] Demo state can be reset in one action.

### Engineering and QA

- [ ] Type checking passes.
- [ ] Linting passes.
- [ ] Production build passes.
- [ ] Decision-engine unit tests pass.
- [ ] End-to-end pitch path passes locally.
- [ ] Public URL passes in an incognito session.
- [ ] Main flow remains usable at mobile width.
- [ ] Keyboard focus and labels are usable.
- [ ] No secrets or sensitive data are present in client code or Git history.
- [ ] Camera tracks stop correctly if the optional feature is included.

### Demo and submission

- [ ] Public HTTPS URL is ready by 14:30.
- [ ] Screenshot clearly shows `MOVE NOW` and its explanation.
- [ ] Optional second screenshot shows `NOT NOW`.
- [ ] TAIKAI name, tagline, description, problem, solution, and stack are pasted and proofread.
- [ ] Backup recording or screenshots are available offline.
- [ ] Browser notifications and unrelated tabs are closed.
- [ ] The demo begins from a clean, reset state.
- [ ] Pitch is rehearsed to 90–110 seconds.
- [ ] “That's the difference between a reminder and an agent” lands immediately after the `NOT NOW` reveal.
- [ ] No new feature work begins after the 15:15 freeze.

---

## 29. Final product statement

WorkPulse is not a fitness tracker, a timer, or a chatbot with calendar access. It is a small, controlled agent that balances movement need with interruption cost and sometimes chooses not to act.

> **A correct decision not to interrupt is as valuable as a decision to intervene.**

That is the product, the engineering boundary, and the central hackathon story.
