# WorkPulse — Figma Production Handoff

**Version:** 2.0
**Product authority:** `WORKPULSE_SPEC.md` v1.4
**Design authority:** `DESIGN.md` and `DESIGN_SPEC.md` v2.0
**Target:** current two-scenario MVP with optional camera-guided neck reset

## 1. Figma deliverable

Create a componentized Figma file containing:

1. Local variables and text styles matching the implemented visual system.
2. Reusable components for the current product surface.
3. Desktop frames at 1440 px width.
4. Mobile frames at 390 px plus a 360 px stress test.
5. A connected prototype for the complete decision and camera-fallback flow.
6. A pitch board comparing `MOVE NOW` and `NOT NOW`.

Do not add the roadmap features to the current screen set. Workday settings, multiple activities, history, meals, medication, posture, and wearable UI belong on a separate future-concepts page only if explicitly requested.

## 2. File structure

```text
00 · Cover
01 · Foundations
02 · Components
03 · Desktop MVP
04 · Mobile MVP
05 · Camera States
06 · Prototype Flow
07 · Pitch Board
90 · Future Concepts
99 · Scratch
```

`90 · Future Concepts` begins empty except for a scope note linking to section 14 of `DESIGN_SPEC.md`.

## 3. Frame names

### Desktop

```text
D-01 · Good Window · Idle
D-02 · Good Window · Move Now
D-03 · Neck Reset · Consent
D-04 · Neck Reset · Loading
D-05 · Neck Reset · Camera Active
D-06 · Neck Reset · Camera Denied
D-07 · Neck Reset · Camera Unavailable
D-08 · Neck Reset · Camera Error
D-09 · Neck Reset · Completed Manual
D-10 · Neck Reset · Completed Verified
D-11 · Meeting Soon · Idle
D-12 · Meeting Soon · Not Now
```

### Mobile

```text
M-01 · Good Window · Idle
M-02 · Good Window · Move Now
M-03 · Neck Reset · Consent
M-04 · Neck Reset · Camera Active
M-05 · Neck Reset · Recovery
M-06 · Neck Reset · Completed
M-07 · Meeting Soon · Not Now
M-08 · 360 Width Stress Test
```

## 4. Grids and frames

### Desktop

- Frame: `1440 × 1100` for product-state design; create separate `1440 × 900` export crops.
- App shell: maximum `1440px`, `48px` side padding.
- Main content width: `1344px`.
- Header: three-column grid.
- Premise: asymmetric 1.45 / 0.55 layout.
- Demo layout: `285px` scenario rail, `40px` gutter, flexible stage.
- Context and state panels share a joined seam.

### Tablet

- Reference frame: `900 × 1000`.
- Scenario options move above the stage in two equal columns.
- Context/state instrument remains joined.

### Mobile

- Primary frame: `390 × 844`.
- Stress test: `360 × 800`.
- Horizontal padding: `18px`.
- One content column.
- Scenario selector becomes a native-select representation.
- Context metrics: two columns plus one full-width second row.
- Actions fill width.

## 5. Variable collections

### `WorkPulse · Color`

| Variable | Value |
|---|---:|
| `color/ink` | `#16231D` |
| `color/ink-soft` | `#526159` |
| `color/paper` | `#F4F1E8` |
| `color/paper-raised` | `#FBFAF5` |
| `color/rule` | `#D8D5CA` |
| `color/signal` | `#15684A` |
| `color/signal-bright` | `#B8F36B` |
| `color/signal-soft` | `#DFF1CC` |
| `color/hold` | `#9A4E27` |
| `color/hold-bright` | `#F2B56D` |
| `color/focus` | `#205FCA` |
| `color/desk-dark` | `#1D2A24` |
| `color/decision-go` | `#183E2F` |
| `color/decision-hold` | `#493125` |
| `color/inverse-text` | `#F8F8F1` |

One mode: `Light`. Do not invent dark mode.

### `WorkPulse · Space`

`4, 8, 12, 18, 24, 30, 40, 48, 58, 68`

Name variables by pixel value, for example `space/18`.

### `WorkPulse · Radius`

| Variable | Value |
|---|---:|
| `radius/pulse-bar` | `4` |
| `radius/control` | `10` |
| `radius/panel` | `14` |
| `radius/pill` | `999` |

### `WorkPulse · Size`

| Variable | Value |
|---|---:|
| `size/control-min` | `48` |
| `size/touch-target` | `44` |
| `size/focus-stroke` | `3` |
| `size/scenario-rail` | `285` |
| `size/demo-gap` | `40` |

## 6. Text styles

Use Geist and Geist Mono from the project; never substitute Inter silently.

| Style | Size / line | Weight |
|---|---|---:|
| `Display/Decision` | `clamp reference: 64–112 / .9` | 600 |
| `Display/Premise` | `45–74 / .98` | 610 |
| `Heading/State` | `25–40 / 1.12` | 570 |
| `Body/Default` | `16 / 26` | 400 |
| `Label/System` | `12 / 18` | 680 |
| `Metric/Value` | `34–58 / .95` | 640 |
| `Metric/Unit` | `12 / 18` | 400 |

Set context numbers to tabular figures.

## 7. Component inventory

Use Auto Layout for every component and major region.

### `Shell/Header`

Properties: `Viewport = Desktop | Mobile`, `Show Tagline = True | False`.

### `Demo/Scenario Selector`

Properties: `Viewport = Desktop | Tablet | Mobile`, `Selected = Good Window | Meeting Soon`.

Nested `Demo/Scenario Option` properties:

```text
Scenario = Good Window | Meeting Soon
State = Default | Hover | Selected | Focus | Disabled
Label = text
Description = text
```

### `Context/Source`

Properties:

```text
Source = Calendar | Camera
Status = Demo | Off | Starting | Active | Unavailable
Label = text
```

### `Context/Metric`

Properties: `Value`, `Unit`, `Label`, `Supporting Copy`, `Layout = Desktop | Mobile`.

### `Context/Panel`

Properties: `Scenario = Good Window | Meeting Soon`, `Camera Status`, `Viewport`.

### `Decision/Surface`

Properties:

```text
State = Idle | Move Now | Not Now | Completed Manual | Completed Verified
Viewport = Desktop | Mobile
Movement Need = Empty | Low | Medium | High
Interruption Cost = Empty | Low | Medium | High
Show Activity = boolean
Show Action = boolean
```

### `Activity/Camera Session`

Properties:

```text
State = Consent | Loading | Active | Tracking Lost | Denied | Unavailable | Error
Progress = 0 | 1 | 2 | 3 | 4
Viewport = Desktop | Mobile
```

### `Core/Button`

Properties:

```text
Hierarchy = Primary | Quiet | Text
State = Default | Hover | Pressed | Focus | Disabled
Width = Hug | Fill
Label = text
Leading Icon = boolean
Trailing Icon = boolean
```

Primary uses signal lime; quiet uses transparent inverse treatment on dark surfaces. All variants maintain `48px` height.

### `Core/Status`

Properties: `Kind = Context Ready | Camera Active | Demo Data | Camera Off`, `Label`.

## 8. Auto Layout anatomy

### Product frame

```text
Direction: Vertical
Width: Fixed to viewport
Height: Hug, minimum viewport height
Desktop padding: 0 / 48 / 0 / 48
Mobile padding: 0 / 18 / 0 / 18
Fill: color/paper
```

### Demo instrument

```text
Desktop direction: Horizontal
Children: Scenario Rail, Stage
Gap: 40
Stage direction: Vertical
Stage children: Context Panel, State Surface
Stage gap: 0
```

Context panel rounds only the top outer corners. State surface rounds only the bottom outer corners. Never wrap them in separate floating cards.

### Camera stage

- Fixed aspect-ratio frame within the activity surface.
- Clip content on.
- Video fill uses mirrored-cover representation.
- Pose overlay is a separate decorative vector/canvas layer.
- Live badge sits within normal padding, not over the user's face.
- Loading/recovery variants retain the same frame bounds.

## 9. Canonical screen content

### `D-01 · Good Window · Idle`

- Good scenario selected.
- Context `57 / in 12 / 78` at `14:03`, Design Review.
- Idle question: `Is now a good time to move?`
- Action: `Ask WorkPulse`.

### `D-02 · Good Window · Move Now`

- `WINDOW OPEN`.
- `MOVE NOW`.
- Movement need `HIGH`; interruption cost `LOW`.
- `Neck reset`; `About 45 seconds`.
- Canonical reason.
- `Start activity`.

### `D-03 · Neck Reset · Consent`

- `Camera-guided activity`.
- `Neck reset`.
- `0 / 4`.
- Local-processing and no-recording copy.
- Safety copy.
- `Enable camera`, `Complete without camera`, `Stop activity`.

### `D-04 · Neck Reset · Loading`

- Stable camera-stage placeholder.
- `Starting the camera and pose model…`
- Safety copy and stop remain visible.

### `D-05 · Neck Reset · Camera Active`

- Mirrored preview with lime pose trace.
- `Camera active`.
- One current movement instruction.
- Progress example `2 / 4`.
- Safety and stop action.

### Recovery frames

- Denied: browser-permission guidance, retry, manual completion.
- Unavailable: no-camera explanation, manual completion primary.
- Error: connection/access guidance, retry, manual completion.
- Tracking lost is not a destructive error frame; it overlays `Keep your face and both shoulders visible.` within Active.

### Completion frames

- Manual: `Activity complete`, `Nice work. Back to your day.`, `Completed without camera verification.`
- Verified: `Movement verified`, `Nice work. Neck reset verified.`, `Four movements confirmed on this device. No video was recorded. Camera is off.`
- Both: `Run again`.

### `D-12 · Meeting Soon · Not Now`

- Meeting scenario selected.
- Context `72 / in 2 / 90` at `14:18`, Design Review.
- `HOLD THIS MOMENT`.
- `NOT NOW`.
- Movement need `HIGH`; interruption cost `HIGH`.
- Canonical meeting reason.
- No activity or start action.

## 10. Prototype flow

Flow name: `WorkPulse · MVP Pitch`.

| From | Trigger | To |
|---|---|---|
| `D-01` | Ask WorkPulse | `D-02` |
| `D-02` | Start activity | `D-03` |
| `D-03` | Enable camera | `D-04` then `D-05` |
| `D-03` | Complete without camera | `D-09` |
| `D-04` | simulated success | `D-05` |
| `D-05` | complete sequence | `D-10` |
| any camera recovery | Complete without camera | `D-09` |
| `D-09` or `D-10` | Run again | `D-01` |
| `D-01` | Meeting Soon scenario | `D-11` |
| `D-11` | Ask WorkPulse | `D-12` |
| `D-12` | Good Window scenario | `D-01` |

Use 160–220 ms Smart Animate only where matching layers are stable. Camera loading may use an after-delay in the prototype, but keep it below 500 ms and label it simulated. No bounce or confetti.

## 11. Pitch board

Create a `1920 × 1080` comparison board:

- Left: `57 min`, meeting in `12 min`, high need, low cost, `MOVE NOW`, neck reset.
- Right: `72 min`, meeting in `2 min`, high need, high cost, `NOT NOW`, no activity.
- Footer: `That's the difference between a reminder and an agent.`

Reuse product component instances. The board is not a new visual language.

Create export frames:

```text
Export · Move Now · 1440×900
Export · Not Now · 1440×900
Export · Camera Consent · 1440×900
Export · Mobile Not Now · 390×844
```

Do not use the existing desktop review PNG as the final Move Now reference: it contains stale `10 squats` copy.

## 12. Accessibility annotations

Annotate on `01 · Foundations`:

- Scenario control maps to radios/select.
- Result region receives focus and a polite live announcement.
- Camera permission errors are announced without repeated pose-progress chatter.
- Video has a label; pose overlay is decorative.
- Focus ring: 3 px blue plus 3 px offset.
- Minimum target: 44 × 44 px.
- Decision and camera meaning do not rely on colour.
- Mobile reflows at 320 CSS px effective width and 200% zoom.
- Reduced motion removes translation and decorative pulse.

## 13. Content lock

Use these exact strings as editable text properties:

```text
WorkPulse
Move more. Interrupt less.
Your workday has a rhythm. Find the right moment to move.
WorkPulse weighs movement need against interruption cost, then makes one clear call — without another noisy reminder.
Good time to move
Meeting starts soon
Two fixed contexts. No calendar connection or setup required.
Context is ready
Is now a good time to move?
Ask WorkPulse
WINDOW OPEN
MOVE NOW
Movement need
Interruption cost
Smallest useful move
Neck reset
About 45 seconds
You've been sitting for 57 minutes and have a 12-minute window before your next meeting.
Start activity
HOLD THIS MOMENT
NOT NOW
You need movement, but your next meeting starts in 2 minutes. I'll check again afterwards.
Camera-guided activity
Follow four gentle neck movements
Your image is processed on this device. WorkPulse does not record, save, or upload video. The camera switches off after the movement check.
Use a comfortable range. Stop if you feel pain or dizziness.
Enable camera
Complete without camera
Starting the camera and pose model…
Camera active
Keep your face and both shoulders visible.
Movement verified
Nice work. Neck reset verified.
Four movements confirmed on this device. No video was recorded. Camera is off.
Activity complete
Nice work. Back to your day.
Run again
```

## 14. Quality checklist

- Variables bind all repeated colours, spacing, and radii.
- Repeated UI is componentized; no duplicated buttons or state surfaces.
- Every major region uses Auto Layout.
- Mobile frames are recomposed, not scaled desktop copies.
- Good scenario says `Neck reset`, never `10 squats`.
- Two scenarios only.
- Move and hold have equal structure and prominence.
- Camera consent is separate from activity start.
- Manual fallback is visible in consent and recovery states.
- Verified completion confirms camera off.
- No history, cooldown, third scenario, meal, medication, or settings UI appears in current MVP frames.
- Prototype has no dead ends in the pitch path.
