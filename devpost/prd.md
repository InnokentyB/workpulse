---
doc: prd
status: approved
---

# WorkPulse Timing Lab — Product Requirements

**One line:** A WorkPulse extension that shows how context and feedback change the timing of a movement suggestion. Sources: `scope.md > The Unique Kernel`, `Who It's For`, `The Core Loop`.

This PRD records the approved direction. Details marked **Assumption** were filled in for the demo and can be revised as the implementation is reviewed.

## The Core Journey

1. Open the single-page lab. See a fictional workday, a current time, upcoming meeting and focus blocks, and a decision card that says either **WAIT** or **MOVE NOW**, with a plain-language reason.
2. Start at a time when a meeting blocks a break. Advance to the next meaningful moment using a visible control. The card switches to **MOVE NOW** when a free window opens.
3. Choose **Accept**, **Snooze**, or **Dismiss** on that suggestion. The lab advances to the next decision and explains how that choice changed the timing.
4. Reset to the same starting workday and choose another response. Compare the explanations and next suggested times. The change in timing is the proof of the core idea. Sources: `scope.md > The Core Loop`, `What "Working" Looks Like`.

## Screens and Layout

**Assumption:** One focused responsive surface within the imported WorkPulse application, with a compact workday timeline beside or above a decision panel. The timeline highlights the current moment, meeting/focus blocks and next suggested time. The panel shows decision, reason, available action and the last response. A short fixed explainer says this is a simulation, not a live calendar. Source: `scope.md > The POC Boundary`.

## Look and Feel

Use a calm, direct and non-judgmental tone. **Assumption:** warm neutral background, restrained accent for an available break, clear typography, and a legible timeline; avoid urgent alerts, guilt language and wellness scores. The exact palette and typography remain open for implementation review. Source: `scope.md > Inspiration & Identity`.

## Features and Behavior

### Simulated Workday and Decision

- Show a fixed fictional workday with at least one blocked moment and one available break window. The current time and highlighted block agree with the decision card.
- At the blocked moment, show **WAIT** and the specific reason: a meeting is in progress or too near for a short break. At the open window, show **MOVE NOW** and why that window fits.
- Advance only between meaningful preset moments. Do not imply live time or actual calendar access.
- **Acceptance:** A reviewer can advance from a meeting conflict to a free window and see the decision and explanation change without editing data. Sources: `scope.md > The Unique Kernel`, `What "Working" Looks Like`.

### Response and Next Recommendation

- **Accept** records that the suggestion was taken; the next suggestion waits until a later suitable window. **Snooze** defers this suggestion to the next suitable window after a short delay. **Dismiss** skips the present opportunity and avoids immediately repeating it. These are **assumed policies** for the POC, not claims of learned personalization.
- After a response, show the selected response, the next recommended time (or **No suitable window remains today**) and a sentence connecting the change to both the response and the workday context. If the next candidate overlaps a blocked period, move to the next open window and explain why.
- **Acceptance:** Starting from the same suggestion, all three responses produce visibly distinct next-decision explanations; at least two result in distinct timing or outcome. A blocked window is never presented as **MOVE NOW**. Sources: `scope.md > The Core Loop`, `The Unique Kernel`.

### Replay

- A **Reset workday** control returns the simulation to its initial time and clears the prior response. The reviewer can try another branch in the same session.
- **Acceptance:** Reset restores the initial **WAIT** decision and enables another complete branch without refreshing the browser. Source: `scope.md > What "Working" Looks Like`.

## States and Boundaries

- **First use:** The fixed scenario is ready immediately; the first card explains why the current moment is blocked and points to the advance control.
- **Before a suggestion:** Response controls are absent or disabled. Advancing exposes the first available suggestion.
- **After a response:** The result and explanation remain visible until reset; there is no repeated response to the same suggestion.
- **No remaining window:** Show that the day has no suitable break window left; offer reset and do not fabricate a time.
- **Session boundary:** **Assumption:** Reset and reload start from the beginning; no user history or cross-day learning is implied.

## Product Decisions

- **Learner direction:** Import the existing WorkPulse files into a separate repository and develop the timing feedback behavior there. Identify the imported baseline and the new work accurately.
- **Learner direction:** Use the official Learn Skill Pack artifacts while retaining control over the implementation approach.
- **Assumption:** A fixed day and three response branches make the timing decision easy to inspect in a short demo.
- **Assumption:** Use explicit rules and reasons in this POC; do not label the behavior as machine learning or autonomous adaptation.

## What We're Building

A working one-page simulation with a fixed schedule, WAIT/MOVE NOW decision and reason, advancement to a viable suggestion, Accept/Snooze/Dismiss branches, a context-aware next recommendation, end-of-day handling and reset. The visible journey must fit a short demonstration. Source: `scope.md > The POC Boundary`.

## Deferred From the POC

- Real calendar data and accounts: they add setup and permissions without proving the feedback loop.
- Persistent personal preference learning: one simulated day cannot validate long-term adaptation.
- Multiple activities and exercise verification: timing is the experiment here.

## Possible Later Enhancements

Connect a real calendar with consent; test opt-in preferences across days; offer several movement activities; optionally verify a movement session on device. Source: `scope.md > Later`.

## Non-Goals

- No clinical, productivity, or employer-outcome claims.
- No camera, financial penalties, or real notifications.
- No hidden AI claim: the demo should accurately describe its deterministic simulation. Source: `scope.md > Explicitly Cut`.

## Implementation Choices

The optional `/play` route is a separate approved extension: choose Trail or Workshop, start a six-cycle movement session, see each completed cycle advance the scene, pause/resume and replay. Camera counting does not validate exercise form; manual demo input is self-reported. See `character-game-tdpd.md` and `character-game-test-scenarios.md` for the full contract.

- The one-page lab uses Accept, Snooze and Dismiss. The sample day runs 09:00–17:00, starts exploration at 09:10, and requires a five-minute open interval. Accept waits at least 90 minutes, Snooze at least 20 minutes, and Dismiss skips the current open interval. These are simulation parameters, not health guidance.
- The imported visual language supplies the copy, colors and type scale. The lab remains separate from camera and live calendar features.
