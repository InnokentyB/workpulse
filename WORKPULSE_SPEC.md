# WorkPulse — MVP Specification

**Version:** 1.3
**Date:** 25 September 2026
**Tagline:** Move more. Interrupt less.

This document is the complete product and engineering contract for the current MVP. Anything not listed under “In scope” is not part of this slice.

## 1. Goal

Prove that a movement intervention should depend on both movement need and interruption cost—not on a fixed timer.

The demo must make one contrast obvious:

- after 57 sedentary minutes with 12 minutes before a meeting, WorkPulse says `MOVE NOW`;
- after 72 sedentary minutes with only 2 minutes before a meeting, WorkPulse says `NOT NOW`.

The second decision is not an error or fallback. It is the core evidence that WorkPulse understands context.

## 2. User

Alex is a remote product manager who spends most of the day at a laptop and ignores generic “time to stand” reminders because they often arrive at bad moments.

Alex needs a clear recommendation that fits the workday without setup, guilt, or another system to manage.

## 3. MVP hypothesis

> A viewer will understand the value of contextual movement decisions when two situations with similarly high movement need produce different recommendations because the interruption cost is different.

## 4. In scope

- One responsive web page.
- Exactly two fixed demo scenarios.
- Visible sedentary time, time to the next meeting, and time since the last movement.
- Visible context provenance: calendar information is labelled as demo data and camera status is explicit.
- A deterministic decision engine with hard gates and scoring.
- Equal-weight `MOVE NOW` and `NOT NOW` presentation.
- Visible movement-need and interruption-cost levels.
- A plain-language explanation for every decision.
- One fixed activity for `MOVE NOW`: a neck reset in about 45 seconds.
- Optional on-device guidance for four neck movements during the activity.
- A minimal `Start → Enable camera → Complete four movements → Run again` activity loop, with a manual fallback.
- Keyboard accessibility, visible focus, and a usable 360px mobile layout.
- Focused automated tests for the two decisions and the activity loop.

## 5. Explicit non-goals

- A third low-movement-need demo scenario.
- Dismissal, cooldown, history, or `localStorage`.
- Preference learning or multiple activities.
- Continuous or background camera observation.
- Video recording, storage, upload, playback, or microphone access.
- Real calendar data, background scheduling, or notifications.
- Authentication, a database, cross-device sync, or analytics.
- LLM-generated decisions, explanations, or activities.
- Medical guidance or health-outcome claims.

Public deployment and a backup recording are launch tasks, not product functionality in this repository.

## 6. Canonical scenarios

| Scenario | Sitting | Next meeting | Last movement | Expected decision |
|---|---:|---:|---:|---|
| Good window | 57 min | 12 min | 78 min ago | `MOVE NOW` |
| Meeting soon | 72 min | 2 min | 90 min ago | `NOT NOW` |

### Good window result

- Decision: `MOVE NOW`
- Movement need: `HIGH`
- Interruption cost: `LOW`
- Activity: `Neck reset`, about 45 seconds
- Explanation names both the sedentary time and the 12-minute window.

### Meeting-soon result

- Decision: `NOT NOW`
- Movement need: `HIGH`
- Interruption cost: `HIGH`
- No activity and no start action
- Explanation says the next meeting starts in 2 minutes.

## 7. Decision engine

Hard gates run before the score and always win:

```text
IF next meeting <= 5 minutes
THEN NOT_NOW

IF sedentary time < 40 minutes
THEN NOT_NOW
```

Scoring:

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

decisionScore = movementNeed × 0.65 + opportunity × 0.35

score >= 0.65 → MOVE_NOW
score < 0.65  → NOT_NOW
```

Invariants:

- Every result has a non-empty reason.
- `MOVE_NOW` always includes the fixed activity.
- `NOT_NOW` never includes an activity or start action.
- The same context always produces the same result.
- Domain logic does not import React or browser APIs.

## 8. Interaction

```text
Select scenario
      ↓
Ask WorkPulse
      ↓
MOVE NOW ── Start ── Activity ── Done ── Run again
      or
NOT NOW ── explanation only
```

Selecting another scenario clears the previous result before the next evaluation. No state persists across reloads.

## 9. Acceptance criteria

1. Good window displays `57 / 12 / 78` and deterministically returns `MOVE NOW`, `HIGH` need, `LOW` cost, a reason, and the neck reset.
2. Meeting soon displays `72 / 2 / 90` and deterministically returns `NOT NOW`, `HIGH` need, `HIGH` cost, and a meeting-gate reason.
3. `NOT NOW` shows no activity and no start action.
4. Switching `A → B → A` never leaves stale values or controls.
5. `Start → Enable camera → Complete four guided neck movements → Run again` works without persistence.
6. Both decisions remain understandable without relying on color.
7. The core flow works at 360px and on a presentation-size desktop.
8. The decision demo works without external services; camera verification loads the pose model on demand.
9. Calendar context is visibly identified as demo data.
10. Camera access is requested only after an explicit user action and never requests microphone access.
11. Camera frames are processed locally and are never recorded, stored, or uploaded.
12. The activity calibrates a neutral pose, then verifies one turn to either side, a turn to the opposite side, chin down, a gentle gaze up, and a return to neutral in that order.
13. The camera stops automatically after the verified sequence and whenever the session ends.
14. Permission denial and unavailable-camera states explain how to recover and retain a manual fallback.
15. Tests, lint, and the production build pass.
16. Guidance avoids full neck circles and deep extension, asks for a comfortable range, and tells the user to stop for pain or dizziness.

## 10. Architecture

```text
Fixed scenarios
      ↓
Pure decision engine
      ↓
Responsive React UI
      ↓
Permissioned browser camera
      ↓
On-device pose landmarks
      ↓
In-memory movement progress only
```

Stack:

- Next.js App Router
- React
- strict TypeScript
- Tailwind CSS plus project CSS
- Vitest and Testing Library

There is no backend, authentication layer, database, real calendar integration, video storage, or AI service. Browser-native camera access feeds MediaPipe Pose Landmarker during the short activity session. Only neutral-position calibration and movement progress remain in React state, and both are discarded on reload.

## 11. Test contract

Required automated checks:

- canonical good window returns `MOVE NOW` with the fixed activity;
- meeting-soon hard gate returns `NOT NOW` without an activity;
- the five-minute meeting boundary returns `NOT NOW`;
- UI switches between both scenarios without stale state;
- minimal `Start → Done → Run again` flow works.
- face and shoulder visibility is required before calibration or verification;
- the side-to-side, down, up, and neutral sequence advances only in order;
- camera permission denial produces a recoverable state.

Required verification commands:

```bash
npm test
npm run lint
npm run build
```

## 12. Definition of done

The MVP is done when a viewer can compare the two scenarios, understand why the decisions differ, optionally verify the guided neck reset through a permissioned camera session, see that the camera has stopped, and repeat the demo reliably on desktop and mobile.
