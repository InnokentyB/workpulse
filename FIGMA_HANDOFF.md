# WorkPulse — Figma Production Handoff

**Purpose:** translate `DESIGN_SPEC.md` into a structured, reusable Figma file
**Product authority:** `WORKPULSE_SPEC.md`
**Visual authority:** `DESIGN_SPEC.md`
**Target:** responsive web application demo, not a marketing landing page
**Status:** ready for manual Figma assembly or Figma-agent generation

## 1. Deliverable definition

Create a Figma file that contains:

1. Local variables for color, spacing, radius, sizing, and motion.
2. Local text styles using Geist Sans and Geist Mono.
3. Reusable components and component sets for every repeated UI element.
4. Desktop frames for the complete P0 state sequence.
5. Mobile frames for the critical P0 states.
6. A connected click-through prototype for the live pitch.
7. A dedicated pitch-board page showing the `MOVE NOW` / `NOT NOW` contrast side by side.

Do not create a new product concept. Do not add navigation, analytics, health scores, chat, authentication, camera controls, or nutrition UI. The Figma file visualizes the existing specification.

## 2. Figma file structure

Use these page names and order:

```text
00 · Cover
01 · Foundations
02 · Components
03 · Desktop Screens
04 · Mobile Screens
05 · Prototype Flow
06 · Pitch Board
99 · Scratch
```

### Page responsibilities

| Page | Contents |
|---|---|
| `00 · Cover` | Product name, tagline, file status, source-document links, and version note. |
| `01 · Foundations` | Variable tables, typography specimens, spacing, radii, grid, focus, and accessibility notes. |
| `02 · Components` | Published local component sets and usage examples. |
| `03 · Desktop Screens` | 1440 × 900 product states. |
| `04 · Mobile Screens` | 390 × 844 critical product states plus 360 px stress-test frame. |
| `05 · Prototype Flow` | Duplicate presentation frames connected into one clean click path. |
| `06 · Pitch Board` | Curated comparison and submission-image compositions. |
| `99 · Scratch` | Temporary exploration only; nothing here is implementation authority. |

## 3. Naming convention

Use slash-based Figma names so assets remain searchable and instance swaps are predictable.

### Components

```text
Core/Button
Core/Text Action
Core/Status Message
Demo/Scenario Option
Demo/Scenario Selector
Context/Metric
Decision/Factor Rail
Decision/Panel
Activity/Summary
Activity/Session
History/Row
History/Section
Shell/Product Header
Shell/Work Context
Shell/App Frame
```

### Screen frames

```text
D-01 · Good Window · Idle
D-02 · Good Window · Move Now
D-03 · Good Window · Activity Active
D-04 · Good Window · Completed
D-05 · Meeting Soon · Idle
D-06 · Meeting Soon · Not Now
D-07 · Low Need · Not Now
D-08 · Cooldown · Not Now
D-09 · History Populated

M-01 · Good Window · Idle
M-02 · Good Window · Move Now
M-03 · Activity Active
M-04 · Completed
M-05 · Meeting Soon · Not Now
M-06 · Low Need · Not Now
M-07 · 360 Width Stress Test
```

### Layer names

- Use semantic names: `Header`, `Scenario Selector`, `Context Column`, `Decision Column`, `Reason`, `Actions`, `History`.
- Do not leave layers named `Frame 123`, `Group 8`, `Rectangle`, or `Text`.
- Name repeated nested elements by role: `Label`, `Value`, `Supporting Copy`, `Icon`, `Rail Segments`.
- Keep decorative rail segments inside a frame named `Visual Reinforcement`; the level text remains authoritative.

## 4. Frame and grid setup

### Desktop product frame

| Property | Value |
|---|---:|
| Frame | `1440 × 900` |
| Content maximum | `1200px` |
| Outer horizontal margin | `120px` at 1440 width |
| Grid | 12 columns |
| Gutter | `24px` |
| Column width | `78px` |
| Top padding | `24px` |
| Bottom padding | `32px` |
| Major region gap | `16px` or `20px` |

Apply a 12-column stretch grid to the screen frame with fixed 120 px margins and 24 px gutters.

The primary workspace spans all 12 columns:

- context column: columns 1–4, approximately `384px`;
- decision column: columns 5–12, approximately `792px`;
- separator is internal to the workspace and does not create a third card.

### Tablet reference frame

Create one optional reference frame at `1024 × 900` after the critical frames are complete.

- Outer margin: `32px`.
- Grid: 12 columns, `16px` gutter.
- Use a 5/7 split until the content becomes crowded; then use the mobile single-column structure.

### Mobile product frame

| Property | Value |
|---|---:|
| Primary frame | `390 × 844` |
| Stress-test frame | `360 × 800` |
| Horizontal padding | `16px` |
| Grid | 4 columns |
| Gutter | `16px` |
| Vertical section gap | `12px` or `16px` |

Use one content column. Nothing may overflow horizontally. The scenario options stack vertically; they do not become horizontally scrolling chips.

## 5. Auto Layout contract

Every reusable component and every major region uses Auto Layout. Avoid absolute positioning except for optional decorative status marks that do not carry content.

### App frame

```text
Direction: Vertical
Width: Fixed to viewport
Height: Hug contents, minimum viewport height
Padding: 24 / 120 / 32 / 120 desktop
Gap: 16
Fill: color/canvas
Alignment: Center horizontally
```

The inner `Content` frame is fixed at `1200px` desktop and fills available width below 1200 px.

### Header

```text
Desktop: Horizontal, space-between, center aligned
Mobile: Vertical, stretch aligned, gap 12
Width: Fill container
Minimum height: 56
```

Group the right-side privacy note and reset action in their own Auto Layout frame. Do not position `Reset demo` at an arbitrary canvas coordinate.

### Scenario selector

```text
Desktop: Horizontal, 3 children, equal fill widths, gap 0
Mobile: Vertical, 3 children, fill width, gap 0
Container radius: 12
Clip content: On
Stroke: color/line
```

Selected-state strokes must use inside alignment so the component does not resize between variants.

### Workspace

```text
Desktop: Horizontal, fill width, minimum height 430
Mobile: Vertical, fill width
Gap: 0
Fill: color/surface
Stroke: color/line
Radius: radius/workspace
Clip content: On
```

The context and decision regions are sections within one workspace. Do not wrap each metric or factor in a floating card.

### Context metric group

- Desktop: vertical list or compact grid according to the source spec.
- Mobile ≥390 px: three equal columns.
- Mobile 360–389 px: two-column wrap; third metric fills both columns.
- Metric values use fixed-width or tabular figures to prevent changing minutes from shifting labels.

### Decision content

```text
Direction: Vertical
Width: Fill
Height: Fill or Hug according to frame
Padding: 32 desktop, 24 mobile
Gap sequence: 8 / 16 / 24 / 24
```

Keep `Decision`, result label, lead, activity, actions, and reason in document order.

## 6. Variable collections

Create local variables before components. Components must bind fills, strokes, padding, gaps, radii, and sizes to variables where Figma supports the binding.

### Collection: `WorkPulse · Color`

Use one mode: `Light`. Dark mode is not part of P0.

| Variable | Value | Use |
|---|---:|---|
| `color/canvas` | `#F2F0E9` | application background |
| `color/surface` | `#FCFCF8` | workspace and control surfaces |
| `color/ink` | `#142019` | primary text |
| `color/ink-subtle` | `#56615B` | supporting text |
| `color/line` | `#C9D0CB` | borders and dividers |
| `color/line-strong` | `#8D9992` | selected edges and rail outlines |
| `color/move` | `#0B6B4F` | move decision and primary action |
| `color/move-hover` | `#085C44` | primary hover |
| `color/move-pressed` | `#064D39` | primary pressed |
| `color/move-disabled` | `#9CB7AB` | disabled move action |
| `color/move-soft` | `#DCEDE6` | move support surface |
| `color/hold` | `#26394C` | protective not-now decision |
| `color/hold-soft` | `#E1E8EE` | hold support surface |
| `color/low-soft` | `#E8E7DF` | low-need surface |
| `color/attention` | `#8A4B08` | high interruption detail on light background |
| `color/danger` | `#9D3430` | destructive text action only |
| `color/focus` | `#005FCC` | keyboard focus outline |
| `color/white` | `#FFFFFF` | text on decision fields |
| `color/hover-neutral` | `#F0F2EE` | secondary hover |
| `color/pressed-neutral` | `#E6EAE6` | secondary pressed |

### Collection: `WorkPulse · Space`

| Variable | Value |
|---|---:|
| `space/1` | `4` |
| `space/2` | `8` |
| `space/3` | `12` |
| `space/4` | `16` |
| `space/6` | `24` |
| `space/8` | `32` |
| `space/12` | `48` |
| `space/16` | `64` |

### Collection: `WorkPulse · Radius`

| Variable | Value |
|---|---:|
| `radius/status` | `4` |
| `radius/control` | `10` |
| `radius/selector` | `12` |
| `radius/workspace-mobile` | `16` |
| `radius/workspace` | `20` |

### Collection: `WorkPulse · Size`

| Variable | Value |
|---|---:|
| `size/control-min-height` | `48` |
| `size/touch-target` | `44` |
| `size/focus-stroke` | `3` |
| `size/factor-segment-width` | `20` |
| `size/factor-segment-height` | `6` |
| `size/content-max` | `1200` |

### Collection: `WorkPulse · Motion`

Figma prototype animations cannot represent every CSS detail; record these as number variables or documentation annotations.

| Variable | Value |
|---|---:|
| `motion/fast` | `120ms` |
| `motion/state` | `180ms` |
| `motion/max` | `220ms` |
| `motion/shift` | `8px` |

No spring bounce, infinite pulse, confetti, delayed AI simulation, or decorative perpetual motion.

## 7. Text styles

Load **Geist** and **Geist Mono**. If the local Figma environment cannot resolve Geist, stop and install/enable the font rather than silently replacing it with Inter.

| Style name | Font | Size / line | Weight | Tracking |
|---|---|---:|---:|---:|
| `Display/Decision/Desktop` | Geist | `56 / 56` | 650 or nearest available | `-2%` |
| `Display/Decision/Mobile` | Geist | `40 / 42` | 650 or nearest available | `-1.5%` |
| `Heading/Decision Lead` | Geist | `24 / 30` | 550 or nearest available | `-1%` |
| `Heading/Section` | Geist | `18 / 24` | 600 | `-0.5%` |
| `Body/Default` | Geist | `16 / 24` | 400 | `0` |
| `Body/Control` | Geist | `15 / 20` | 600 | `0` |
| `Body/Promise` | Geist | `15 / 20` | 450 or 400 | `0` |
| `Label/Eyebrow` | Geist | `12 / 16` | 700 | `12%` |
| `Label/Small` | Geist | `13 / 18` | 450 or 400 | `0` |
| `Label/Metric` | Geist | `13 / 18` | 550 or 500 | `0` |
| `Mono/Metric` | Geist Mono | `32 / 34` | 600 | `-1%` |
| `Mono/Time` | Geist Mono | `14 / 20` | 500 | `0` |
| `Brand/Wordmark` | Geist | `14 / 18` | 700 | `16%` |

Use sentence case except for the wordmark, decision result, factor level, and history outcome.

## 8. Component inventory and variants

### `Core/Button`

Component properties:

```text
Hierarchy = Primary | Secondary | Neutral | Text | Destructive Text
State = Default | Hover | Pressed | Focus | Disabled
Width = Hug | Fill
Label = text property
Leading Icon = boolean
```

Rules:

- Minimum visual height `48px`; minimum interactive target `44px`.
- Primary is `color/move`; it is used only for forward movement actions.
- Inside the hold state, `Check another scenario` uses the Neutral hierarchy.
- Focus variant includes a 3 px blue outline and a 2 px visual gap.
- Pressed state translates content down by no more than 1 px; the component frame does not change size.

### `Demo/Scenario Option`

Properties:

```text
Scenario = Good Window | Meeting Soon | Low Need
State = Default | Hover | Selected | Focus | Disabled
Compact = False | True
Label = text
Supporting Copy = text
```

The selected color family follows scenario meaning:

- Good Window → `move-soft` plus `move` selection edge.
- Meeting Soon → `hold-soft` plus `hold` selection edge.
- Low Need → `low-soft` plus `ink-subtle` selection edge.

### `Context/Metric`

Properties:

```text
Value = text
Unit = text
Label = text
Meeting Title = text, optional
Layout = Stacked | Compact
```

No icon property is required. Numbers are the evidence.

### `Decision/Factor Rail`

Properties:

```text
Factor = Movement Need | Interruption Cost
Level = Empty | Low | Medium | High
Color Family = Neutral | Move | Hold | Attention
```

An instance contains:

- factor label;
- visible text value (`—`, `LOW`, `MEDIUM`, `HIGH`);
- three rectangular segments.

The segments are decorative reinforcement. Do not convert this into a circular gauge, progress percentage, or animated score.

### `Decision/Panel`

Properties:

```text
State = Idle | Evaluating | Move Now | Not Now Meeting | Not Now Low Need | Not Now Cooldown
Viewport = Desktop | Mobile
Decision = text
Lead = text
Supporting Copy = text
Reason = text
Show Activity Summary = boolean
Show Primary Action = boolean
Show Secondary Action = boolean
```

Visual variants:

- `Move Now`: solid `move` field with white primary content.
- `Not Now Meeting`: solid `hold` field, equal size and emphasis.
- `Not Now Low Need`: `low-soft` field with `ink` text.
- `Not Now Cooldown`: `hold-soft` field with `ink` text.
- `Idle`: `surface` field, no predicted factor levels.
- `Evaluating`: stable layout with status copy; no spinner.

The reason may sit in a light inner region beneath the solid decision header if that improves long-copy contrast, but both parts remain one panel component.

### `Activity/Session`

Properties:

```text
State = Active | Completed | Dismissed
Activity Name = text
Duration = text
Instructions = text
```

The Active state contains `Complete activity` and `Stop for now`. Completed and Dismissed are persistent acknowledgements, not temporary toasts.

### `History/Row`

Properties:

```text
Outcome = Completed | Dismissed | Skipped
Time = text
Activity = text
Context = text
Viewport = Desktop | Mobile
```

Outcome always uses text plus a small shape or icon. Dismissed is neutral, not red.

### `Shell/Product Header`

Properties:

```text
Viewport = Desktop | Mobile
Show Privacy Copy = boolean
```

Fixed copy:

- `WORKPULSE`
- `Move more. Interrupt less.`
- `Demo data stays in this browser.`
- `Reset demo`

## 9. Screen assembly

### Shared desktop anatomy

All desktop states use this layer order:

```text
App Frame
  Header
  Scenario Selector
  Workspace
    Context Column
      Work Context
      Decision Balance
    Decision Column
      Decision Panel or Activity Session
  History Section
  Status Message
```

The `Status Message` sits in document flow below the header or workspace; do not position it as a floating toast over critical content.

### `D-01 · Good Window · Idle`

- Good Window scenario selected.
- Context: `14:03`, `57 min`, `12 min`, `78 min`, `Design Review`.
- Factor rails use Empty level.
- Decision lead: `Should WorkPulse interrupt right now?`
- Primary action: `Evaluate this moment`.
- History: empty.

### `D-02 · Good Window · Move Now`

- Factors: Movement Need High; Interruption Cost Low.
- Result: `MOVE NOW`.
- Lead: `You have a good window.`
- Activity: `10 squats · about 1 minute`.
- Actions: `Start activity`, `Not now`.
- Reason matches `DESIGN_SPEC.md` exactly.

### `D-03 · Good Window · Activity Active`

- Same context remains visible.
- Decision column contains Active Activity Session.
- Heading: `10 squats`.
- Instruction: `Complete ten controlled squats at a comfortable pace.`
- Actions: `Complete activity`, `Stop for now`.

### `D-04 · Good Window · Completed`

- Persistent completion acknowledgement.
- Heading: `Movement recorded`.
- History includes one completed row at `14:04`.
- Action: `Evaluate another moment`.

### `D-05 · Meeting Soon · Idle`

- Meeting Soon selected.
- Context: `14:18`, `72 min`, `2 min`, `90 min`, `Design Review`.
- Factor rails Empty until evaluation.
- Decision is Idle.
- Existing completed history row remains visible.

### `D-06 · Meeting Soon · Not Now`

- Factors: Movement Need High; Interruption Cost High.
- Result: `NOT NOW`.
- Lead: `Protect the next commitment.`
- Supporting copy: `Design Review starts in 2 minutes.`
- Action: `Check another scenario`.
- No Start or dismissal action.

### Remaining desktop states

- `D-07`: low-need scenario with `NOT NOW`, neutral family.
- `D-08`: recent-dismissal cooldown with respectful copy.
- `D-09`: populated history with completed and dismissed examples and `Clear history`.

### Mobile states

Rebuild the critical states with mobile component variants; do not scale down desktop frames.

- Stack the header into two rows.
- Stack scenario options vertically.
- Place context before decision balance, then decision.
- Stack actions at full width.
- Use `Display/Decision/Mobile`.
- Show at most three history rows before a `Show all` action.

The 360 px stress test must demonstrate that the third context metric wraps cleanly and no decision copy or action clips.

## 10. Prototype connections

Create one named flow: `WorkPulse · Pitch Demo`.

| From | Trigger | To | Transition |
|---|---|---|---|
| `D-01` | `Evaluate this moment` | `D-02` | Smart Animate, 180 ms, ease out |
| `D-02` | `Start activity` | `D-03` | Smart Animate, 180 ms, ease out |
| `D-02` | `Not now` | cooldown/dismissed acknowledgement | Dissolve, 120 ms |
| `D-03` | `Complete activity` | `D-04` | Smart Animate, 180 ms, ease out |
| `D-04` | Meeting Soon scenario | `D-05` | Instant or 120 ms dissolve |
| `D-05` | `Evaluate this moment` | `D-06` | Smart Animate, 180 ms, ease out |
| `D-06` | Good Window scenario | `D-01` | Instant or 120 ms dissolve |

Do not prototype an artificial delay. If an Evaluating frame is shown, use an after-delay of no more than 220 ms before the final state.

Use matching layer names across states so Smart Animate only moves or fades intended elements. Respect the product's restrained motion direction; do not use bounce, push, slide-in panels, or confetti.

## 11. Pitch board

Create a 1920 × 1080 board with two equal visual columns:

### Left: `MOVE NOW`

- 57 minutes sitting.
- Meeting in 12 minutes.
- High movement need.
- Low interruption cost.
- Green decision treatment.

### Right: `NOT NOW`

- 72 minutes sitting.
- Meeting in 2 minutes.
- High movement need.
- High interruption cost.
- Deep-slate decision treatment.

Footer line:

> That’s the difference between a reminder and an agent.

The board is a pitch artifact, not a product screen. It may use larger labels, but it must reuse product components and variables rather than restyling the interface.

Also create two export-ready frames:

```text
Export · Submission · Move Now · 1440×900
Export · Contrast · Not Now · 1440×900
```

## 12. Accessibility annotations

Add a clearly labelled annotation section on `01 · Foundations`:

- Reading order follows visual order.
- Scenario control is a radio group or complete tab pattern, not generic clickable frames.
- All actions map to native buttons in implementation.
- Focus state is visible and not clipped.
- Live result announcement: `Decision: Move now. Movement need high. Interruption cost low.`
- Decision meaning never relies on color alone.
- Minimum pointer target: 44 × 44 px.
- Body/control text contrast target: 4.5:1.
- Large text, focus, and component boundary target: 3:1.
- Mobile reflow must work at 320 CSS px effective width and 200% zoom.
- Reduced-motion implementation removes spatial movement and keeps only immediate or brief opacity changes.

Figma annotations should describe accessibility intent; do not draw fake accessibility widgets in the product UI.

## 13. Content lock

The following copy is locked and should be created as text/component properties, not converted to outlines:

```text
WORKPULSE
Move more. Interrupt less.
Demo data stays in this browser.
Reset demo
Demo scenario
Good time to move
Meeting starts soon
Low movement need
Work context
Movement need
Interruption cost
Evaluate this moment
MOVE NOW
You have a good window.
10 squats · about 1 minute
Start activity
Not now
Why this decision
You’ve been sitting for 57 minutes and have a 12-minute window before your next meeting.
NOT NOW
Protect the next commitment.
Design Review starts in 2 minutes.
You need movement, but your next meeting starts in 2 minutes. I’ll check again afterwards.
Complete activity
Stop for now
Movement recorded
10 squats completed. Nice work—back to your day.
Today
Stored only in this browser
No interventions yet.
Completed or dismissed activities will appear here.
```

Do not add marketing superlatives, AI clichés, medical promises, streak language, or guilt copy.

## 14. Figma quality checklist

- All product screens are instances of shared shell and section components where practical.
- Repeated UI is componentized; no manually duplicated buttons, scenario options, rails, or history rows.
- Components bind to local variables; hex values are not repeated across nodes.
- Every major container uses Auto Layout.
- Desktop and mobile use responsive variants, not scaled duplicates.
- Layer and frame names follow this document.
- `MOVE NOW` and meeting-gate `NOT NOW` have equal size and visual finish.
- The Not Now state is not red and does not resemble an error.
- No raw decision score appears.
- No horizontal mobile scrolling.
- No gradients, glass, glow, chat UI, stock photography, avatars, or wellness clichés.
- Prototype completes the six-step pitch path without dead ends.
- Export frames match 1440 × 900 and contain no selection annotations.
