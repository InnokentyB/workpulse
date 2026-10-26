# LOCK-PERSONAL-001 — real calendars and camera-only shoulder break

Status: SUPERSEDED — owner rejected shoulder-only movement on25October2026 as insufficiently active. See LOCK-002.md; no production implementation was started.
Owner requested on24October2026: connect their Google calendars and provide one shoulder exercise with a clear example, with the character controlled by camera rather than manual confirmations.
Baseline: a68a562; application logic last changed at d61623b. Existing contest package/preview preserved.

## Problem / intended result

A single desk worker (the owner) wants to notice suitable movement opportunities during their actual workday and complete one understandable exercise. Observable result: real selected calendars gate a prompt; six camera-recognized shoulder lift/return cycles advance the character and record one completion that influences the next prompt. No manual count/finish substitutes.

## Goal and surface (proposed)

- Separate personal-use web route `/personal` with setup, work-session dashboard, live availability and one camera-only exercise. Existing demo routes remain labelled as demos.
- One Google account; up to20 selected readable calendars from that account. Multiple independent Google accounts are excluded from this slice.
- Access only calendar names/list and free/busy intervals, not event titles, attendees, descriptions or writes.
- Persist selected calendar IDs and encrypted Google refresh/access credentials on Tower. Browser carries opaque connection identifier only; server storage outside source/image. Refresh on demand. Revocation/expired authorization asks for reconnection.
- Owner explicitly starts a work session; default45minutes since start/last completed camera activity. After45minutes, propose movement only when calendar data is fresh and a free window of at least5minutes exists.
- Snooze20minutes / dismiss current opportunity; these change timing, never assert physical completion. Completed activity postpones next prompt45minutes.
- Auto-check availability every60seconds while the personal page is visible. Hidden/resumed page refreshes before deciding. Do not claim closed-browser/background notifications or enable schedulers in this slice.
- Do not infer sitting or actual movement need from a calendar. Display elapsed work-session time as such.

## Exercise contract (proposed)

Name: Shoulder lift / relax, not Shoulder rolls. Existing tracker recognizes lift/return proxy cycles, not circles.
- A clearly labelled animated upper-body example: relaxed baseline -> both shoulders gently up -> return relaxed. Step labels and progress visible; reduced-motion gets static side-by-side positions.
- Explain head/shoulders framing; explicit Enable camera -> stable neutral calibration -> Lift -> Relax.
- Six recognized complete cycles advance character by one step each; no count from time, the example animation, hidden tab, missing landmarks or button clicks.
- No manual-confirm/manual-complete fallback in this personal exercise. Permission/model failure yields retry/cancel; no success or saved activity.
- Pause/tab hide releases camera and invalidates late callbacks. Resume recalibrates while preserving completed cycles. New run clears all cycles.
- Completion releases camera immediately and records one activity labelled camera proxy; no exercise-form/medical claim.
- Video/frames/landmarks stay on device; no recording/upload. Camera model/runtime may download from explicitly described upstream URLs.

## QAR (proposed)

- Real readiness: no MOVE NOW or exercise start based on unknown/failed/stale calendar data. Snapshot older than90seconds refreshes before decisions.
- Google network timeout10seconds, clear reconnect/retry states, no duplicate concurrent refresh per connection.
- Resume/page navigation/pause must request track.stop immediately and ignore all late callbacks; browser contract test verifies stop calls. Actual camera LED requires human UAT.
- Supported widths320,390,768,1440px, no horizontal overflow, keyboard-operable controls and text-based tracking states.
- Render recognized completed cycle within500ms of tracker event in browser test. Real inference latency measured on owner's device, not claimed from mocks.
- No progress during lost framing/hidden state; no duplicate history or cooldown reset after repeated completion callbacks.
- Session survives server restart and ordinary refresh; invalidated/revoked Google permission cannot yield invented free time.

## Architecture / durable truth (proposed)

Reuse Next/React, calendar adapters/context merging and shoulder tracker/scene; no second server stack.
Canonical encrypted per-connection record on dedicated Docker volume: credentials, selection, work session/cooldown, recent camera-completion IDs. Atomic file replacement and per-record mutation/refresh serialization; only one preview server process writes this store.
Opaque random connection cookie (HttpOnly,SameSite,origin-checked writes); encryption key private env separate from volume. No tokens in browser/localStorage, source, logs or API JSON.
New personal surface reads/writes this record. Legacy calendar inspector may share read-only availability adapter, but cannot overwrite personal canonical session or import synthetic state. Test state uses a different named volume and deterministic Google adapter, never owner data.
Private localhost/SSH exposure only, stable origin http://127.0.0.1:13001. OAuth client redirect must exactly match that origin. Other temporary Codex localhost ports are not the OAuth entry point.

## RISK / recovery (proposed)

- Google consent/client creation require owner interaction. Secret values never requested in chat. No Google account password handled by app/agent.
- OAuth state+PKCE+scope checks+origin checks retained; token validation and refresh/revoke errors sanitized. Local rate bounds and request deadlines.
- Clock moves/timezone boundaries and cross-tab replay must not create duplicate completions or overdue auto-success.
- If camera is inaccessible/uncomfortable, user can stop; no forced movement, no score for cancellation. This is optional wellbeing, not clinical care.
- Competing/upstream outage means unknown, not free. Server secrets missing leaves live mode visibly unavailable.
- Backup before connection-store format changes; preserve existing preview/contest artifacts. No cutover of original pilot port3000.

## Authority / delivery

User authorized implementing real-calendar/camera shoulder scope; this concrete QAR/ARCH/RISK lock awaits explicit approval under AGENTS.md.
After approval: user scenarios and RED boundary tests first; minimal implementation; Docker GREEN; independent review; owner Google consent and real-camera UAT.
No new public deploy, contest submission, organizer message, paid API or scheduler is authorized by this lock.
