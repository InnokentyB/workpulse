# WorkPulse — Canonical Product & Engineering Specification

**Version:** 1.4
**Date:** 25 September 2026
**Track:** Workplace Wellbeing
**Tagline:** Move more. Interrupt less.

This document is the single source of truth for the current WorkPulse MVP and its governed next stages. Sections marked **Current MVP** describe the implemented slice. Later stages are requirements and roadmap, not hidden MVP scope.

## 1. Product goal

WorkPulse proves that movement need alone is not enough to justify an interruption. A useful workplace-wellbeing agent must balance the need to move against the cost of interrupting the current work moment.

The core demonstration compares two superficially similar situations:

- after 57 sedentary minutes with 12 minutes before a meeting, WorkPulse says `MOVE NOW`;
- after 72 sedentary minutes with only 2 minutes before a meeting, WorkPulse says `NOT NOW`.

The second decision is not an error or fallback. It is the clearest evidence that WorkPulse understands context rather than firing a fixed timer.

## 2. Primary user and need

Alex is a remote product manager who spends most of the day at a laptop and ignores generic movement reminders because they arrive at inconvenient moments.

Alex needs:

- almost no setup;
- a recommendation that fits the real workday;
- a small activity that can start immediately;
- freedom to decline without guilt or repeated nagging;
- a clear reason for every intervention;
- explicit control over any camera or sensitive data.

Primary job:

> When I am absorbed in desk work, help me move at an appropriate moment without making me manage reminders or disrupting an important commitment.

## 3. Product principles

1. **Do not interrupt unless useful.** A correct decision not to act is valuable.
2. **Context beats schedules.** Movement need, opportunity, and interruption cost determine the decision.
3. **Choose the smallest useful intervention.** The activity fits the available moment and user constraints.
4. **Explain every decision.** The user sees the decisive context in plain language.
5. **Deterministic where reliability matters.** Hard gates and the core decision do not depend on an LLM.
6. **Verify without surveillance.** Camera use is explicit, temporary, local, and optional.
7. **Protect the whole working day.** Future movement logic must not silently encourage work through meals, rest, or the planned end of work.
8. **The user remains in control.** Dismissal, exclusions, permissions, and private routines remain user-owned.

## 4. Current MVP contract

### 4.1 In scope

- One responsive web page.
- Exactly two fixed demo scenarios.
- Visible sedentary time, time to the next meeting, and time since the last movement.
- Visible context provenance: calendar information is labelled as demo data and camera status is explicit.
- A deterministic decision engine with hard gates and scoring.
- Equal-authority `MOVE NOW` and `NOT NOW` presentation.
- Visible movement-need and interruption-cost levels.
- A plain-language explanation for every decision.
- Two selectable activities for `MOVE NOW`: a neck reset in about 45 seconds and shoulder rolls in about 60 seconds.
- Optional on-device guidance for four gentle neck movements.
- Camera-free, on-screen guidance for shoulder rolls.
- Explicit camera consent, loading, active, denied, unavailable, and error states.
- Manual completion fallback that does not require camera access.
- Camera shutdown after completion, cancellation, or component exit.
- Local activity history with completion time, duration, verification mode, and movement count.
- Keyboard accessibility, visible focus, reduced-motion support, and a usable 360 px layout.
- Automated tests for both decisions, the interaction loop, and neck-motion tracking.

### 4.2 Current MVP non-goals

- A third low-movement-need scenario.
- Dismissal, cooldown, or preference learning.
- Preference learning or a broader activity catalog.
- Continuous or background camera observation.
- Video recording, storage, upload, playback, or microphone access.
- Real calendar data, background scheduling, or notifications.
- Authentication, a database, analytics, or cross-device sync.
- LLM-generated decisions, explanations, or activities.
- Medication, meal, posture, sleep, or environment routines.
- Medical diagnosis, treatment, or guaranteed health claims.

Public deployment, backup screenshots, and a backup recording are launch deliverables, not runtime dependencies.

## 5. Canonical scenarios

| Scenario | Sitting | Next meeting | Last movement | Expected decision |
|---|---:|---:|---:|---|
| Good time to move | 57 min | 12 min | 78 min ago | `MOVE NOW` |
| Meeting starts soon | 72 min | 2 min | 90 min ago | `NOT NOW` |

### 5.1 Good window result

- Decision: `MOVE NOW`
- Movement need: `HIGH`
- Interruption cost: `LOW`
- Activity: `Neck reset`, about 45 seconds
- Explanation: `You've been sitting for 57 minutes and have a 12-minute window before your next meeting.`
- Action: `Start activity`

### 5.2 Meeting-soon result

- Decision: `NOT NOW`
- Movement need: `HIGH`
- Interruption cost: `HIGH`
- Explanation: `You need movement, but your next meeting starts in 2 minutes. I'll check again afterwards.`
- No activity and no start action.

The meeting hard gate always wins. WorkPulse does not fill the remaining two minutes with a seated exercise because restraint is the proof of the product.

## 6. Current MVP state machine

```text
IDLE
  │ Ask WorkPulse
  ▼
MOVE_NOW ── Start activity ──► ACTIVITY_CONSENT
  │                              ├─ Enable camera ─► LOADING ─► ACTIVE
  │                              │                    ├─ verified sequence ─► COMPLETED_VERIFIED
  │                              │                    ├─ denied/unavailable/error ─► RECOVERY
  │                              │                    └─ stop ─► IDLE
  │                              └─ Complete without camera ─► COMPLETED_MANUAL
  │
  └─ Run again / change scenario ─► IDLE

NOT_NOW ── change scenario / run again ─► IDLE
```

Rules:

- Selecting another scenario clears the previous result and activity state.
- The activity never begins camera processing before explicit user action.
- Manual completion remains available if the camera is declined, missing, or unreliable.
- Partially completed camera activity does not persist across reloads.
- Camera tracks stop whenever the activity ends or the component unmounts.

## 7. Decision model

### 7.1 Hard gate

```text
IF next meeting <= 5 minutes
THEN NOT_NOW
```

Later stages may add cooldown, outside-hours, and routine gates. They cannot override or weaken the current meeting gate.

### 7.2 Scoring

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

### 7.3 Invariants

- Every result includes a non-empty reason.
- `MOVE_NOW` includes the MVP activity choices.
- `NOT_NOW` includes no activity and no start action.
- The same context always produces the same result.
- Domain logic does not import React or browser APIs.
- Camera logic cannot change the `MOVE_NOW` / `NOT_NOW` decision.

## 8. MVP activities

### 8.1 Neck reset

The camera-capable activity is a gentle neck reset lasting approximately 45 seconds.

Instruction:

> Slowly turn side to side, lower your chin, and lift your gaze within a comfortable range.

Safety copy:

> Use a comfortable range. Stop if you feel pain or dizziness.

The verified sequence is:

1. Establish a comfortable neutral pose.
2. Turn gently to either side.
3. Return through centre and turn to the opposite side.
4. Return through centre and lower the chin gently.
5. Return through centre and lift the gaze slightly.
6. Return to neutral to complete verification.

The UI summarizes this as four guided movements after neutral calibration. Full neck circles, deep extension, forceful movement, pain diagnosis, and therapeutic claims are prohibited.

### 8.2 Shoulder rolls

The second activity is a shoulder reset lasting approximately 60 seconds. The user
makes three slow shoulder circles forward and then three backward, within a
comfortable range. With explicit consent, on-device pose detection calibrates a
relaxed shoulder position and counts six lift-and-return cycles. The same manual
fallback remains available when camera access is unavailable or unwanted.

## 9. Camera and privacy contract

- Camera activation requires a dedicated user action.
- The browser requests video only and never microphone access.
- Pose landmarks are calculated on the user's device.
- Raw frames, video, and landmark streams are not recorded, stored, uploaded, or played back.
- A live camera indicator remains visible while the stream is active.
- The camera switches off automatically after success, cancellation, error, or navigation away from the activity.
- Permission denial and unavailable-camera states explain recovery and preserve manual completion.
- Current movement progress exists only in memory and is discarded on reload.
- Optional camera verification is evidence of completion, not a medical assessment.

## 10. Current architecture

```text
Fixed demo scenarios
        ↓
Pure deterministic decision engine
        ↓
Responsive React UI
        ↓ MOVE_NOW only, user starts activity
Permissioned browser camera
        ↓
On-device MediaPipe pose landmarks
        ↓
In-memory movement progress and completion
        ↓
Versioned activity history in browser `localStorage`
```

Stack:

- Next.js App Router;
- React;
- strict TypeScript;
- Tailwind CSS plus project CSS;
- Vitest and Testing Library;
- MediaPipe Tasks Vision, loaded on demand.

There is no backend, authentication, database, real calendar integration, video storage, or AI service in the current MVP. Activity history is stored only in the current browser.

## 11. Current functional requirements

### FR-01 — Select a fixed scenario

The user can select either canonical scenario. Changing selection replaces all visible context and clears the prior decision.

**Acceptance:** switching `A → B → A` never leaves stale values, controls, or camera state.

### FR-02 — Evaluate the moment

The system applies the meeting gate before scoring and returns a deterministic result.

**Acceptance:** both canonical scenarios match section 5.

### FR-03 — Explain the decision

The UI shows the decision, movement need, interruption cost, and plain-language reason.

**Acceptance:** a viewer can explain the contrast without reading source code or relying on colour.

### FR-04 — Offer activity choices only for `MOVE_NOW`

`MOVE_NOW` includes `Neck reset` and `Shoulder rolls`, their approximate durations,
guidance mode, explanation, and `Start activity`.

**Acceptance:** `NOT_NOW` contains no activity and no start action.

### FR-05 — Complete manually

The activity can be completed without camera verification.

**Acceptance:** manual completion reaches a clear success state and reports that no camera verification was used.

### FR-06 — Verify locally with camera

After explicit consent, the product loads the pose model, shows a mirrored preview and overlay, advances through the guided sequence, and completes after the required movements.

**Acceptance:** success reports four verified movements, confirms that no video was recorded, and confirms that the camera is off.

### FR-07 — Recover from camera failure

Denied permission, missing camera, model failure, and tracking loss produce actionable, non-technical guidance.

**Acceptance:** the user can retry or complete manually; the decision demo remains usable.

## 12. Current non-functional requirements

### Reliability

- Both canonical decisions are deterministic and repeatable.
- The core decision demo works without camera or external services.
- Camera/model failure never blocks manual completion or the `NOT_NOW` demonstration.

### Performance

- Decision evaluation feels immediate and targets under 100 ms.
- MediaPipe loads only after the user chooses camera verification.
- Initial page load remains suitable for a live demo on shared Wi-Fi.

### Accessibility

- Controls are keyboard accessible and use semantic elements.
- Focus states are visible on paper, green, brown, and lime surfaces.
- Decision and camera states are communicated through text, not colour alone.
- The interface reflows from 360 px without horizontal scrolling.
- Reduced-motion preference disables decorative motion.

### Safety and claims

- Copy frames the activity as a workplace-wellbeing suggestion, not medical advice.
- The UI tells the user to use a comfortable range and stop for pain or dizziness.
- No diagnosis, treatment, prevention, or guaranteed outcome is implied.

### Security and privacy

- No secrets are placed in client code.
- Camera access is user initiated and video-only.
- Raw camera media is never persisted or transmitted.
- Third-party model assets are a runtime dependency only for optional verification.

## 13. Current test contract

Required automated checks:

- good window returns `MOVE_NOW`, high need, low cost, reason, and the two activity choices;
- meeting-soon gate returns `NOT_NOW`, high need, high cost, and no activity;
- the five-minute meeting boundary returns `NOT_NOW`;
- the UI switches between scenarios without stale state;
- `Start → manual completion → Run again` works;
- face and both shoulders are required for neck calibration or verification;
- face and both shoulders are required for shoulder-roll calibration or verification;
- neck side-to-side, down, up, and neutral stages advance only in order;
- a shoulder roll advances only after both shoulders rise relative to the face and return to the calibrated relaxed position;
- denied camera permission produces a recoverable state;
- camera and motion state reset when the session ends.

Verification commands:

```bash
npm test
npm run lint
npm run build
```

## 14. Current definition of done

The MVP is done when a viewer can:

1. compare both scenarios;
2. understand why the decisions differ;
3. choose and start either activity only from `MOVE_NOW`;
4. complete either activity manually or with on-device movement verification;
5. see that the camera is off after the session;
6. repeat the demo reliably on desktop and mobile;
7. run the decision demo if camera verification is unavailable.

## 15. Governed roadmap

### Current MVP — implemented slice

- Two-scenario decision contrast.
- Selectable neck reset and shoulder-roll activities.
- Optional local camera verification with manual fallback.
- Local completion history; no accounts or external services.

### P0+ — only after current MVP passes its acceptance contract

Choose one coherent slice at a time:

1. **Real calendar connection:** explicit authorization and revocation, upcoming events, and free-window context replacing fixed demo data.
2. **Workday boundary:** local start/end settings plus an outside-hours `NOT_NOW` reason.
3. **Activity fit:** explicit available duration, ability to stand, ability to leave the desk, meeting participation, exclusions, and a four-activity library.
4. **Outcome memory:** dismissal, cooldown, and the third low-need scenario from the earlier prototype plan.

P0+ may not weaken the meeting gate, camera privacy contract, manual fallback, or repeatable pitch path.

### P1 — personal routines and adaptation

- Preference-aware activity selection from local outcomes.
- User-defined meal and long-break windows without nutrition scoring.
- User-defined medication or therapy reminders after privacy, reliability, and safety gates.
- Private notification controls, export, and deletion.
- Real calendar participation context where available.
- Optional validated LLM wording or activity personalization; deterministic decisions remain authoritative.

### P2 — ambient assistance

- Optional posture checks with explicit camera activation.
- Guided ergonomic workspace self-assessment.
- User-controlled daylight and evening-screen routines.
- Temperature, humidity, and CO2 sensor integrations where supported.
- Wearable, walking-pad, and standing-desk integrations.

### P3 — coordinated personal wellbeing platform

- Background scheduling.
- Cross-device synchronization of explicitly selected data.
- Richer behavioural learning.
- Safe coordination across work, movement, meals, therapy, light, and environment.

## 16. Post-MVP activity context

These types describe future inputs and are not required by the current MVP:

```ts
type ActivityContext = {
  availableMinutes: number;
  canStand: boolean;
  canLeaveDesk: boolean;
  interactionMode: "NONE" | "AUDIO_ONLY" | "INTERACTIVE" | "PRESENTING" | "UNKNOWN";
  equipment: Array<"WALKING_PAD" | "STANDING_DESK">;
  excludedActivityIds: string[];
};

type WorkdaySettings = {
  startTime: string;
  endTime: string;
  workingDays: number[];
  timeZone: string;
};
```

Rules:

- Outside configured work hours, ordinary movement recommendations return `NOT_NOW` with an outside-hours reason.
- Existing meeting and safety gates remain authoritative.
- `canStand = false` excludes standing activities.
- Walking requires enough time plus explicit ability to leave the desk or enabled equipment.
- `INTERACTIVE`, `PRESENTING`, or unknown participation never grants walking permission automatically.

## 17. Extended activity library

| Activity | Minimum window | Context |
|---|---:|---|
| Neck and shoulder reset | 1 minute | Seated; can briefly pause |
| Eye-distance break | 1 minute | Can look away from the screen |
| Squats or standing mobility | 1–3 minutes | Can stand; activity not excluded |
| Short walk | 5 minutes | Can leave the desk or walking pad enabled |

Preparation time, clothing, outdoor weather, and return buffers remain later discovery topics.

## 18. Meal and long-break contract

Meal support protects a user-defined routine and calendar window. It does not require food logging. Initial actions are `Ate` or `Completed`, `Later`, and `Skip today`.

- No calorie judgement or good/bad food labels.
- No nutrition prescription or guaranteed prevention of snacking.
- Fasting, shift work, caregiving, eating disorders, and cultural differences require discovery before broad release.
- Meal prompts normally defer to an active higher-priority therapy item or imminent meeting.

## 19. Medication and therapy contract

Medication and ongoing-therapy reminders reproduce user-entered or professionally supplied instructions; WorkPulse does not create medical instructions.

- Never invent or change a dose.
- Never recommend compensating for a missed dose.
- Never silently infer a relationship to meals.
- Keep notification previews private by default.
- Reliable delivery semantics, acknowledgement history, appropriate encryption, export, deletion, and revocation are release gates.
- Employer access is prohibited by default.

Actions are `Taken` or `Completed`, `Remind me later`, and `Skip today`.

## 20. Prompt arbitration

Future reminders must be coordinated rather than emitted independently. Default priority:

1. user-defined medication or prescribed therapy;
2. workday ending and rest boundaries;
3. meal or long-break windows;
4. contextual movement;
5. posture, eyes, light, and environmental adjustments.

A lower-priority prompt may not obscure or repeatedly compete with a higher-priority due item.

## 21. Ambient-module contract

Posture, ergonomics, daylight, evening-screen routines, room temperature, humidity, CO2, wearables, walking pads, and standing desks remain exploratory.

- Every sensor and integration is separately opt-in and revocable.
- Prefer derived signals over raw sensitive input.
- Camera state remains visible while active.
- Environmental recommendations must not claim unsupported oxygen measurement.
- Advice must consider whether the user controls the room.
- Pain input excludes unsuitable activity but does not produce diagnosis.

## 22. Data ownership

The user owns work schedules, movement outcomes, meal routines, therapy schedules, camera-derived completion, wearable signals, and environmental data.

Before cloud synchronization, sensitive routine data requires purpose limitation, private notification previews, explicit consent, appropriate encryption, revocation, export, and deletion. Manager dashboards, employer monitoring, and hidden camera observation are outside the product direction.

## 23. Principal risks and mitigations

| Risk | Mitigation |
|---|---|
| Feature creep weakens the pitch | Current MVP acceptance gates every later stage |
| Camera permission or model failure | Manual completion and camera-free decision demo |
| Neck guidance implies medical treatment | Gentle range, stop guidance, no diagnosis or outcome claims |
| Context appears fabricated | Label fixed calendar inputs as demo data |
| Camera feels like surveillance | Explicit action, live indicator, local processing, automatic shutdown |
| Later reminders create notification noise | Central prompt arbitration and user controls |
| Medication scope implies clinical responsibility | Reproduce instructions only; safety and privacy release gates |
| Sensitive data reaches an employer | User ownership and employer access prohibited by default |

## 24. Design implications

- `MOVE NOW` and `NOT NOW` require equal visual authority.
- The current MVP needs dedicated states for idle, move, hold, camera consent, loading, active tracking, camera recovery, manual completion, and verified completion.
- Context provenance and camera status remain visible and understandable.
- The decision remains usable without camera, network model loading, or colour perception.
- Future routine modules must join one coordinated daily timeline rather than become separate notification dashboards.
- Settings, permissions, and sensitive routines require calm, explicit controls rather than invisible automation.

## 25. Final product statement

WorkPulse is not a fitness tracker, fixed timer, medical system, or chatbot with calendar access. It is a controlled workplace-wellbeing agent that balances movement need with interruption cost and sometimes chooses not to act.

> A correct decision not to interrupt is as valuable as a decision to intervene.
