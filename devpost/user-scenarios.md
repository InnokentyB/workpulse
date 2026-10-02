# WorkPulse Timing Lab — user scenarios

**Status:** implementation companion to the approved `scope.md`, `prd.md` and `spec.md`.

## Contract and notation

The actor is a desk worker exploring a fictional workday in a browser. A **block** is a half-open interval `[start, end)` in minutes on that day. A **suitable window** is a contiguous unblocked interval long enough for the demo's five-minute break. The workday runs 09:00–17:00. Time advances through explicit controls, never from the wall clock. A response is available only for an active **MOVE NOW** suggestion. `WAIT` and an end-of-day result are meaningful decisions, not errors.

The demo timing policy is: Accept delays the next candidate by at least 90 minutes; Snooze by at least 20 minutes; Dismiss skips the current opportunity (the current contiguous open window). Search for the earliest suitable later window at or after the threshold. These parameters are illustrative, not health advice. A response may produce **No suitable window remains today**. No cross-day suggestion is made.

The scenario is fixed and visibly marked simulation. Context reasoning from the imported application must not override a schedule block. Every displayed time, highlight, status and explanation describes the same state. No camera, real calendar, notifications, accounts, money or learned behavior enter this flow.

## Scenario catalog

| ID | Scenario and main path | Branches, exceptions and required visible result |
| --- | --- | --- |
| US-01 | Enter lab from the main app; see fictional day and current moment. | Direct route and navigation link lead to the same lab. Initial `WAIT` says why the current moment is blocked; simulation label and advance control are visible. No permission prompt or keys. |
| US-02 | Review an in-progress meeting. | At the meeting start and any instant inside it, `WAIT` names meeting conflict. At its end the block no longer applies. If a break cannot finish before an imminent meeting, `WAIT` names the near meeting rather than showing `MOVE NOW`. |
| US-03 | Review a focus block and its boundaries. | During focus, `WAIT` names the block; at its end a sufficiently long open window may become available. An adjacent/overlapping meeting cannot create a false gap. |
| US-04 | Advance to the next meaningful moment. | From blocked time, advance finds a viable window and changes to `MOVE NOW`, with matching time/highlight/reason. Multiple blocked intervals are skipped. If none exists, show end of day without a stale `MOVE NOW`. |
| US-05 | Inspect an available suggestion. | Explain why the window fits and expose exactly the three responses. The current candidate must leave enough contiguous open time for the break. At an open interval too short for it, show `WAIT`, not a suggestion. |
| US-06 | Accept a suggestion. | Record `Accept` once; find the earliest suitable opportunity at least 90 minutes later. If threshold falls in a block or too short a gap, move past it and explain both acceptance and schedule conflict. If no slot, say so. |
| US-07 | Snooze a suggestion. | Record `Snooze` once; find the earliest suitable opportunity at least 20 minutes later. If delayed threshold is still in the same open interval and enough time remains, it can be used; otherwise skip blocked/short windows. Explain both delay and schedule. |
| US-08 | Dismiss a suggestion. | Record `Dismiss` once; skip the current contiguous open window and search a later suitable window. Never re-offer the same opportunity immediately. Explain the skip and chosen later window or lack thereof. |
| US-09 | Compare branches. | Reset after a result, replay to the same initial suggestion, choose another response. Each response produces a distinct explanation and at least two branches differ by next time or end-of-day outcome. |
| US-10 | Reach the last opportunity. | A response with no suitable later window yields explicit end-of-day state, no invented next time, no further response buttons, and a usable Reset. |
| US-11 | Reset from any lab state. | From initial, waiting, suggestion, result or end of day, restore initial time, `WAIT`, no response, original highlight, and original schedule without page refresh. Repeated Reset is harmless. |
| US-12 | Reload or navigate away and return. | Re-enter at initial state; prior response and simulated position do not survive. Imported WorkPulse history/preferences do not leak into the lab and lab actions do not change them. |
| US-13 | Attempt unavailable action. | Before a suggestion, after a response, and at end of day, response controls are hidden or disabled. Rapid double activation counts once. Advance cannot bypass a pending result or produce duplicate responses. |
| US-14 | Handle a block boundary. | At block start, it is blocked; at block end it is free only if a full break fits before next block/end of workday. At exactly the minimum duration, the slot is valid. Threshold exactly at a block end may be selected; exactly at its start may not. |
| US-15 | Handle dense or imperfect schedule data. | Sort unsorted blocks and treat overlapping/adjacent blocks as one obstruction. Zero/negative-duration blocks, out-of-day intervals and invalid times never create a false `MOVE NOW`; invalid fixture fails safely with an explicit developer-visible validation failure, not a misleading user decision. |
| US-16 | Handle workday limits. | A threshold before start begins search at workday start; a threshold at/after the last viable start returns no slot. Never wrap to next day or display an out-of-range time. |
| US-17 | Understand the decision without color or technical jargon. | Plain-language status, response, next time and reason remain readable on narrow screens, keyboard and screen reader. Focus is visible; buttons have accessible names; state changes are announced or easily found. No shame or clinical claims. |
| US-18 | Use lab with imported app integrations unavailable. | Offline/denied calendar and camera do not affect the deterministic scenario. The lab never requests those permissions or requires network runtime calls. Existing app routes continue to work. |

## Shared invariants

1. A `MOVE NOW` candidate always has a contiguous interval of at least the configured break duration within the workday and outside all blocks.
2. Timing decisions are deterministic for identical schedule, time and response; searching forward never returns an earlier instant.
3. A response is applied once to an active suggestion. The resulting explanation identifies that response and any schedule delay; a missing candidate is represented as end of day.
4. Every visible time and timeline highlight agrees with the decision/result. The lab never suggests that it read a live calendar, verified movement, or learned the person's preferences.
5. Reset and reload erase lab state. This experiment does not mutate imported WorkPulse behavior or local history.

## Implemented decisions

- The sample starts exploration at 09:10 and first suggests movement at 09:30. It includes meetings, focus blocks, short gaps and a final blocked interval.
- Dismiss skips a contiguous open window. A result remains visible until Reset.
- The pure timing layer supplies the final gate and reason. The existing context engine remains in the original demo without changing its semantics.
