# WorkPulse — Product Design Specification

**Version:** 2.0
**Product authority:** `WORKPULSE_SPEC.md` v1.4
**Visual-system authority:** `DESIGN.md`
**Implemented reference:** current React/CSS components and `.impeccable/review` captures
**Mode:** operate with a pitch-ready decision reveal

## 1. Design objective

WorkPulse is a calm **workday signal desk**. It presents measured work context, asks one question, and makes one legible call: move now or protect the current commitment.

The design must prove three things:

1. `MOVE NOW` and `NOT NOW` are equally deliberate outcomes.
2. The reason is visible before the viewer has to trust the system.
3. Camera guidance is optional, explicit, local, and never required for the core decision.

The current MVP is a working product surface, not a marketing site. The editorial introduction establishes the idea, but the joined context/decision instrument remains the centre of gravity.

## 2. Scope boundary

### Current design scope

- Two fixed scenarios.
- Idle question state.
- `MOVE NOW` with the fixed neck reset.
- `NOT NOW` meeting-gate state.
- Activity consent and manual completion.
- Camera loading, active guidance, tracking loss, denied, unavailable, and generic error states.
- Verified and manual completion states.
- Desktop, tablet, and 360 px mobile behaviour.

### Not in the current screen set

- Third low-need scenario.
- Dismissal, cooldown, history, or persisted outcomes.
- Workday settings or activity preferences.
- Meal, medication, posture, light, environment, or wearable screens.

Those features appear only in the design roadmap in section 14. They must not be silently added to the current demo or Stitch/Figma generation prompt.

## 3. Experience principles

1. **One instrument, not a dashboard.** Context and decision form one joined device; do not fragment them into metric cards.
2. **The decision speaks largest.** The resolved result is the strongest type on the page.
3. **Restraint has equal authority.** `NOT NOW` is warm, grounded, and complete—not an error or disabled state.
4. **Provenance before intelligence.** Fixed calendar input is visibly labelled as demo data; camera status is explicit.
5. **Permission is a state, not fine print.** Camera consent and local-processing copy are part of the activity flow.
6. **Failure preserves the task.** Every camera failure keeps manual completion available.
7. **No wellness theatre.** No streaks, calories, rings, mascots, stock photography, clinical graphs, or guilt.

## 4. Page hierarchy

```text
Product header
  Brand pulse + WorkPulse
  Move more. Interrupt less.

Editorial premise
  Your workday has a rhythm. Find the right moment to move.
  One-paragraph explanation

Decision demo
  Scenario rail / mobile select
  Joined signal desk
    Context panel
      Context sources
      Three work-context metrics
    State surface
      Idle question, decision, activity, recovery, or completion

Product footer
  Workplace-wellbeing disclaimer
```

The desktop opening viewport should show the premise, scenarios, current context, and the beginning of the state surface. The full decision may extend below 900 px height; the result label must still appear immediately after evaluation without unrelated content between context and state.

## 5. Responsive layout

### Desktop: 921 px and above

- App shell: maximum `1440px`, horizontal padding `48px`.
- Header: three-column grid with brand left and tagline centred.
- Premise: asymmetric two-column grid, approximately 1.45 / 0.55.
- Demo: `285px` scenario rail plus flexible stage, `40px` gap.
- Scenario rail may remain sticky at `24px` from the viewport top.
- Context panel and state surface share a square seam and read as one instrument.
- Context metrics use three equal columns with one-pixel rules.

### Tablet: 641–920 px

- Scenario rail becomes a horizontal two-option strip above the stage.
- Premise may reduce its gap but keeps left-aligned editorial hierarchy.
- Context and state remain joined.
- Camera stage preserves at least a 4:3 visible preview area without forcing horizontal scroll.

### Mobile: 360–640 px

- Page padding: `18px`.
- Header keeps brand only; the centred tagline may hide.
- Premise is one column.
- Desktop radio rows become one native select labelled `Demo scenario`.
- Context metrics use two columns; `Since last movement` spans a ruled second row.
- State content stacks vertically.
- Decision labels use fluid type and must not clip at 360 px.
- Actions fill available width and remain at least `48px` high.
- Camera preview fills the content width; progress and instructions remain above or below it in reading order.
- No horizontal scrolling.

## 6. Visual system

### Atmosphere

Warm paper, deep botanical ink, ruled dividers, and a scarce lime signal create the feeling of an editorial work instrument. The page is flat at rest. Depth comes from tonal contrast and joined surfaces, not floating cards.

### Colour tokens

| Token | Value | Role |
|---|---:|---|
| `ink` | `#16231D` | primary text and icon colour |
| `ink-soft` | `#526159` | descriptions and metadata |
| `paper` | `#F4F1E8` | page canvas |
| `paper-raised` | `#FBFAF5` | context and selected controls |
| `rule` | `#D8D5CA` | dividers and borders |
| `signal` | `#15684A` | live status and smaller positive signals |
| `signal-bright` | `#B8F36B` | primary action and active pose trace |
| `signal-soft` | `#DFF1CC` | subtle live-status field |
| `hold` | `#9A4E27` | smaller hold cues |
| `hold-bright` | `#F2B56D` | high interruption-cost cue |
| `focus` | `#205FCA` | keyboard focus |
| `desk-dark` | `#1D2A24` | idle and terminal state surface |
| `decision-go` | `#183E2F` | `MOVE NOW` surface |
| `decision-hold` | `#493125` | `NOT NOW` surface |
| `inverse-text` | `#F8F8F1` | text on dark surfaces |

Rules:

- Bright lime is scarce: primary action, active pose trace, or a small live signal only.
- `NOT NOW` uses warm brown, never warning red.
- State meaning always includes text and structure.
- The restrained radial lime canvas atmosphere may remain, but must never resemble a glowing card.

### Typography

Use the bundled Geist family.

| Role | Size / line-height | Weight | Notes |
|---|---|---:|---|
| Decision display | `clamp(4rem, 9vw, 7rem) / .9` | 600 | uppercase visual treatment |
| Editorial headline | `clamp(2.8rem, 4.4vw, 4.65rem) / .98` | 610 | max about 18 characters per line |
| State title | `clamp(1.55rem, 3vw, 2.5rem) / 1.12` | 570 | consent, completion, recovery |
| Body | `1rem / 1.65` | 400 | max 65–68 characters |
| System label | `.76rem / 1.5` | 680 | uppercase with `.08em` tracking |
| Context numeral | `clamp(2.1rem, 4vw, 3.6rem) / .95` | 640 | tabular numerals |

Do not introduce Inter, serif display type, or decorative wellness typography.

### Shape and depth

- Joined instrument outer radius: `14px`.
- Controls: `10px` radius and `48px` minimum height.
- Context and decision shared seam: square.
- Default shadow: none.
- Primary hover may lift `1px` with one compact shadow.
- Focus: `3px` blue outline with `3px` offset.

## 7. Core components

### Product header

- Brand pulse mark plus `WorkPulse` on the left.
- Tagline centred on desktop: `Move more. Interrupt less.`
- No navigation menu; the MVP has one task.
- Brand link returns to the page start without resetting application state unexpectedly.

### Editorial premise

- Heading: `Your workday has a rhythm. Find the right moment to move.`
- Body: `WorkPulse weighs movement need against interruption cost, then makes one clear call — without another noisy reminder.`
- It frames the product but must not push the instrument below the initial desktop view unnecessarily.

### Scenario selector

Desktop/tablet uses native radios in ruled rows. Mobile uses a native select.

Options:

1. `Good time to move` — `High movement need and a safe gap before the next meeting.`
2. `Meeting starts soon` — `Movement is needed, but interruption cost is too high.`

Supporting note:

> Two fixed contexts. No calendar connection or setup required.

States: default, hover, selected, focus-visible, disabled during an atomic state transition. Selection clears the previous result and any activity/camera state.

### Context panel

Header:

- `Right now`
- `Work context at {time}`
- live dot plus `Context ready`

Context-source row:

- Calendar source: `Demo data`
- Camera source: `Off`, `Starting`, `Active`, or `Unavailable` where the source row is present in the implemented composition.

Metrics:

- `{n} min` / `You've been sitting`
- `in {n} min` / `Next meeting` / meeting title
- `{n} min` / `Since last movement`

Numbers are the evidence. Do not add rings, trend charts, or raw decision scores.

### Decision surface

Shared order:

1. State label.
2. Decision result.
3. Movement need and interruption cost.
4. Activity, only for `MOVE NOW`.
5. Reason.
6. Action, only when relevant.

`MOVE NOW` uses `decision-go`; `NOT NOW` uses `decision-hold`. Both share dimensions, typography, rules, and padding.

## 8. State specification

### Idle

- Surface: `desk-dark`.
- Status: small live lime mark.
- Copy: `Context is ready`.
- Question: `Is now a good time to move?`
- Action: `Ask WorkPulse`.
- No predicted factor levels.

### `MOVE NOW`

- State label: `WINDOW OPEN`.
- Display: `MOVE NOW`.
- Movement need: `HIGH`.
- Interruption cost: `LOW`.
- Activity label: `Smallest useful move`.
- Activity: `Neck reset`.
- Duration: `About 45 seconds`.
- Reason: `You've been sitting for 57 minutes and have a 12-minute window before your next meeting.`
- Action: `Start activity`.

### `NOT NOW`

- State label: `HOLD THIS MOMENT`.
- Display: `NOT NOW`.
- Movement need: `HIGH`.
- Interruption cost: `HIGH`.
- Reason: `You need movement, but your next meeting starts in 2 minutes. I'll check again afterwards.`
- No activity, start, warning icon, retry pressure, or red treatment.

### Activity consent

- Eyebrow: `Camera-guided activity`.
- Heading: `Neck reset`.
- Progress: `0 / 4`.
- Lead: `Follow four gentle neck movements`.
- Privacy: `Your image is processed on this device. WorkPulse does not record, save, or upload video. The camera switches off after the movement check.`
- Safety: `Use a comfortable range. Stop if you feel pain or dizziness.`
- Primary action: `Enable camera`.
- Secondary action: `Complete without camera`.
- Quiet exit: `Stop activity`.

Camera must not start when `Start activity` is pressed. `Start activity` enters consent; `Enable camera` requests permission.

### Camera loading

- Preserve the final camera-stage dimensions to avoid layout shift.
- Copy: `Starting the camera and pose model…`
- Use a restrained in-place loader, not a generic full-page spinner.
- Manual fallback and stop remain reachable if loading fails or takes too long.

### Camera active

- Mirrored live preview.
- Lime upper-body pose trace.
- Persistent `Camera active` indicator.
- Large progress `{n} / 4`.
- One instruction at a time:
  - `Face the camera and hold a comfortable neutral position.`
  - `Slowly turn your head to either side.`
  - `Now turn through center to the other side.`
  - `Return to center, then lower your chin gently.`
  - `Return through center and lift your gaze slightly.`
  - `Return to a comfortable neutral position.`
- Tracking recovery: `Keep your face and both shoulders visible.`
- Stop action remains available.

Do not show confidence percentages, raw landmarks, diagnostic angles, or a recording-style red dot.

### Camera denied

- Heading: `Camera permission is off`.
- Copy explains that browser settings can be changed and no video was captured.
- Actions: `Try again`, `Complete without camera`.
- Keep safety copy and stop action.

### Camera unavailable

- Heading: `No camera is available`.
- Copy: `WorkPulse couldn't find an available camera on this device.`
- Primary path: `Complete without camera`.
- Optional retry is secondary.

### Camera or model error

- Heading: `Camera guidance couldn't start`.
- Copy: `Check your connection or camera access, then try again.`
- Actions: `Try again`, `Complete without camera`.
- Avoid stack traces, provider names, or blame.

### Completed manually

- Surface: `desk-dark` or completed variant of the signal desk.
- Label: `Activity complete`.
- Heading: `Nice work. Back to your day.`
- Supporting copy: `Completed without camera verification.`
- Action: `Run again`.

### Completed with verification

- Label: `Movement verified`.
- Heading: `Nice work. Neck reset verified.`
- Supporting copy: `Four movements confirmed on this device. No video was recorded. Camera is off.`
- Action: `Run again`.

Completion remains visible until the user acts. Do not auto-dismiss it during the pitch.

## 9. Interaction and motion

- Scenario selection clears result and activity state immediately.
- Decision reveal: 160–220 ms opacity and at most 8 px movement.
- Button hover/press: 160 ms ease-out, maximum 1 px lift/press.
- Camera progress changes without bounce, confetti, or score celebration.
- Preserve dimensions across consent/loading/active/recovery where practical.
- With `prefers-reduced-motion`, remove translation and decorative pulse; keep immediate state changes or sub-100 ms opacity.
- Never simulate slow AI thinking; the decision is deterministic and immediate.

## 10. Accessibility requirements

Target WCAG 2.2 AA.

- Use semantic landmarks and one page-level `h1`.
- Scenario radios/select retain native keyboard behaviour and labels.
- All actions use native buttons.
- Result region announces `Decision: Move now. Movement need high. Interruption cost low.` or the corresponding hold state.
- Camera status changes use polite live announcements; permission errors use an alert only when immediate attention is required.
- Move focus to the decision heading after evaluation, activity heading after start, and recovery heading after a camera error.
- Do not move focus for ordinary pose-progress updates.
- Video preview has a useful accessible label; decorative overlay is hidden from assistive technology.
- Focus outline remains visible and unclipped across every surface.
- Minimum target size: `44 × 44px`.
- Body/control contrast: at least 4.5:1; large text and component boundaries: at least 3:1.
- 200% zoom and 320 CSS px effective width reflow without two-dimensional scrolling.
- Decision, camera, completion, and error states never rely on colour alone.

## 11. Pitch-ready sequence

### Frame 1 — The question

- Good scenario selected.
- Context: `57 / 12 / 78`.
- Idle state: `Is now a good time to move?`
- Presenter selects `Ask WorkPulse`.

### Frame 2 — `MOVE NOW`

- Green decision surface.
- High need, low cost.
- Neck reset, about 45 seconds.
- Reason visible.
- Presenter selects `Start activity`.

### Frame 3 — Permission and trust

- Consent state, camera still off.
- Presenter points to on-device processing and manual fallback.
- For a reliable live pitch, manual completion is the default; camera is the optional wow path.

### Frame 4 — Optional verification

- Enable camera only when venue conditions and permission are confirmed.
- Show active indicator, pose trace, and progress.
- Complete verified or switch to manual fallback without derailing the story.

### Frame 5 — Completion

- Confirm manual or verified completion.
- Camera-off statement is visible after verified completion.
- Select `Meeting starts soon`.

### Frame 6 — `NOT NOW`

- Context: `72 / 2 / 90`.
- Evaluate.
- Brown decision surface with high need and high interruption cost.
- Presenter line: `That's the difference between a reminder and an agent.`

### Required capture set

1. Desktop `MOVE NOW`, current neck-reset copy.
2. Desktop `NOT NOW`.
3. Mobile `NOT NOW` at 390 × 844.
4. Activity consent.
5. Camera active with no identifiable capture retained in the repository unless explicitly approved.
6. Verified completion confirming camera off.

The existing desktop review capture contains stale `10 squats` copy and must not be treated as final submission evidence after the neck-reset change.

## 12. Component mapping

| Code component | Design responsibility |
|---|---|
| `WorkPulseApp` | scenario and product-state orchestration |
| `ScenarioSelector` | radio/select variants and responsive state reset |
| `WorkContextCard` | provenance, context readiness, and three metrics |
| `DecisionCard` | equal-authority move/hold state surfaces |
| `ActivitySession` | consent, loading, active camera, recovery, manual fallback, safety |
| `icons.tsx` | product-owned vector marks and state icons |

The UI consumes domain outputs. Design layers do not recalculate the decision or infer medical meaning from camera landmarks.

## 13. Anti-patterns

- No generic dashboard card grid.
- No rings, raw score, calorie counts, streaks, badges, or gamification.
- No AI chat, assistant avatar, sparkles, or simulated thinking.
- No gradients on components, glassmorphism, neon glow, or purple AI palette.
- No red error treatment for `NOT NOW`.
- No automatic camera start, hidden preview, microphone request, or recording metaphor.
- No medical posture score, pain diagnosis, or “correct posture” certainty.
- No stock wellness imagery or decorative yoga illustrations.
- No expansion screens inside the current pitch path.

## 14. Design roadmap

### P0+ workday boundary

Add a compact settings surface for start time, end time, working days, and time zone. Outside-hours results reuse the hold structure with copy such as `Workday complete` rather than creating a new alert system.

### P0+ activity fit

Add explicit controls for `Can stand`, `Can leave desk`, available minutes, meeting participation, equipment, and exclusions. Selection remains downstream of `MOVE NOW`. Reuse the activity surface; do not create a browseable exercise marketplace.

### P0+ outcome memory

Add dismissal, 15-minute cooldown, third low-need scenario, and a compact browser-local history. History remains evidence, not analytics.

### P1 daily routines

Move from independent prompts to one chronological `Today` timeline containing workday boundaries, meals, therapy, and movement. Priority and due-window language must be visible. Medication items receive private-preview controls and exact user-entered instructions; nutrition is not scored.

### P2 ambient assistance

Posture, ergonomic check, daylight, environment, and wearable modules share one permissions pattern: source, purpose, current status, revoke action, data retained, and fallback. Camera-based posture never runs continuously by default.

## 15. Current design acceptance checklist

- Two scenarios only; all copy matches `WORKPULSE_SPEC.md` v1.4.
- Good scenario offers `Neck reset`, not squats.
- `MOVE NOW` and `NOT NOW` have equal structural and typographic authority.
- Calendar provenance and camera status are explicit.
- Camera starts only after a dedicated consent action.
- Manual completion is available before and after camera failure.
- Loading and active camera states do not cause destructive layout shift.
- Verified completion states that no video was recorded and camera is off.
- The full flow is keyboard usable with visible focus.
- Mobile works from 360 px without horizontal overflow.
- Reduced motion is respected.
- No history, cooldown, meal, therapy, or workday settings appear in the current MVP path.
