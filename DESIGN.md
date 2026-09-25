---
name: WorkPulse
description: A warm, measured workday signal desk that makes one clear GO or HOLD call.
colors:
  ink: "#16231d"
  ink-soft: "#526159"
  paper: "#f4f1e8"
  paper-raised: "#fbfaf5"
  rule: "#d8d5ca"
  signal: "#15684a"
  signal-bright: "#b8f36b"
  signal-soft: "#dff1cc"
  hold: "#9a4e27"
  hold-bright: "#f2b56d"
  focus: "#205fca"
  desk-dark: "#1d2a24"
  decision-go: "#183e2f"
  decision-hold: "#493125"
  inverse-text: "#f8f8f1"
typography:
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(4rem, 9vw, 7rem)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(2.8rem, 4.4vw, 4.65rem)"
    fontWeight: 610
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(1.55rem, 3vw, 2.5rem)"
    fontWeight: 570
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.76rem"
    fontWeight: 680
    lineHeight: 1.5
    letterSpacing: "0.08em"
rounded:
  control: "10px"
  panel: "14px"
  pulse-bar: "4px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "24px"
  panel: "30px"
  section: "40px"
  page: "48px"
components:
  button-primary:
    backgroundColor: "{colors.signal-bright}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
    height: "48px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.inverse-text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
    height: "48px"
  context-panel:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "26px 30px 28px"
  decision-go:
    backgroundColor: "{colors.decision-go}"
    textColor: "{colors.inverse-text}"
    rounded: "{rounded.panel}"
    padding: "clamp(30px, 5vw, 58px)"
  decision-hold:
    backgroundColor: "{colors.decision-hold}"
    textColor: "{colors.inverse-text}"
    rounded: "{rounded.panel}"
    padding: "clamp(30px, 5vw, 58px)"
---

# Design System: WorkPulse

## Overview

**Creative North Star: "The Workday Signal Desk"**

WorkPulse feels like a calm instrument built into the workday: warm paper surrounds a compact desk of measured context, ruled divisions, and one decisive signal surface. It is purposeful rather than clinical, editorial rather than dashboard-like, and confident enough to recommend either movement or restraint without turning either outcome into a judgment.

The interface progresses from context to question to reason to action. Its strongest visual contrast is reserved for the decision stage: ink-green means a useful movement window, warm brown means hold, and electric lime marks the next constructive action. Dense status typography and tabular numerals make the product feel precise, while generous breathing room and plain language keep that precision humane.

**Key Characteristics:**

- Warm paper canvas with restrained radial lime atmosphere.
- Ruled dividers and compact status labels organize information without dashboard chrome.
- Large, explicit decision typography makes GO or HOLD readable without relying on color.
- Ink-green and warm-brown state surfaces share one structure, so neither outcome feels secondary.
- Lime is a scarce action and live-signal cue, not a decorative brand wash.

## Colors

The palette pairs quiet paper neutrals with grounded ink-green surfaces, a warm-brown hold state, and a rare high-energy lime cue.

### Primary

- **Ink Green:** The core affirmative signal, used for live status, completed outcomes, pulse marks, and smaller GO indicators.
- **Signal Lime:** The highest-attention action color, used for primary actions, active pulse marks, and low-cost GO signals.
- **Decision Green:** The immersive GO surface used only when WorkPulse has resolved the context into a movement recommendation.

### Secondary

- **Hold Brown:** The grounded HOLD identity used for restraint cues and the `NOT NOW` decision.
- **Decision Brown:** The immersive NOT NOW surface; it carries equal visual authority to the GO state without borrowing alarm-red semantics.
- **Hold Amber:** A warm high-interruption cue used inside the HOLD surface.

### Neutral

- **Warm Paper:** The page canvas and scrollbar track.
- **Raised Paper:** Context panels, selected scenarios, and mobile scenario fields.
- **Deep Ink:** Default text, icon, and action-label color.
- **Soft Ink:** Supporting copy, metadata, units, and secondary descriptions.
- **Ruled Line:** Structural borders and dividers across the paper layer.
- **Desk Dark:** The pre-decision, evaluating, and terminal-action surface.
- **Inverse Text:** Primary text on dark decision surfaces.
- **Focus Blue:** A deliberately distinct keyboard-focus outline that remains visible across warm paper, green, brown, and lime.

### Named Rules

**The Scarce Lime Rule.** Reserve bright lime for the next useful action, a live signal, or a resolved low-cost cue; never flood the paper canvas with it.

**The Equal Outcomes Rule.** GO and HOLD use the same structural hierarchy and typographic force. Color changes the state character, not its importance.

## Typography

**Display Font:** Geist (with Arial and sans-serif fallbacks)

**Body Font:** Geist (with Arial and sans-serif fallbacks)
**Label/Mono Font:** Geist for labels; Geist Mono is available at the root but is not part of the shipped component vocabulary.

**Character:** A single neo-grotesk family keeps the desk calm and contemporary. Weight, scale, tight display tracking, uppercase state text, and tabular numerals create hierarchy without introducing ornamental type.

### Hierarchy

- **Display** (600, fluid 4rem–7rem, 0.9 line-height): The explicit MOVE NOW or NOT NOW decision; uppercase and visually dominant.
- **Headline** (610, fluid 2.8rem–4.65rem, 0.98 line-height): The product premise at the top of the experience; balanced and capped near 18 characters per line.
- **Title** (570, fluid 1.55rem–2.5rem, 1.12 line-height): Decision questions and state transitions inside the dark signal desk.
- **Body** (400, 1rem, 1.65 line-height): Premise and explanatory copy; reasons are slightly larger with a compact 68-character measure.
- **Label** (680, 0.76rem, 0.08em tracking): Scenario legends, decision labels, and signal metadata; uppercase only for compact system status.

### Named Rules

**The Decision Speaks Largest Rule.** The resolved state is always the strongest type on the screen; supporting levels and reasons remain legible but never compete with it.

**The Measured Numeral Rule.** Context values, history counts, times, durations, and movement totals use tabular numerals so changing data does not disturb the visual rhythm.

## Layout

The page sits in a centered 1440px shell with 48px desktop gutters. A compact header anchors the brand on the left while the tagline stays quiet in the center. The premise uses a wide-to-narrow editorial split, then the demo shifts to a 285px scenario rail beside one flexible decision stage with a 40px gutter.

The context and decision areas read as one instrument: the raised paper context panel has only its top corners rounded, while the dark action or decision surface rounds only its bottom corners. Three context metrics divide the panel with one-pixel rules. The browser-local history section follows the demo in the same 285px/flexible-content grid; its title and privacy explanation occupy the left rail, while summary counts and completed-activity rows occupy the content column. The roadmap uses the same rail for a proposed P0.5 feature register, with the next phase and exploration separated by tonal surfaces and ruled rows.

At 920px, the two-scenario rail becomes a two-column horizontal strip; history and roadmap rails stack above their content. At 640px, page gutters tighten to 18px, the scenario choices collapse into a single 50px select, the metrics become a two-column grid with the third metric spanning the next row, and actions stack to full width. The header places its links beneath the brand, history rows become a date/time column beside an activity column with details underneath, and roadmap phase cells stack vertically. The same context-to-decision reading order is preserved from a 360px viewport upward.

## Elevation & Depth

The system is flat by default. Depth comes from tonal layering, ruled edges, and joined paper/dark surfaces rather than card shadows. Shadows appear only as a response: the lime primary action gains a compact dark lift on hover, and the live-status dot uses a soft signal halo. The page background adds an extremely restrained radial lime atmosphere near the upper-left, but it never reads as a floating glow panel.

### Shadow Vocabulary

- **Primary action hover** (`0 8px 22px rgba(3, 20, 12, .28)`): Confirms that a decision action is interactive while it lifts by one pixel.
- **Evaluate action hover** (`0 8px 20px rgba(0, 0, 0, .17)`): A slightly lighter hover lift on the pre-decision desk.
- **Live signal halo** (`0 0 0 4px var(--signal-soft)`): Marks context readiness without implying elevation.

### Named Rules

**The Flat Desk Rule.** Surfaces stay flat at rest; use rules and tonal contrast for structure, and reserve shadow for interaction feedback.

## Shapes

The form language is measured and lightly softened. Joined context and decision panels use 14px outer corners but meet at a square seam, controls use 10px corners, and small state markers use true circles or pills. One-pixel dividers do most of the structural work. Animated pulse bars use a compact 4px radius so they feel machined rather than bubbly.

**The Joined Instrument Rule.** Context and decision surfaces must read as one stacked device: round the exposed outer corners, not the shared seam.

## Components

### Buttons

- **Shape:** Compact, sturdy controls with gently rounded 10px corners and a 48px minimum height.
- **Primary:** Signal lime on deep ink, 12px × 18px internal padding, semibold text, and an optional inline arrow or check icon.
- **Hover / Focus:** Lift by one pixel and add a compact shadow on hover; all keyboard focus uses the global 3px blue outline with a 3px offset. Motion resolves in 160ms ease-out.
- **Quiet:** Transparent with a one-pixel current-color border on dark surfaces; hover adds a restrained translucent white fill.

### Chips

- **Style:** The local-data chip is a tiny outlined pill with ink-green text, a muted green-gray border, uppercase text, and close 4px × 7px padding.
- **State:** Informational only; do not style it like a primary action.

### Cards / Containers

- **Corner Style:** 14px outer panel radius, with square shared edges when paper and decision surfaces join.
- **Background:** Raised paper for context; desk dark for unresolved and terminal states; dedicated green or brown surfaces for resolved decisions.
- **Shadow Strategy:** Flat at rest; see the Flat Desk Rule.
- **Border:** One-pixel ruled neutral on paper; 19–20% white rules within dark surfaces.
- **Internal Padding:** 26–30px for context, fluid 30–58px for decisions, and 34–68px for the active session.

### Inputs / Fields

- **Style:** Desktop scenarios are native radio inputs inside ruled full-row labels. Selected rows use raised paper; hover adds a translucent white wash. Mobile replaces the rows with a native select on raised paper, a 10px radius, and an embedded ink chevron.
- **Focus:** The global blue focus outline remains visible without changing layout.
- **Responsive behavior:** Keep full scenario descriptions on tablet and desktop; use only scenario names in the mobile select to keep context and action close.

### Navigation

The compact header uses an inline pulse mark and bold product name on the left, a quiet tagline centered on desktop, and right-aligned pill links for Live demo, History, and What’s next. The current page receives an ink fill and inverse text; hover stays soft, and keyboard focus uses the shared blue outline. History links to the demo’s section anchor. Below 640px, the tagline disappears and the links sit visibly beneath the brand without a menu.

### Decision Surface

The signature component begins with a small state label, follows with oversized explicit state typography, then a ruled two-column comparison of movement need and interruption cost. GO adds the smallest useful activity and one primary action; HOLD omits activity controls but preserves the reason and structural authority. On mobile, signals and actions stack without changing their order.

### Camera Activity Surface

The activity state keeps the green decision surface and replaces the static instructions with an explicit camera-consent step. Once permission is granted, a mirrored native video preview and lime upper-body pose trace make local detection visible. A large `0 / 4` movement indicator, one instruction at a time, persistent “no video recording” copy, and an always-available stop action keep the session legible and trustworthy. Permission denial and unavailable-camera states stay within the same surface and offer recovery plus a manual fallback.

### Work Context Metrics

Three metrics use large tight values, small muted units, and tabular numerals. Thin vertical rules separate them on desktop. On mobile, the first two remain side by side and the third spans a ruled second row, preserving all context in the first interaction viewport.

### Activity History

The browser-local ledger continues the paper-and-rule language beneath the demo. Its left rail names the section and explains that completed records stay on this device when browser storage is available. Three restrained, tabular summary numerals show completed, today, and camera-verified counts. The empty state leaves a clear ruled area and a plain invitation to finish an activity. Completed entries appear newest first as ruled rows with date and time, activity name, explicit camera or manual completion language, estimated duration, and movement count. On mobile, each row keeps time beside the activity and moves the two facts below the activity text.

### Roadmap Register

The roadmap is a reading surface: a large editorial opening, a ruled three-phase rail, then a feature register aligned to the 285px/content grid. The proposed P0.5 phase has the only dark rail cell, while the first feature row names the real calendar connection and its explicit permission requirement. A visible “proposed direction” note keeps the page from implying a release promise. Later and exploratory material recedes into a dark follow-on panel and quiet outlined pills.

## Do's and Don'ts

### Do:

- **Do** keep the decision as the largest and highest-contrast message after evaluation.
- **Do** use one-pixel ruled dividers, tonal layers, and joined panels to structure the desk.
- **Do** preserve text labels for MOVE NOW and NOT NOW so state never depends on green or brown alone.
- **Do** keep scenario controls visible but secondary, collapsing them to a select on narrow screens.
- **Do** respect reduced-motion preference for the activity pulse animation.
- **Do** keep history verification language explicit and its device-local explanation adjacent to the ledger.
- **Do** distinguish current, proposed, tentative, and exploratory roadmap content in text as well as styling.

### Don't:

- **Don't** turn WorkPulse into a generic reminder dashboard with equal-weight cards, charts, or persistent notification chrome.
- **Don't** use signal lime as a large decorative field or on multiple competing actions.
- **Don't** make HOLD look like an error, warning, or failed outcome; it is a successful decision with equal authority.
- **Don't** introduce soft floating cards or ambient shadows at rest; the system is ruled and flat.
- **Don't** add ornamental typefaces, gradients on components, or color-only state communication.
