# WorkPulse Demo Design Specification

**Status:** implementation-ready design handoff
**Source of truth:** `WORKPULSE_SPEC.md` v0.4
**Surface:** single-page responsive web demo
**Primary viewport:** laptop presentation, with full usability from 360 px width
**Mode:** operate, with a short persuasive demo sequence
**Scope:** P0 only; this document does not add camera, authentication, live calendar, or LLM dependencies

## 1. Design intent

WorkPulse should feel like a calm decision instrument, not a fitness dashboard, habit tracker, or notification center. The page has one job: make it immediately obvious that WorkPulse weighs movement need against interruption cost and sometimes chooses not to intervene.

The defining visual contrast is:

- `MOVE NOW`: movement need is high and interruption cost is low. The interface opens into an actionable green state.
- `NOT NOW`: movement need is still high, but interruption cost is high. The interface settles into a protective deep-slate state.

The second state must feel equally intentional and valuable. It is not an error, rejection, warning, or disabled version of `MOVE NOW`.

### Experience principles

1. **Decision first.** The decision and its reason dominate; controls, history, and demo apparatus remain secondary.
2. **Show the trade-off.** Movement need and interruption cost stay visible beside the result so a judge can understand the logic without narration.
3. **Use plain evidence.** Prefer “57 minutes sitting” and “meeting in 12 minutes” over scores, charts, rings, or opaque AI language.
4. **Make restraint visible.** `NOT NOW` receives the same scale, finish, and confidence as `MOVE NOW`.
5. **Keep the demo recoverable.** Scenario switching and reset are always easy to find, but never compete with the decision.

### Explicit anti-goals

- No generic wellness imagery, stock photography, mascots, confetti, streaks, calories, badges, or guilt language.
- No faux AI chat interface, assistant avatar, sparkling AI icon, or “thinking” copy.
- No gradients, glass effects, neon glow, dashboard gauge clusters, or card grid made from every content group.
- No medical or guaranteed health claims.
- Do not expose the raw decision score in the primary UI. The user needs the reason, not the implementation formula.
- Do not animate the page in a way that delays or destabilizes the live pitch.

## 2. Information architecture

The page is one continuous surface with five regions in this order:

1. **Product header** — identity, product promise, local-data note, and `Reset demo`.
2. **Demo scenario control** — three fixed scenarios; clearly a demo control and visually secondary.
3. **Decision workspace** — current work context, decision factors, decision, explanation, and relevant action.
4. **Activity or outcome area** — appears in place beneath the decision only when the state requires it.
5. **Today’s history** — compact evidence that outcomes persist and affect later decisions.

The page must not add a marketing hero above the product. At desktop presentation height, the header, scenario selector, context, and full decision should all be visible without scrolling at 1440 × 900.

### Desktop hierarchy

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ WORKPULSE   Move more. Interrupt less.       Local to this browser  Reset│
├──────────────────────────────────────────────────────────────────────────┤
│ DEMO SCENARIO  [Good time to move] [Meeting starts soon] [Low need]     │
├───────────────────────┬──────────────────────────────────────────────────┤
│ WORK CONTEXT          │ DECISION                                         │
│ 14:03                 │ MOVE NOW                                         │
│                       │ You have a good window.                          │
│ 57 min  Sitting       │                                                  │
│ 12 min  To meeting    │ 10 squats · about 1 minute                      │
│ 78 min  Since move    │ [Start activity]  [Not now]                     │
│                       │                                                  │
│ NEED  High ━━━━━      │ WHY                                              │
│ COST  Low  ━━         │ You’ve been sitting for 57 minutes and have a   │
│                       │ 12-minute window before your next meeting.       │
├───────────────────────┴──────────────────────────────────────────────────┤
│ TODAY  14:04  10 squats  Completed                         Clear history│
└──────────────────────────────────────────────────────────────────────────┘
```

This is one bounded workspace with internal dividers, not a collection of floating cards. Use a single large panel for the working area and a single compact history region.

## 3. Responsive layout

### Global frame

- Maximum content width: `1200px`.
- Center in the viewport with `24px` page padding on desktop.
- Desktop vertical padding: `24px` top and `32px` bottom.
- Minimum supported width: `360px`.
- The page may grow vertically after an activity begins or history accumulates.

### Breakpoints

#### Large desktop: 1100 px and above

- Header is one row.
- Scenario selector is a three-column connected control.
- Decision workspace uses a 12-column grid: context/factors span 4 columns, decision span 8.
- Internal divider separates context from decision.
- Minimum decision workspace height: `430px`; avoid a viewport-filling hero.
- History entries use a compact row layout.

#### Tablet and small desktop: 768–1099 px

- Header keeps brand and reset on the first row; supporting privacy text may wrap below.
- Workspace uses a 5/7 column split when at least 900 px wide; below that it becomes one column.
- At one column, order is context → factor comparison → decision → actions → history.
- Scenario labels remain visible in three equal columns; descriptions are visually hidden but available to assistive technology.

#### Mobile: 360–767 px

- Page padding: `16px`; top and bottom padding: `16px` and `24px`.
- Header becomes two rows: brand/tagline first, local-data note and reset second.
- Scenario control becomes three full-width rows. Do not use horizontally scrolling chips.
- Context values form a three-column metric row if the viewport is at least 390 px; at 360–389 px use a two-column grid with the third metric spanning both columns.
- Decision is below context in normal document flow.
- Primary and secondary actions stack full width; `Start activity` comes first.
- History entries stack timestamp/outcome beneath activity name.
- Keep touch targets at least `44 × 44px` and never rely on hover.

### Responsive priority

Never hide the decision, reason, selected scenario, or the two factor levels. The next-meeting title may truncate to one line with the full value in accessible text. History may show the newest three records initially on mobile with a `Show all` disclosure if more exist.

## 4. Visual direction

### Character

Use editorial restraint plus instrument-like precision: warm off-white paper, dark botanical ink, crisp rules, compact labels, and one decisive field of color. The design should feel credible beside a calendar or professional productivity tool while remaining more humane than an analytics dashboard.

The signature element is the **decision balance**: two plainly labeled horizontal rails—`Movement need` and `Interruption cost`—shown immediately before the decision. The rails do not animate like gauges and do not display percentages. They show `LOW`, `MEDIUM`, or `HIGH` in text plus three discrete filled segments.

### Colour tokens

| Token | Value | Use |
|---|---:|---|
| `canvas` | `#F2F0E9` | page background |
| `surface` | `#FCFCF8` | main workspace and controls |
| `ink` | `#142019` | primary text |
| `ink-subtle` | `#56615B` | supporting copy |
| `line` | `#C9D0CB` | dividers and default borders |
| `line-strong` | `#8D9992` | selected control edges and rail outlines |
| `move` | `#0B6B4F` | `MOVE NOW` field, primary action, completed outcome |
| `move-soft` | `#DCEDE6` | selected good-window scenario and supportive background |
| `hold` | `#26394C` | `NOT NOW` field and meeting-protection state |
| `hold-soft` | `#E1E8EE` | selected meeting-soon scenario and supportive background |
| `low-soft` | `#E8E7DF` | low-need state background |
| `attention` | `#8A4B08` | high interruption-cost label or cooldown detail on light surfaces |
| `danger` | `#9D3430` | destructive text action only; never for `NOT NOW` |
| `focus` | `#005FCC` | keyboard focus outline |
| `white` | `#FFFFFF` | text on `move` and `hold` |

Rules:

- Decision meaning must always be conveyed by text and structure, not color alone.
- Use `move` and `hold` as solid fields or strong borders, never gradients.
- Reserve `danger` for `Clear history` if exposed separately. `Reset demo` is neutral because the data is explicitly disposable demo state.
- Factor rails inherit the decision family only for filled segments; their text labels remain readable in `ink` or `ink-subtle`.

### Typography

Use the existing local Next.js fonts; do not add a network or package dependency.

| Role | Typeface | Size / line-height | Weight | Notes |
|---|---|---|---|---|
| Product wordmark | Geist Sans | `14/18` | 700 | uppercase, tracking `0.16em` |
| Page promise | Geist Sans | `15/20` | 450 | sentence case |
| Decision label desktop | Geist Sans | `56/56` | 650 | `MOVE NOW` / `NOT NOW`; never larger than 64 px |
| Decision label mobile | Geist Sans | `40/42` | 650 | fits 360 px without wrapping |
| Decision lead | Geist Sans | `24/30` | 550 | plain-language summary |
| Metric value | Geist Mono | `32/34` | 600 | tabular figures enabled |
| Metric unit/label | Geist Sans | `13/18` | 550 | label beneath or beside value |
| Body | Geist Sans | `16/24` | 400 | reasons and instructions |
| Small/support | Geist Sans | `13/18` | 450 | privacy note and history metadata |
| Eyebrow | Geist Sans | `12/16` | 700 | uppercase, tracking `0.12em` |
| Control | Geist Sans | `15/20` | 600 | buttons and selector labels |

Use Geist Mono only for time and numeric context, not for whole sentences. Use tabular figures for changing minute values to prevent layout shift.

### Spacing and shape tokens

- Base unit: `4px`.
- Space scale: `4, 8, 12, 16, 24, 32, 48, 64`.
- Outer workspace radius: `20px` desktop, `16px` mobile.
- Button/control radius: `10px`.
- Small status marker radius: `4px`; avoid defaulting every label to a pill.
- Border: `1px solid line`; selected scenario adds a `2px` inset edge or stronger bottom rule without changing dimensions.
- Shadow: none by default. The main workspace may use `0 12px 32px rgba(20,32,25,.07)` only if separation from the canvas is insufficient.

## 5. Page regions and components

### 5.1 Product header

**Left:**

- `WORKPULSE`
- `Move more. Interrupt less.`

**Right:**

- Shield or lock icon only if an existing icon solution is available; otherwise use text alone.
- `Demo data stays in this browser.`
- `Reset demo` text button.

The header is compact. It must not resemble a marketing navigation bar and has no unused nav links.

#### Header actions

- `Reset demo` clears local history and restores the `Good time to move` scenario in the `IDLE` state.
- Do not add a confirmation dialog; demo data is explicitly disposable and rapid recovery matters.
- After reset, show a non-blocking status message: `Demo reset. Good time to move is ready.`

### 5.2 Scenario selector

Label the group `Demo scenario`. Implement it as a radio group or tabs with correct single-selection semantics.

| Scenario | Visible label | Supporting line on desktop | Initial result after evaluation |
|---|---|---|---|
| `good-window` | `Good time to move` | `57 min sitting · meeting in 12 min` | `MOVE NOW` |
| `meeting-soon` | `Meeting starts soon` | `72 min sitting · meeting in 2 min` | `NOT NOW` |
| `low-need` | `Low movement need` | `25 min sitting · meeting in 30 min` | `NOT NOW` |

States:

- **Default:** transparent/surface background, `line` border, `ink` label.
- **Hover:** subtle `#F5F6F2` background; no lift or shadow.
- **Selected good window:** `move-soft` background and `move` selection rule.
- **Selected meeting soon:** `hold-soft` background and `hold` selection rule.
- **Selected low need:** `low-soft` background and `ink-subtle` selection rule.
- **Focus-visible:** `3px` `focus` outline with `2px` offset.
- **Evaluating:** selector remains visible but is temporarily disabled until the result commits; preserve its visual dimensions.

Selecting a scenario immediately updates context and returns the decision region to `IDLE`. It must not automatically evaluate because the explicit reveal is useful during the pitch.

### 5.3 Work context

Heading: `Work context`
Time line: `14:03 · Today` (value follows scenario data)

Show three metrics:

1. `57 min` / `Sitting`
2. `12 min` / `To Design Review`
3. `78 min` / `Since last movement`

For meeting-soon, the second metric is `2 min / To Design Review`. For low need, it is `30 min / To Team Sync`.

Do not use donut charts or decorative icons. The numbers are the evidence. Use thin dividers or a tidy metric grid.

### 5.4 Decision balance

Show both factors in every evaluated state:

```text
Movement need       HIGH   ■ ■ ■
Interruption cost   LOW    ■ □ □
```

- Each rail has three equal rectangular segments, `20 × 6px` desktop and `18 × 6px` mobile.
- Include the text level; segments are redundant visual reinforcement.
- Use the exact label `Interruption cost`, not `Opportunity`, because the contrast is central to the pitch.
- In `IDLE`, render neutral placeholders with labels and `—` values. Do not predict the result.
- In `EVALUATING`, keep the labels and use a subtle left-to-right fill lasting no more than 220 ms.

Canonical factor states:

| Scenario | Movement need | Interruption cost |
|---|---|---|
| Good time to move | `HIGH` | `LOW` |
| Meeting starts soon | `HIGH` | `HIGH` |
| Low movement need | `LOW` | value returned by engine, expected `LOW` |

### 5.5 Decision region

This is the visual focal point and follows the application state machine.

#### `IDLE`

- Eyebrow: `Ready to evaluate`
- Lead: `Should WorkPulse interrupt right now?`
- Supporting copy: `Weigh movement need against the cost of interrupting your work.`
- Primary button: `Evaluate this moment`
- No secondary action.

#### `EVALUATING`

- Status text: `Checking this moment…`
- Keep the context visible and stable.
- Disable duplicate evaluation.
- Show a 180–260 ms transition; do not simulate a slow AI response.
- The status is announced politely to assistive technology.

#### `RECOMMENDED` / `MOVE NOW`

- Solid `move` decision field with white text, or a white decision field with a strong `move` left edge if full color harms layout. Prefer the solid field for the pitch viewport.
- Eyebrow: `Decision`
- Main label: `MOVE NOW`
- Lead: `You have a good window.`
- Activity line: `10 squats · about 1 minute`
- Primary action: `Start activity`
- Secondary action: `Not now`
- Explanation label: `Why this decision`
- Explanation: `You’ve been sitting for 57 minutes and have a 12-minute window before your next meeting.`

Do not use exclamation marks. The voice is confident, not breathless.

#### `NOT_NOW` — meeting hard gate

- Solid `hold` decision field with white text, equal in size to `MOVE NOW`.
- Eyebrow: `Decision`
- Main label: `NOT NOW`
- Lead: `Protect the next commitment.`
- Supporting line: `Design Review starts in 2 minutes.`
- No `Start` or dismissal action.
- Primary neutral action: `Check another scenario`
- Explanation label: `Why this decision`
- Explanation: `You need movement, but your next meeting starts in 2 minutes. I’ll check again afterwards.`

Avoid clocks, alerts, red color, or warning language. This is a correct protective decision.

#### `NOT_NOW` — low movement need

- Light `low-soft` field with `ink` text and a strong neutral edge.
- Main label: `NOT NOW`
- Lead: `No interruption needed.`
- Supporting line: `You moved recently.`
- Action: `Check another scenario`
- Explanation: `Your movement need is still low. WorkPulse will check again later.`

#### `NOT_NOW` — cooldown

- Use the `hold-soft` family, not an error state.
- Main label: `NOT NOW`
- Lead: `Your choice is being respected.`
- Explanation: `You recently declined an activity, so WorkPulse is respecting your 15-minute cooldown.`
- If a reliable remaining-time value exists, append `Ready again in {n} min`; otherwise do not invent a countdown.
- Action: `Check another scenario`.

### 5.6 Activity session

Starting an activity replaces the recommendation actions within the same decision region. Do not navigate to a new page or modal.

#### `ACTIVE`

- Eyebrow: `Activity in progress`
- Heading: `10 squats`
- Duration: `About 1 minute`
- Instruction: `Complete ten controlled squats at a comfortable pace.`
- Primary action: `Complete activity`
- Secondary action: `Stop for now`
- Optional simple elapsed indicator is allowed only if implemented reliably; it cannot block completion.
- Do not use camera language in P0.

`Stop for now` records `skipped` only if the implementation already supports that outcome in the flow; otherwise return to the recommendation without persistence. Do not relabel it `Not now`, which is reserved for dismissal before starting.

#### `COMPLETED`

- Use `move-soft` background and a simple check mark if available.
- Heading: `Movement recorded`
- Copy: `10 squats completed. Nice work—back to your day.`
- Primary action: `Evaluate another moment`
- The new completed history row appears at the same time.
- Confirmation remains visible until the user takes the next action; do not auto-dismiss it during a pitch.

#### `DISMISSED`

- Heading: `Noted—no reminders for 15 minutes.`
- Copy: `WorkPulse will respect your cooldown and check again later.`
- Primary action: `Continue`
- The dismissed history row appears immediately.
- No guilt copy, streak loss, or attempt to persuade the user back into the activity.

### 5.7 Intervention history

Heading: `Today`
Supporting label: `Stored only in this browser`

#### Empty

- `No interventions yet.`
- `Completed or dismissed activities will appear here.`
- Keep empty history compact; it should not look like missing content.

#### Populated row

Example completed row:

```text
14:04   10 squats                          COMPLETED
        Good time to move · 57 min sitting
```

Example dismissed row:

```text
14:06   10 squats                          DISMISSED
        Good time to move · 57 min sitting
```

- Reverse chronological order.
- Outcome is uppercase text with an adjacent icon or shape; never color alone.
- `COMPLETED` uses `move`; `DISMISSED` uses neutral `ink-subtle`, not danger red.
- Show at most five rows before a `Show all` disclosure on desktop and three on mobile.
- `Clear history` is a small text action in the history heading. `Reset demo` remains the preferred pitch recovery action.

## 6. Interaction specification

### Primary flow

1. Initial load selects `Good time to move` and shows `IDLE`.
2. `Evaluate this moment` triggers `EVALUATING`, then commits the deterministic result.
3. A `MOVE NOW` result offers `Start activity` and `Not now`.
4. `Start activity` changes the decision region to `ACTIVE` in place.
5. `Complete activity` persists a completed record and changes the region to `COMPLETED`.
6. Selecting `Meeting starts soon` updates the context and returns the region to `IDLE`.
7. Evaluating reveals the equally prominent meeting-gate `NOT NOW` state.

### Scenario changes

- Scenario selection always resets transient UI (`EVALUATING`, `ACTIVE`, success acknowledgement) to `IDLE`.
- It does not clear history.
- If an activity is active, changing scenario requires one lightweight inline confirmation: `Leave this activity? Progress isn’t saved.` with `Leave activity` and `Keep going`. Do not use a browser alert.

### Motion

- State change: 180–220 ms opacity plus a maximum 8 px vertical shift.
- Decision field color change: 160 ms.
- Scenario selection background: 120 ms.
- No spring/bounce motion, confetti, counters rolling through intermediate values, or staggered reveals.
- Respect `prefers-reduced-motion`; replace transforms with an immediate change or a brief opacity transition under 100 ms.

### Feedback

- Buttons show hover, pressed, focus-visible, and disabled states.
- Disabled evaluation uses 50% visual emphasis but retains readable text.
- Persistence failure, if detected, shows: `History couldn’t be saved in this browser. The current demo still works.` The core decision remains usable.
- Invalid local data must fall back to empty history without exposing a technical error.

## 7. Control states

### Primary button

- Background `move`, text `white`, minimum height `48px`, horizontal padding `20px`.
- Hover: darken to `#085C44`.
- Pressed: darken to `#064D39`, translate at most `1px` vertically.
- Focus-visible: `3px focus` outline, `2px` offset.
- Disabled: `#9CB7AB` background with `#FFFFFF`; cursor and semantics disabled.

In the `hold` field, a neutral action may use white background with `hold` text so the page does not imply movement is the next action.

### Secondary button

- Transparent or `surface` background, `1px line-strong` border, `ink` text.
- Hover: `#F0F2EE`.
- Pressed: `#E6EAE6`.
- Same focus treatment and target size as the primary button.

### Text action

- Underlined on hover and focus; underline offset `3px`.
- Minimum 44 px interactive height through padding, even when visually compact.
- Destructive actions use `danger` text plus explicit copy, never an icon alone.

## 8. Accessibility requirements

Target WCAG 2.2 AA for the P0 surface.

- Use semantic landmarks: `header`, `main`, and a labelled history `section`.
- Use one page-level `h1`; recommendation, activity, and history headings follow a logical hierarchy even as states change.
- Scenario selector uses native radio inputs or an ARIA-complete tab pattern. Arrow-key behavior must match the chosen pattern.
- All actions are native buttons. Do not attach click behavior to generic containers.
- Maintain at least 4.5:1 contrast for body/control text and 3:1 for large display text, component borders, and focus indicators.
- Decision changes use a persistent `aria-live="polite"` region. Announce one concise result: `Decision: Move now. Movement need high. Interruption cost low.` or its `Not now` equivalent.
- `EVALUATING` sets the relevant region to busy and prevents duplicate submissions.
- Move keyboard focus to the decision heading after evaluation and to the activity heading after `Start activity`; do not move focus for passive history updates.
- Visible focus must never be clipped by rounded containers or overflow.
- Every icon has text or an accessible label. Decorative rail segments are hidden from assistive technology because the text level is authoritative.
- Do not use color, position, or animation as the sole status cue.
- At 200% zoom and 320 CSS px effective width, content reflows without two-dimensional scrolling.
- Support browser text enlargement without clipping buttons or forcing the decision labels to overlap.
- Provide at least 44 × 44 px pointer targets and adequate spacing between adjacent controls.
- Respect `prefers-reduced-motion` and `prefers-contrast` where available.
- Keep language plain and non-judgmental. Never frame dismissal as failure.

## 9. Content specification

### Fixed product copy

- Wordmark: `WORKPULSE`
- Tagline: `Move more. Interrupt less.`
- One-line explanation, used only where space allows: `An AI coworker that finds the least disruptive moment to get you moving.`
- Privacy line: `Demo data stays in this browser.`

### Good-window screen

- Decision: `MOVE NOW`
- Lead: `You have a good window.`
- Activity: `10 squats · about 1 minute`
- Reason: `You’ve been sitting for 57 minutes and have a 12-minute window before your next meeting.`
- Actions: `Start activity`, `Not now`

### Meeting-soon screen

- Decision: `NOT NOW`
- Lead: `Protect the next commitment.`
- Context line: `Design Review starts in 2 minutes.`
- Reason: `You need movement, but your next meeting starts in 2 minutes. I’ll check again afterwards.`
- Action: `Check another scenario`

### Low-need screen

- Decision: `NOT NOW`
- Lead: `No interruption needed.`
- Context line: `You moved 25 minutes ago.`
- Reason: `Your movement need is still low. WorkPulse will check again later.`
- Action: `Check another scenario`

### Voice rules

- Calm, direct, and specific.
- Use contractions naturally.
- Avoid “should,” “failed,” “overdue,” “burn,” “optimize yourself,” and medical language.
- Name the decisive context rather than praising the algorithm.
- Prefer `activity` or the actual movement name over `workout`.
- Use sentence case everywhere except the product wordmark, decision label, factor level, and history outcome.

## 10. Pitch-ready screen sequence

The live demo should be rehearsed against these exact frames. Each frame must also work as a still screenshot fallback.

### Frame 1 — Establish the question (0:35)

- Selected scenario: `Good time to move`.
- State: `IDLE`.
- Visible evidence: `57 min sitting`, `12 min to Design Review`, `78 min since last movement`.
- Focal copy: `Should WorkPulse interrupt right now?`
- Presenter action: select `Evaluate this moment`.

### Frame 2 — Reveal `MOVE NOW` (0:42)

- State: `RECOMMENDED`.
- Focal field: green `MOVE NOW`.
- Factors: `Movement need HIGH`; `Interruption cost LOW`.
- Visible reason and `10 squats · about 1 minute`.
- Presenter line: explain that the window is useful and low-cost.

### Frame 3 — Make it actionable (0:55)

- Presenter selects `Start activity`.
- State: `ACTIVE`.
- Show `10 squats`, one-sentence instruction, and `Complete activity`.
- No timer dependency; the presenter may immediately complete during the hackathon pitch.

### Frame 4 — Prove memory (1:03)

- State: `COMPLETED`.
- Confirmation: `Movement recorded`.
- History shows a new `COMPLETED` row.
- Presenter points to the record, then selects `Meeting starts soon`.

### Frame 5 — Set up the contrast (1:09)

- Selected scenario: `Meeting starts soon`.
- State: `IDLE`.
- Evidence changes to `72 min sitting`, `2 min to Design Review`, `90 min since last movement`.
- Presenter selects `Evaluate this moment`.

### Frame 6 — Reveal `NOT NOW` (1:14)

- State: meeting-gate `NOT_NOW`.
- Focal field: deep-slate `NOT NOW`, equal in prominence to Frame 2.
- Factors: `Movement need HIGH`; `Interruption cost HIGH`.
- Reason names the meeting in 2 minutes.
- Presenter line: **“That’s the difference between a reminder and an agent.”**

### Frame 7 — Close on trust (1:22 onward)

- Remain on `NOT NOW`; do not navigate to an architecture or feature slide.
- The visible browser-local privacy line and history support the close.
- Closing product line: `Move more. Interrupt less.`

### Screenshot set

Capture before submission:

1. Desktop `MOVE NOW` at 1440 × 900.
2. Desktop meeting-gate `NOT NOW` at 1440 × 900.
3. Mobile `MOVE NOW` at 390 × 844.
4. Desktop completed state with one history record.

The first screenshot is the primary submission image; the second is the essential contrast image.

## 11. Implementation mapping

The existing component boundaries map cleanly to this design:

| Component | Design responsibility |
|---|---|
| `ScenarioSelector` | labelled single-selection demo control and its states |
| `WorkContextCard` | current time, three context metrics, and meeting label |
| `DecisionCard` | factor rails, all decision states, reason, and recommendation actions |
| `ActivityCard` | recommended activity summary inside `MOVE NOW` |
| `ActivitySession` | active, completed, and stopped activity states |
| `InterventionHistory` | empty/populated history, clear action, browser-local note |

Implementation must consume domain outputs as provided. Visual labels may translate `MOVE_NOW` to `MOVE NOW`, but the UI must not recalculate, override, or infer decision logic.

## 12. Acceptance checklist for the implemented UI

- A first-time judge can identify the current scenario, three context facts, two decision factors, and decision within 20 seconds.
- `MOVE NOW` and meeting-gate `NOT NOW` are equal in scale and craft, not primary versus fallback.
- The good-window and meeting-soon states are distinguishable without color.
- The scenario selector is visible but does not compete with the decision.
- `NOT NOW` never shows `Start activity`.
- Completing or dismissing produces an immediate visible history record.
- A reload preserves history; reset returns to the known initial state in one action.
- The complete primary flow fits and remains usable at 360 px width.
- The desktop pitch path does not require scrolling before the activity/history section.
- Keyboard navigation, visible focus, live announcements, 200% zoom, reduced motion, and contrast all pass manual review.
- No P1/P2 feature or remote dependency can block the P0 demo.
