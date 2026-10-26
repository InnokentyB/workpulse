# LOCK-004 — personal calendar and next-break guidance,26October2026

Owner asked for a calendar interface, forward-looking opportunities to move and
agent suggestions. Explicit choice: «Шкала занятости без названий — используем
уже выданный доступ.» Approved surface/data boundary: existing /personal, no new
Google scopes or event titles; eight-hour busy/free timeline and nearest suitable
five-minute break after the existing45minute work interval. Guidance while the
tab is open; no background scheduler, OS notification permission or calendar write.

## Outcome and deterministic specification

Main surface My day displays local date/timezone, actual timeline hour grid,
current moment, merged busy blocks, free space and one recommended five-minute
slot. A recommendation explains why that slot follows the work interval or busy
period. Until explicit Start work, do not infer elapsed sitting or invent a due
moment. After Start work, candidate>=max(now,dueAt); first full five-minute gap
inside the fetched horizon wins. Snooze20/Skip45 and completed-round due45 rules
remain. Changed selection/busy blocks re-evaluate; no valid gap means no-window.
Unknown, stale or partial results never become a suggestion or empty/free day.
An in-app cue becomes visible when the fresh current decision permits movement;
no claim of learned/ML prediction, medical need or closed-tab notifications.

## Architecture and canonical state

Retain existing Next/React/Google freebusy and encrypted connection store. Add
optional horizonStart and merged busy intervals to availability; legacy records
are preserved and re-read rather than deleted. Existing leases/history/tokens
are unchanged. Expose additive timeline and breakForecast projections, no event
names/descriptions/attendees or calendar IDs in timeline intervals. Calendar list
names remain in explicit selection settings. Forecast pure/deterministic, tested
at the user/API boundary. No new dependencies/services. Do not import inspector
online-only token as if it were a durable refresh grant; /personal may require
its existing offline consent flow, with the same scopes.

## QAR / risk boundary

Maintain320/390/768/1440 no overflow, localtimezone labelled, textual interval
list for accessibility, keyboard controls and live status. Existing10sec Google
request timeout,90sec freshness,60sec visible refresh, origin/cookie/PKCE and
camera cleanup preserved. All callbacks clear stale recommendation on failures;
legacy snapshots missing new fields yield unknown until refresh. Forecast must
never overlap busy, be before due/current time, or extend beyond horizon. Union
all selected calendars, clip invalid/provider data failclosed. No title/privacy
scope expansion or publishing inferred. Separate synthetic fixture storage and
prior source/package preserved; bounded Docker execution only.

## Scenarios/gates

C01 busy/free timeline matches fetched intervals; C02 start-work computes future
slot after45min; C03 due+free shows in-app cue; C04 due+busy proposes first later
5min gap; C05 fullybusy/no5min gap shows no-window; C06 stale/error/partial/legacy
missing interval data show unknown; C07 selection change invalidates all forecast;
C08 snooze/skip/completion/resume retain prior camera/cooldown semantics; C09
mobile/desktop timezone/labels accessible; C10 disconnected honest Connect with
no made-up sample schedule. RED before implementation; GREEN engineering plus
owner UAT required. Owner's calendar-interface selection authorizes this bounded
implementation within the existing architecture/privacy boundary. Device usability
and usefulness remain pending owner acceptance. No new application deadline or
submission acceptance is inferred from this feature.
