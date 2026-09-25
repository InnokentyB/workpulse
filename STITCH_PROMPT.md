# WorkPulse — Google Stitch Generation Prompt

Use this document as the generation brief for Google Stitch. It is intentionally narrower than `DESIGN_SPEC.md`. Stitch should create a visual reference for the P0 web demo; it must not invent product scope or decision logic.

## Primary prompt

Design a responsive single-page web application called **WorkPulse** with the tagline **“Move more. Interrupt less.”** It is a contextual workplace-wellbeing agent that decides whether interrupting a desk worker for movement is useful right now.

This is an operational product screen, not a marketing landing page, fitness tracker, medical dashboard, or AI chat interface. The central proof is a contrast between two states:

1. **MOVE NOW:** the user has been sitting for 57 minutes, the next meeting starts in 12 minutes, movement need is HIGH, interruption cost is LOW, and the suggested activity is 10 squats in about one minute.
2. **NOT NOW:** the user has been sitting for 72 minutes, the next meeting starts in 2 minutes, movement need is HIGH, interruption cost is HIGH, and the system protects the upcoming commitment instead of interrupting.

Build a calm decision instrument with editorial restraint and professional productivity-tool precision. Use one large bounded workspace with internal dividers rather than a grid of floating cards. The decision is the focal point. The demo-scenario control is always visible but visually secondary.

## Required page anatomy

Top to bottom:

1. Compact product header with `WORKPULSE`, `Move more. Interrupt less.`, `Demo data stays in this browser.`, and a `Reset demo` text action.
2. A connected three-option `Demo scenario` selector: `Good time to move`, `Meeting starts soon`, and `Low movement need`.
3. One large decision workspace. On desktop it uses a 4/8 split: work context on the left and the decision on the right. On mobile it becomes one column.
4. The context region shows three plain numeric facts: sitting time, time to the next named meeting, and time since last movement.
5. Two factor rails: `Movement need` and `Interruption cost`. Each has a text level plus three small rectangular segments. Do not use percentages, circular gauges, rings, or charts.
6. A large decision region with the result, lead sentence, activity where appropriate, actions, and a plain-language reason.
7. A compact `Today` history section stored only in the browser.

## Visual theme and atmosphere

Create a warm, restrained, instrument-like interface: calm enough for a workday, precise enough to trust during a live demo.

- Density: balanced operational app, approximately 6/10.
- Variance: controlled asymmetry through the 4/8 workspace split, approximately 5/10.
- Motion: restrained and immediate, approximately 3/10.
- No decorative hero, photography, people, illustrations, mascots, or lifestyle imagery.
- No centered landing-page composition.
- No overlapping content.

## Color palette

Use exactly this palette and preserve semantic roles:

- **Warm Canvas** `#F2F0E9` — page background.
- **Paper Surface** `#FCFCF8` — workspace and controls.
- **Botanical Ink** `#142019` — primary text.
- **Muted Ink** `#56615B` — supporting text.
- **Structural Line** `#C9D0CB` — borders and dividers.
- **Move Green** `#0B6B4F` — MOVE NOW decision and primary action.
- **Move Mist** `#DCEDE6` — supportive move background.
- **Protective Slate** `#26394C` — NOT NOW meeting-protection state.
- **Protective Mist** `#E1E8EE` — supportive hold background.
- **Low-Need Neutral** `#E8E7DF` — low movement-need state.
- **Focus Blue** `#005FCC` — keyboard focus only.
- **White** `#FFFFFF` — text on solid decision fields.

Do not use gradients, purple, neon blue, outer glow, pure black, or red for `NOT NOW`. The protective slate state must feel equally confident and valuable as the green state.

## Typography

- Use **Geist Sans** for interface text and **Geist Mono** for times and changing numeric context.
- Decision label: 56 px desktop and 40 px mobile, semibold, tightly tracked, never larger than 64 px.
- Decision lead: 24 px with a 30 px line height.
- Body: 16 px with a 24 px line height.
- Wordmark: 14 px uppercase with generous tracking.
- Eyebrows: 12 px uppercase with controlled tracking.
- Use tabular figures for minute values.
- Do not use Inter or serif typefaces.

## Shape and spacing

- Content maximum: 1200 px.
- Desktop viewport: 1440 × 900 with the complete header, selector, context, and decision visible without scrolling.
- Mobile reference: 390 × 844; minimum supported width 360 px.
- Base spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Main workspace radius: 20 px desktop, 16 px mobile.
- Controls: 10–12 px radius; do not turn all labels into pills.
- Buttons: minimum 48 px high and 44 px touch target.
- Use crisp 1 px dividers. Avoid shadow by default; at most one very soft canvas-separation shadow on the main workspace.

## Required state 1 — MOVE NOW

Show:

- Selected scenario: `Good time to move`.
- Current time: `14:03`.
- `57 min` / `Sitting`.
- `12 min` / `To Design Review`.
- `78 min` / `Since last movement`.
- `Movement need` → `HIGH` with three filled segments.
- `Interruption cost` → `LOW` with one filled segment.
- Decision: `MOVE NOW`.
- Lead: `You have a good window.`
- Activity: `10 squats · about 1 minute`.
- Primary action: `Start activity`.
- Secondary action: `Not now`.
- Reason heading: `Why this decision`.
- Reason: `You’ve been sitting for 57 minutes and have a 12-minute window before your next meeting.`

Use a solid Move Green decision field with white text. Do not add exclamation marks, celebration effects, calories, streaks, or fitness statistics.

## Required state 2 — NOT NOW

Create a second complete screen with the same structure and visual weight:

- Selected scenario: `Meeting starts soon`.
- Current time: `14:18`.
- `72 min` / `Sitting`.
- `2 min` / `To Design Review`.
- `90 min` / `Since last movement`.
- `Movement need` → `HIGH` with three filled segments.
- `Interruption cost` → `HIGH` with three filled segments.
- Decision: `NOT NOW`.
- Lead: `Protect the next commitment.`
- Supporting copy: `Design Review starts in 2 minutes.`
- Action: `Check another scenario`.
- Reason: `You need movement, but your next meeting starts in 2 minutes. I’ll check again afterwards.`

Use a solid Protective Slate decision field with white text. Do not show `Start activity`. Do not use warning red, alert icons, errors, guilt, or a disabled-looking layout.

## History treatment

Use a compact section, not an analytics table. Example row:

```text
14:04   10 squats                          COMPLETED
        Good time to move · 57 min sitting
```

The outcome uses text plus a simple check shape. Empty-state copy is `No interventions yet. Completed or dismissed activities will appear here.`

## Responsive behavior

- Below 768 px, collapse to one column.
- Stack the header into two rows.
- Stack all three scenario options vertically; no horizontal scroll.
- Present context before factor rails, then decision.
- Stack actions full width with the primary action first.
- At 390 px, context may use three columns; at 360 px, use two columns with the third metric spanning both.
- Ensure no clipped text, overlapping elements, or two-dimensional scrolling.

## Interaction and motion

- Scenario hover/selection: 120 ms.
- State change: 180–220 ms opacity plus at most 8 px vertical movement.
- Button press: subtle 1 px tactile shift.
- No bounce, spring, shimmer, perpetual pulse, staggered page choreography, confetti, or simulated AI thinking delay.
- Reduced-motion mode should be effectively instant.

## Accessibility

- Decision meaning is expressed through text and layout, not color alone.
- Maintain strong WCAG AA contrast.
- Provide highly visible blue keyboard focus outlines.
- Maintain 44 × 44 px minimum pointer targets.
- Keep logical reading order and plain, non-judgmental language.

## Explicitly forbidden

- AI chat layout, assistant avatar, sparkles, or “thinking” copy.
- Generic wellness photography, illustrations, emojis, plants, yoga poses, or medical imagery.
- Glassmorphism, gradients, glow, neon, excessive shadows, or decorative charts.
- Three equal feature cards, metric rings, calories, streaks, gamification, or health scoring.
- Marketing copy such as “revolutionary,” “seamless,” “next-generation,” or “unlock your potential.”
- Any product feature not listed in this prompt.

## Expected Stitch output

Generate four screens:

1. Desktop `MOVE NOW`, 1440 × 900.
2. Desktop meeting-gate `NOT NOW`, 1440 × 900.
3. Mobile `MOVE NOW`, 390 × 844.
4. Mobile meeting-gate `NOT NOW`, 390 × 844.

The desktop `MOVE NOW` screen is the primary submission visual. The `NOT NOW` screen must look equally intentional and polished.
