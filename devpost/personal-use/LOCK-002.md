# LOCK-PERSONAL-002 — active camera-controlled break with real calendars

Status: APPROVED by owner on25October2026; implementation parameters and review resolutions below are part of the agreed boundary.
Supersedes shoulder-only proposal LOCK-001, rejected by owner on25October2026 as insufficiently active.
Source baseline a68a562; existing submission package and preview preserved unchanged.

## Owner intent
Connect the owner's Google calendars and make a genuinely active movement/dance experience, with a clear example and game-character response to actual camera-recognized movement; no manual count confirmations.

## Proposed concrete exercise
Eight alternating step-touch repetitions with arm movement: step to one side and bring the feet together, then the opposite side. Full-body camera framing (head through feet), visible space to step. A demonstration animation shows the direction, foot placement and arm action; camera preview shows the owner's actual pose and tracking state separately from the sample.
One counted repetition requires a valid side step and return, alternating sides. Time, sample animation, button clicks and stationary arm waving do not count as a step. The character advances one milestone per recognized repetition.
Use labels 'recognized step pattern' rather than exercise-quality/medical verification. Before implementation, confirm full-body framing/space with owner. If impractical, revise the active movement before tests instead of silently falling back to shoulder shrugs or manual self-report.

## Calendar / workday surface
Separate `/personal` flow: connect one Google account, select1–20 calendars; only calendar names/list and free/busy access. Private single-owner deployment, no public sign-up or multiple Google accounts.
Start work session explicitly. Proposed default45minutes between completed movement sessions, free window at least5minutes, calendar refresh every60seconds while visible; snapshots older than90seconds gate/recheck before recommending. Unknown/offline/partial Google result never becomes free time. No sitting detection implied.
Persist selected calendars, work session, cooldown and completion IDs with the connection. Snooze20minutes and dismiss a current opportunity without recording exercise completion. Completed camera session records once and influences next time.
While-tab-open operation only; no new background scheduler/closed-browser notification claim. Existing fictional Timing Lab and manual game remain separately labelled demo surfaces.

## Architecture and privacy boundary
Reuse Next/React, calendar adapters and MediaPipe pose pipeline/scene. Add a step-touch tracker rather than pretending the shoulder tracker recognizes dancing.
Canonical per-connection state in an encrypted file store on a dedicated Docker volume; server-only encryption key in private runtime env outside source/images/logs. Google refresh/access tokens stored server-side, browser gets opaque random HttpOnly connection cookie. Atomic writes and per-connection mutation/refresh serialization; one writer process. No migration/synthetic tests touch owner state.
Keep minimal Google scopes, state/PKCE/origin checks. Offline authorization for on-demand refresh, sanitized expiration/revocation recovery, no refresh token exposed to the browser. Disconnect revokes where possible and deletes local connection.
No camera recording/upload or raw landmarks retained. Explicit permission; preview/pose evaluation on device. Pause, tab hide, navigation, completion and errors stop all tracks and invalidate late callbacks. Recalibrate on resume; preserve only previously completed steps. Permission/model failure offers retry/stop, never manual success.

## QAR / risk decisions requiring confirmation
- Widths320/390/768/1440 without horizontal overflow; keyboard-operable actions; text tracking status; reduced-motion sample.
- Google request deadline10seconds; no concurrent refresh race; snapshot freshness90seconds.
- Character reacts within500ms of a recognized tracker event in controlled browser test; real inference/framing quality remains device UAT.
- Stationary posture, lost knees/feet/head, hidden tab and incomplete step/return must produce no score.
- Eight recognized repetitions cause exactly one completion/cooldown update across reload/replay/duplicate events.
- Camera cleanup verified automatically by stop() calls and manually by device indicator. No medical benefit/form claim.
- Store encrypted at rest; no secrets in logs/source/API payload; synthetic test volume distinct; preserve current preview/artifacts/rollback.

## Authority/gates
Owner authorized movement/calendar development and maximum autonomous setup. This active-step design replaces the rejected shoulder proposal; owner confirmed it and the calendar/storage/timing boundary on25October2026.
Under AGENTS.md, finalize user scenarios/RED only after LOCK/QAR/ARCH/RISK approval. Then implement against executable tests in Docker, review independently, activate Google connection only with owner's credentials/consent, and perform real-device UAT.
No public deployment, final submission, outbound organizer email, paid provider or scheduler authorization is inferred.

## Owner approval / implementation resolutions — 25 October 2026

Owner confirmed proposed active step-touch + calendar/storage/timing boundary: «Ну давай. Да ... несколько вариантов ... как турнир ... количество движений приводит к понятной цели».
Status: APPROVED for bounded personal-use implementation. Two selectable goals for the same eight-step round: summit trail or building/lighting lantern; one completed round is the durable achievement. No online multiplayer/ranking or additional motion catalogue in this slice.

Architecture/risk review resolutions (implementation parameters within approved boundary):
- Guided arm action is optional; recognition counts the alternating lateral foot/body step and return, not arm form. Copy must state this.
- Recognition FSM:15 stable full-body frames establish baseline/scale; require finite visible head,shoulders,hips,knees,ankles within frame. A side opening must increase ankle separation by0.45shoulder-width and shift hip centre0.15shoulder-width in the expected direction for3samples. Count only after3return samples (ankles within baseline+0.15width,hips within0.20width), at least800ms after opening. Alternate sides; incomplete/lost framing resets phase and recalibrates without clearing completed count. Thresholds are initial engineering parameters requiring actual-camera UAT, not established accuracy.
- Store run{id,goal,count,phase,lease,updatedAt}; creation/resume issues a lease so another tab cannot advance the same run with stale callbacks. Recognized cycle is saved as monotonic count+1; duplicate same-count retry is idempotent.8th accepted step atomically completes run,adds one history item and resets next due45minutes. Store failure leaves no acknowledged completion; camera pauses and user can retry. No arbitrary client 'complete' action.
- Reload discovers unfinished run; explicit resume rotates lease and recalibrates,keeping only server-acknowledged count. Cancel has no success/cooldown side effect. Concurrent start gets409; old lease progress gets409. Different connection cookies isolate users.
- Fresh snapshot is bound to exact selected-calendar revision,request interval and server observation time. Any selection change invalidates it. Start/resume checks fresh availability covering now through at least5minutes. Partial Google errors invalidate whole decision.
- Start work session begins initial45minute interval; it does not infer previous sitting. Snooze20minutes; Skip45minutes postpones without marking completion. Work-session elapsed clock/last completion are explicit,not health measurement.
- Read-only/failed/corrupt store fails closed; no invented free time,connectivity or completion. Disconnect clears connection state before/irrespective of provider revoke outcome; if revoke fails, explain local removal and offer Google account revocation instructions.
- Google credentials/client JSON are outside source in /home/innokenty/migration-private/workpulse-personal; no live Google call happens before owner-supplied client and consent. Test fixture mode uses separate volume and cannot be enabled together with liveGoogle config or reuse owner store.

Independent implementation review resolutions:
- Frame gaps above750ms invalidate the incomplete sequence and require calibration, keeping acknowledged steps.
- Camera-side save acknowledgement deadline8seconds stops tracks on timeout; personal API fetches have12second AbortSignal deadlines. Same pending count can be retried/reconciled; late replies cannot advance a paused/disposed camera session.
- Replacement OAuth deletion shares per-connection serialization, and a failed replacement cleans the newly written record.
- Every selected Google calendar must supply an actual busy array; missing/null/malformed entries are unknown/provider failure, never free.
- Standalone/proxy origin must come from explicit trusted WORKPULSE_PUBLIC_ORIGIN (or configured OAuth redirect origin), never arbitrary forwarded headers. Validate Host and Origin against it; all OAuth redirects/cookie Secure flags use that public origin. Actual standalone-origin smoke with fixture credentials must pass before live activation.
