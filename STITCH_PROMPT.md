# WorkPulse — Google Stitch Generation Prompt

Generate a visual reference for the **current WorkPulse MVP only**. Do not invent roadmap features.

## Product

WorkPulse is a contextual workplace-wellbeing agent with the tagline **“Move more. Interrupt less.”** It decides whether movement is worth interrupting the user right now.

The core contrast:

1. After 57 sedentary minutes with 12 minutes before a meeting, WorkPulse says `MOVE NOW` and offers a 45-second neck reset.
2. After 72 sedentary minutes with 2 minutes before a meeting, WorkPulse says `NOT NOW` because interruption cost is high.

`NOT NOW` is a successful decision with equal visual authority, not an error or fallback.

## Visual direction

Create a calm **workday signal desk**: warm editorial paper, deep botanical ink, ruled dividers, joined context/decision surfaces, and one scarce lime action signal.

- Operational product, not a marketing landing page or dashboard.
- Editorial premise followed by one joined decision instrument.
- Flat at rest; structure comes from rules and tonal layers.
- Controlled asymmetric desktop layout.
- No floating card grid.

## Required page hierarchy

1. Compact header: pulse mark, `WorkPulse`, centred tagline `Move more. Interrupt less.`
2. Editorial premise:
   - `Your workday has a rhythm. Find the right moment to move.`
   - `WorkPulse weighs movement need against interruption cost, then makes one clear call — without another noisy reminder.`
3. Decision demo:
   - desktop scenario rail on the left;
   - joined context and state surfaces on the right;
   - mobile native-select representation above the joined instrument.
4. Quiet footer disclaimer: `A workplace wellbeing prototype. Activity suggestions are not medical advice.`

## Palette

Use exactly these roles:

- Deep Ink `#16231D` — primary text.
- Soft Ink `#526159` — descriptions.
- Warm Paper `#F4F1E8` — canvas.
- Raised Paper `#FBFAF5` — context panel and selected scenario.
- Ruled Line `#D8D5CA` — dividers.
- Signal Green `#15684A` — live status.
- Signal Lime `#B8F36B` — primary action and active pose trace only.
- Signal Soft `#DFF1CC` — subtle status support.
- Decision Green `#183E2F` — `MOVE NOW` surface.
- Hold Brown `#493125` — `NOT NOW` surface.
- Hold Amber `#F2B56D` — high interruption-cost cue.
- Focus Blue `#205FCA` — keyboard focus.
- Inverse Text `#F8F8F1` — text on dark surfaces.

Do not use purple, neon blue, red for `NOT NOW`, glass, component gradients, or outer glow.

## Typography and shape

- Geist Sans for the interface; tabular numerals for context values.
- Decision result: fluid 64–112 px, semibold, tight tracking.
- Editorial headline: fluid 45–74 px, semibold, tight tracking.
- Body: 16 px / 26 px.
- Labels: 12 px uppercase with controlled tracking.
- Joined instrument outer radius: 14 px.
- Controls: 10 px radius, minimum 48 px height.
- Shared seam between context and state panels is square.
- No default card shadows; primary hover may use one compact shadow.

## Scenarios

Exactly two:

1. `Good time to move` — `High movement need and a safe gap before the next meeting.`
2. `Meeting starts soon` — `Movement is needed, but interruption cost is too high.`

Supporting note:

> Two fixed contexts. No calendar connection or setup required.

Do not add a third low-need scenario.

## Screen 1 — Desktop `MOVE NOW`

Viewport reference: 1440 px wide.

Show:

- Good scenario selected.
- `Right now`, `Work context at 14:03`, `Context ready`.
- `57 min` — `You've been sitting`.
- `in 12 min` — `Next meeting`, `Design Review`.
- `78 min` — `Since last movement`.
- Calendar source visibly identified as demo data.
- State label `WINDOW OPEN`.
- Decision `MOVE NOW`.
- Movement need `HIGH`.
- Interruption cost `LOW`.
- `Smallest useful move`.
- `Neck reset`.
- `About 45 seconds`.
- Reason: `You've been sitting for 57 minutes and have a 12-minute window before your next meeting.`
- Lime primary action: `Start activity`.

Use a deep green decision surface. Do not show squats, history, dismissal, or calories.

## Screen 2 — Desktop `NOT NOW`

Use the same layout, scale, and structural authority.

Show:

- Meeting scenario selected.
- `Right now`, `Work context at 14:18`, `Context ready`.
- `72 min` sitting.
- `in 2 min` to `Design Review`.
- `90 min` since last movement.
- State label `HOLD THIS MOMENT`.
- Decision `NOT NOW`.
- Movement need `HIGH`.
- Interruption cost `HIGH`.
- Reason: `You need movement, but your next meeting starts in 2 minutes. I'll check again afterwards.`
- No activity and no start action.

Use a grounded warm-brown decision surface. Do not use warning red, alert icons, or disabled styling.

## Screen 3 — Camera consent

This state appears only after `Start activity`; the camera is still off.

Show:

- `Camera-guided activity`.
- `Neck reset`.
- Progress `0 / 4`.
- Heading `Follow four gentle neck movements`.
- Privacy copy: `Your image is processed on this device. WorkPulse does not record, save, or upload video. The camera switches off after the movement check.`
- Safety copy: `Use a comfortable range. Stop if you feel pain or dizziness.`
- Primary action `Enable camera`.
- Secondary action `Complete without camera`.
- Quiet action `Stop activity`.

Do not show a live preview yet. Permission is a dedicated action.

## Screen 4 — Camera active

Show:

- Mirrored 4:3 live-preview placeholder with a restrained lime face/shoulder pose trace.
- Visible `Camera active` status.
- Progress example `2 / 4`.
- One instruction: `Return to center, then lower your chin gently.`
- Safety copy and stop action.
- Clear local-processing context.

Do not show recording controls, red dots, confidence percentages, diagnostic angles, or raw data.

## Screen 5 — Camera recovery

Create one denied/error reference:

- Heading `Camera permission is off`.
- Explain that the user may change browser settings and no video was captured.
- Actions `Try again` and `Complete without camera`.
- Preserve the same activity surface and safety copy.

This is a recoverable state, not a full-page failure.

## Screen 6 — Verified completion

Show:

- Label `Movement verified`.
- Heading `Nice work. Neck reset verified.`
- Copy `Four movements confirmed on this device. No video was recorded. Camera is off.`
- Action `Run again`.

No confetti, score, streak, or celebration illustration.

## Mobile behaviour

Generate mobile `NOT NOW` and camera-consent references at 390 × 844.

- 18 px page padding.
- Header shows brand; tagline may hide.
- Premise becomes one column.
- Scenario selector becomes one full-width native-select treatment.
- Context metrics become two columns with the third metric spanning the next row.
- State content and actions stack.
- Camera preview fills width without horizontal scroll.
- Decision label must not clip at 360 px.

## Motion

- Decision reveal: 160–220 ms opacity plus at most 8 px vertical movement.
- Button response: 160 ms, maximum 1 px lift/press.
- Camera progress is restrained and non-celebratory.
- No bounce, confetti, infinite shimmer, simulated AI thinking, or cinematic page choreography.
- Reduced-motion mode is effectively immediate.

## Accessibility

- Strong WCAG AA contrast.
- Text and structure carry state meaning; colour is redundant.
- Blue 3 px focus outline with visible offset.
- Minimum 44 × 44 px targets.
- Logical reading order.
- Camera errors and status have explicit text.
- No horizontal mobile overflow.

## Explicitly forbidden

- Squats or any activity other than neck reset in current MVP screens.
- Third scenario, history, cooldown, meal, medication, posture, workday settings, wearables, or analytics.
- AI chat, assistant avatar, sparkles, or thinking indicator.
- Metric rings, health score, calories, streaks, badges, or gamification.
- Stock wellness photography, yoga imagery, mascots, or medical diagrams.
- Automatic camera start, hidden camera state, microphone request, or recording metaphor.
- Medical claims, posture diagnosis, or guaranteed outcome copy.

## Expected output

Generate eight references:

1. Desktop `MOVE NOW`.
2. Desktop `NOT NOW`.
3. Desktop camera consent.
4. Desktop camera active.
5. Desktop camera recovery.
6. Desktop verified completion.
7. Mobile `NOT NOW` at 390 × 844.
8. Mobile camera consent at 390 × 844.

The `MOVE NOW` and `NOT NOW` screens are the primary pitch pair. The camera screens demonstrate trust and graceful fallback without redefining the product.
