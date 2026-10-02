# WorkPulse Timing Lab — acceptance and test scenarios

**Status:** implementation test catalog. Traceability target: `user-scenarios.md` (US IDs), `prd.md` and `spec.md`. The fixed example below is the implemented demo fixture.

## Reference fixture and expected calculation

Use a fictional 09:00–17:00 workday with a 5-minute break requirement and half-open blocks: meeting 09:00–09:30, focus 10:00–10:30, meeting 10:45–11:00, focus 11:20–11:40, meeting 12:30–13:00, focus 14:00–15:00, meeting 16:45–17:00. Start 09:10. Advance to the first viable suggestion at 09:30. With the provisional response rules:

| Response at 09:30 | Threshold / rule | Expected earliest next suitable time | Explanation must mention |
| --- | --- | --- | --- |
| Accept | 11:00 or later | 11:00 | Accepted, 90-minute delay, suitable open window |
| Snooze | 09:50 or later | 09:50 | Snoozed, 20-minute delay, still open |
| Dismiss | Skip open window 09:30–10:00 | 10:30 | Dismissed current window, next open window |

If the fixture or break duration changes, replace this table and deterministic assertions together, preserving coverage of distinct branches, a threshold in a block, short gaps and no later window. Unit tests use minute offsets; UI tests assert displayed times.

## Pure timing logic: automated unit tests

| ID | Related scenario | Given / action | Expected assertion |
| --- | --- | --- | --- |
| T-01 | US-02, US-14 | Candidate at meeting start and one minute before end | No viable suggestion. |
| T-02 | US-02, US-14 | Candidate at meeting end; 5+ minutes free | Exact block end is eligible. |
| T-03 | US-03, US-14 | Candidate in focus block; candidate at focus end | First blocked; second eligible if long enough. |
| T-04 | US-02, US-05 | Four-minute gap before next meeting, 5-minute break | No suggestion in gap; search continues. |
| T-05 | US-05, US-14 | Exactly five-minute gap before next block | Candidate at gap start is valid; a minute later is not. |
| T-06 | US-04 | Two sequential blocked intervals before open window | Search lands at first viable opening, not an intermediate blocked time. |
| T-07 | US-06 | Accept at reference 09:30 | Result time 11:00 and Accept reason code. |
| T-08 | US-07 | Snooze at reference 09:30 | Result time 09:50 and Snooze reason code. |
| T-09 | US-08 | Dismiss at reference 09:30 | Result time 10:30 and Dismiss reason code. |
| T-10 | US-06 | Accept threshold falls inside meeting | Search moves to meeting end or next viable window; reason includes schedule delay. |
| T-11 | US-07 | Snooze threshold lands in a short gap | Skip gap; choose next full window. |
| T-12 | US-08 | Dismiss while current open interval is long | Do not re-offer within same contiguous interval. |
| T-13 | US-06–US-08, US-10 | Each response on final available window | No nextMinute, end-of-day reason, no fabricated time. |
| T-14 | US-14 | Threshold exactly at block start and end | Start excluded; end may be chosen. |
| T-15 | US-15 | Unsorted, overlapping, adjacent blocks | Same valid result as normalized union of those blocks. |
| T-16 | US-15 | Empty block list | Earliest full slot within day is returned. |
| T-17 | US-15 | Invalid block bounds / non-finite minute / invalid day bounds | Reject fixture or return explicit invalid result; never claim `MOVE NOW`. |
| T-18 | US-16 | Threshold before workday start | Search begins at start, not prior day. |
| T-19 | US-16 | Threshold at/after final viable start | End-of-day result, no wrap. |
| T-20 | US-16 | Candidate would end past workday end | Reject candidate even if start is unblocked. |
| T-21 | US-06–US-08 | Repeat same input for every response | Deep-equal result, no mutation of fixture. |
| T-22 | US-02–US-08 | Generate/check candidate across each minute of fixture | Every returned suggestion satisfies the no-block, within-day, full-duration invariant. |
| T-23 | US-06–US-08 | Search across multiple blocks | Result never precedes response threshold; Dismiss result outside dismissed window. |
| T-24 | US-06–US-08 | Explanation mapping for normal, blocked-delay and no-window outcomes | Each maps to accurate copy including chosen response; no misleading live/learned claim. |

## UI state and interaction: component/integration tests

| ID | Related scenario | Given / action | Expected assertion |
| --- | --- | --- | --- |
| T-25 | US-01 | Open lab route | Fictional/simulation label, time, timeline, initial `WAIT`, reason and advance control shown. |
| T-26 | US-01 | Follow link from main screen | Lab loads without account, keys or optional integration. |
| T-27 | US-02–US-04 | Advance from 09:10 | 09:30 `MOVE NOW`, matching highlight/reason; no contradictory block label. |
| T-28 | US-05, US-13 | Initial `WAIT` | Response buttons absent or disabled, no response can be recorded. |
| T-29 | US-05 | Viable `MOVE NOW` | Exactly Accept, Snooze and Dismiss available; reason explains why now fits. |
| T-30 | US-06 | Accept at reference suggestion | Last response Accept, next time 11:00, coherent explanation. |
| T-31 | US-07 | Snooze at reference suggestion | Last response Snooze, next time 09:50, coherent explanation. |
| T-32 | US-08 | Dismiss at reference suggestion | Last response Dismiss, next time 10:30, coherent explanation. |
| T-33 | US-09 | Reset and repeat from same suggestion using different responses | At least two next outcomes differ; all three explanations differ. |
| T-34 | US-10 | Response in final window | Explicit no suitable window today; no stale next time or active response controls. |
| T-35 | US-11 | Reset from waiting, suggestion, result and end of day | Initial time, decision, highlight and blank response restored without reload. |
| T-36 | US-11 | Reset twice | Same initial state, no duplicate event or error. |
| T-37 | US-12 | Reload after response, or leave route and return | Lab returns to initial state; previous response absent. |
| T-38 | US-13 | Rapid double click or keyboard activation of response | One result, no double-advance or duplicated action. |
| T-39 | US-13 | Try advancing after terminal response | Result remains visible until Reset; no second suggestion or state change. |
| T-40 | US-04, US-10 | Fixture with no viable opening | End-of-day state and Reset; no `MOVE NOW` or enabled responses. |
| T-41 | US-17 | Keyboard tab/activate controls; inspect roles and names | Logical order, visible focus, named controls, status/reason available to assistive technology. |
| T-42 | US-17 | Render at narrow viewport and zoom | Time, response, status and reason remain legible and usable without clipping. |
| T-43 | US-18 | Deny camera/calendar, remove optional keys, disable optional provider network | Lab still completes all three branches with fixed schedule; no permission prompt. |
| T-44 | US-12, US-18 | Use lab and inspect imported history/preferences | No changes outside lab; existing main app route still renders. |

## Manual end-to-end acceptance walkthrough

1. **A-01 (US-01–US-05):** Start server without credentials; open the app, navigate to lab, confirm fictional-day label. At 09:10 observe `WAIT` for meeting. Advance and see 09:30 `MOVE NOW`, with consistent timeline, copy and response buttons.
2. **A-02 (US-06, US-09):** Accept, verify 11:00 and both response and schedule rationale; Reset. The lab returns to the same first state without reload.
3. **A-03 (US-07–US-09):** Advance, Snooze, verify 09:50; Reset, Advance, Dismiss, verify 10:30. Three explanations are different and at least two times differ.
4. **A-04 (US-10–US-13):** Exercise a final viable window in a test fixture, choose a response, verify no later time, inactive response actions and Reset. Reload and confirm no state survives.
5. **A-05 (US-17–US-18):** Repeat with keyboard and narrow viewport. Confirm readable reason, no permissions or network-dependent behavior, and that original WorkPulse main screen still functions.

## Coverage map and test boundary

US-01–US-18 each map to test IDs above. T-01–T-24 belong in the pure timing module tests; T-25–T-40 are component/integration candidates; T-41–T-44 and A-01–A-05 may be automated where repository tooling permits, with remaining visual/accessibility checks performed manually. Do not write tests that merely snapshot static copy. The high-value gates are never suggesting inside a block, response policy differences, coherent visible explanation, reset, and independence from optional integrations.

**Automation status:** Pure timing tests cover T-01–T-17 and T-19–T-24 through behavioral cases and a minute-by-minute invariant sweep. T-18 is unreachable through the public response API because responses require a valid in-day suggestion and delays are nonnegative; the workday-start clamp is covered indirectly. UI tests cover the initial WAIT, three response outcomes, and reset. Remaining UI, visual, accessibility and integration cases are documented for later automation or manual acceptance; they have not all been executed.
