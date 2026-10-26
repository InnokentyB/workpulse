# WorkPulse

## Build With AI: Basics project

The current review candidate demonstrates a **camera-controlled lantern route**
at `/move`: six alternating side steps and returns, arms sideways and lowered to
open a gate, then arms overhead and lowered to light a lantern. Each stage has a
current instruction and movement example. Progress comes from camera recognition;
there are no manual scoring buttons. See [demo and acceptance steps](devpost/route-demo.md).

This repository imports the WorkPulse baseline from
[`InnokentyB/workpulse`](https://github.com/InnokentyB/workpulse) at commit
`5c047ed1ae63a4d834e07025449dcd3bdc5e21c5` (created during the
hackathon submission period). Earlier work added the **Timing Lab** feedback
loop; the owner subsequently approved the personal-workday camera challenge and
the current multi-movement route. Their decisions are preserved in
[`LOCK-002`](devpost/personal-use/LOCK-002.md) and
[`LOCK-003`](devpost/personal-use/LOCK-003.md). See
[`devpost/scope.md`](./devpost/scope.md), [`devpost/prd.md`](./devpost/prd.md), and
[`devpost/spec.md`](./devpost/spec.md). Branches and acceptance cases are in
[`devpost/user-scenarios.md`](./devpost/user-scenarios.md) and
[`devpost/test-scenarios.md`](./devpost/test-scenarios.md). These documents retain
their earlier planning history and identify the current route separately.

**Acceptance and integration status:** engineering checks pass, but real-device
camera acceptance remains pending. Google OAuth/list/free-busy support is
implemented and requires private configuration and owner consent; no live Google
connection has been accepted. `/move` needs no Google account and does not save a
workday completion. `/personal` is the separate persistent workday surface.
Eligibility of the disclosed imported baseline remains unresolved; this README
does not assert that the entire project began from an empty folder with the Learn
Skill Pack. No submission receipt or public demo-video URL has been recorded.

### Timing Lab demo

Open [http://localhost:3000/timing-lab](http://localhost:3000/timing-lab), or
follow **Timing Lab** from the main navigation. The fictional day starts in a
meeting at 09:10. Advance to the 09:30 opening, then try Accept, Snooze, and
Dismiss, resetting between branches. Their next suitable windows are 11:00,
09:50, and 10:30 respectively. The five-minute break requirement and 20/90-minute
response delays are illustrative demo rules, not health guidance. The lab needs
no calendar connection, camera, account, environment variables, or external
runtime service. Responses live only in page memory.

### Desk dance

Desk dance is available in the exercise catalog, ordinary guided activity flow,
and both game scenes at `/play?activity=desk-dance`. Choose seated or standing:
six eight-beat phrases at 80 BPM provide about 36 seconds of movement, with
user-paced transitions. Follow the visual beat or enable the optional on-device
synthesized rhythm. Confirm each phrase yourself after its eight beats; dance
has no camera verification. Pause stops sound and restarts the unfinished phrase.
Ordinary completion records a guided, unverified history entry.
See [`devpost/desk-dance.md`](./devpost/desk-dance.md) for scope and verification.

### Movement game

Open `/play` and choose **Neck reset** (four movements) or **Shoulder rolls**
(six cycles), then **Forest trail** or **Workshop**. Each completed movement
advances the traveler or assembles a lantern. The recommendation screen also
offers **Play this exercise**, which preselects the exercise. Manual self-report can
demonstrate the complete game without a camera; its result is unverified.
Optional camera mode uses the selected exercise's on-device tracker: four guided
neck movements with a final return to neutral, or six shoulder lift-and-return
proxy cycles. It does not assess exercise form or full rotation.
Pause preserves the count and neck sequence; camera resume requires fresh calibration. A new
run resets the scene. No game progress or reward is persisted in this version.
Automated tests use mocked camera landmarks. All four exercise/world combinations
have passed manual browser smoke checks; real webcam recognition still needs
hands-on validation. The extension's scenarios and evidence are recorded in
[`devpost/all-exercises-game.md`](./devpost/all-exercises-game.md).

The feature's TDPD and test catalog are
[`devpost/character-game-tdpd.md`](./devpost/character-game-tdpd.md) and
[`devpost/character-game-test-scenarios.md`](./devpost/character-game-test-scenarios.md).
The current traceability matrix, completed checks and open manual acceptance
gates are in [`devpost/character-game-validation.md`](./devpost/character-game-validation.md).

**Move more. Interrupt less.**

WorkPulse is a hackathon prototype for the Workplace Wellbeing track. It is an AI coworker that decides whether now is a good moment to interrupt a desk worker for a short movement break.

The core product principle is:

> Use deterministic logic for decisions that must be reliable; use AI for choices that benefit from flexibility.

## Current status

The MVP is a responsive single-page demo built around one proof: two contexts
with high movement need produce different decisions because interruption cost
is different. It includes deterministic `MOVE NOW` / `NOT NOW` decisions,
clear explanations, three selectable activities, and a minimal `Start → Done` loop.
The context panel labels the calendar input as demo data. During the movement
activity, the user can explicitly enable the browser camera and let an on-device
pose model guide a four-movement neck reset. The shoulder-roll activity can use
the same optional camera flow to check six lift-and-return cycles on-device, with
manual completion available for either activity. Video is never recorded,
stored, or uploaded, and the camera stops when verification completes. Completed
activities are recorded in a local, browser-only history with time, duration,
verification mode, and movement count; the history also summarizes today's count
and the latest activity.

The `/for-teams` route presents the buyer story for HR and People Operations:
the interruption problem, WorkPulse's contextual decision model, a bounded
pilot, validation metrics, and explicitly labelled commercial hypotheses. It
does not claim validated pricing or employer outcomes.

The canonical product and engineering specification remains
[`WORKPULSE_SPEC.md`](./WORKPULSE_SPEC.md).

The `/roadmap` page translates the near-term direction from
[`PRODUCT_VISION.md`](./PRODUCT_VISION.md) into a public, clearly labelled view
of proposed, tentative, and exploratory features.

The first real-calendar infrastructure is provider-neutral and documented in
[`CALENDAR_INTEGRATION.md`](./CALENDAR_INTEGRATION.md). Google Calendar is the
primary adapter and reads free/busy data only; Microsoft, Apple, and generic
CalDAV are registered as planned providers. Live connection still requires
OAuth endpoints, server-side encrypted token storage, and deployment
credentials.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Product demo: [http://localhost:3000](http://localhost:3000)
- Commercial presentation: [http://localhost:3000/for-teams](http://localhost:3000/for-teams)
- Timing Lab: [http://localhost:3000/timing-lab](http://localhost:3000/timing-lab)
- Movement game: [http://localhost:3000/play](http://localhost:3000/play)
- Google Calendar inspector: [http://localhost:3000/calendar](http://localhost:3000/calendar) (requires local OAuth configuration; see [`CALENDAR_INTEGRATION.md`](./CALENDAR_INTEGRATION.md))

## Verify

```bash
npm run lint
npm test
npm run build
```

## Project structure

```text
app/                    Next.js App Router entry points, including /roadmap
app/api/calendar/       Safe provider discovery endpoint
components/             Responsive product UI and interaction tests
data/demo-scenarios.ts  Stable scenarios for the live demo
lib/calendar/           Provider contracts, registry, Google adapter, context
lib/types.ts            Domain contracts
lib/decision-engine.ts  Reliable MOVE_NOW / NOT_NOW decision logic and tests
lib/activity-selector.ts
WORKPULSE_SPEC.md       Canonical product, engineering, and pitch spec
```

## Scope guardrail

The core MVP proves that a decision not to interrupt is as valuable as a
decision to intervene. The main demo uses labelled fixed calendar data.
The separately approved Timing Lab, optional movement game and Google Calendar
inspector extend that baseline. Live calendar access requires local OAuth
configuration. Continuous camera monitoring, video recording and LLM dependencies
remain outside this slice. The later `/personal` extension stores encrypted
connection and acknowledged round history on the server; the original demo
history and Timing Lab simulation are separate.

## Build AI release preparation — 23 October 2026

License: [MIT](./LICENSE), selected by the owner on 23 October 2026.
Third-party terms and attribution: [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

The current demo candidate is the `/move` route described above. The earlier
Timing Lab journey remains independently repeatable and labelled fictional.
Accept in Timing Lab does not launch an exercise. `/move` practice does not save
a workday completion; a configured `/personal` route saves acknowledged progress
and completion once. Real camera quality, comfort and device acceptance are not
established by synthetic tests. The owner walkthrough is still pending.
Registration is not a submission receipt.

### Container-only execution on Tower

Run all installation, builds, tests and servers in Docker. The host-native
commands earlier in this README are generic examples for other environments;
they are not authorized Tower execution instructions.

From the repository root:

```sh
docker compose build web
docker compose --profile tools run --rm checks npm test -- --maxWorkers=2
docker compose up -d --no-build --wait web
docker compose ps
docker compose logs --tail=50 web
docker compose stop web
```

The source-root stack uses its own project/image and loopback port 13002, so it
does not replace the existing Tower pilot or the owner-review preview. The build
includes locked installation, tests, lint and production compilation. To run
lint/build separately, replace the test command above with `npm run lint` or
`npm run build`. Never delete volumes as routine cleanup.

The optional Google Calendar inspector needs credentials and is not part of the
no-setup core journey. No live deployment is needed to reproduce the core locally.
Keep secrets outside the repository and never include a personal runtime .env.

The entry's imported-baseline disclosure at the top of this README is intentional.
The public overview and official rules differ in wording about pre-existing work;
organizer clarification is pending. No eligibility guarantee or final submission
is implied by the software being ready for review.

## Personal workday and camera challenge

Open `/personal` for your real-calendar workday, or `/move` to try the camera-only
challenge before connecting Google. The personal route is independent of the
fictional Timing Lab. One Google account can contribute up to20 calendars.

An explicit work-session start begins a45-minute interval. When a due break fits
a fresh five-minute calendar gap, choose a goal: reach a summit or build/light a
lantern. Six alternating side steps and returns lead to a gate; arms out and
lowered open it, then arms overhead and lowered light the lantern. A full-body
pose tracker recognizes the current action. The animated example is guidance;
it does not award progress. There are no manual count/finish buttons in this mode.
This recognizes movement patterns, not exercise-form quality.

Camera permission is explicit, video/landmarks stay on device, and pause/hide/
finish/navigation stops the stream. Acknowledged steps persist in a personal
round; resuming recalibrates. A dropped save response retries the same count.
Camera practice has no linked calendar or saved workday completion. Actual-device
framing, comfort and recognition accuracy remain owner UAT, not automated claims.

### Private Google configuration

Create a Google OAuth Web application client with read-only calendar-list and
free/busy scopes. For local root-Compose reproduction on13002, use exactly
`http://127.0.0.1:13002/api/calendar/google/callback` and
`WORKPULSE_PUBLIC_ORIGIN=http://127.0.0.1:13002`. Keep client ID/client secret and
a random32+character CALENDAR_SESSION_SECRET in an owner-private env file outside
Git. The owner-review preview instead uses13001 and its matching callback/origin.
A temporary in-app-browser port is not an OAuth entry point.

Use `compose.personal.yaml` with the base Compose to mount an encrypted persistent
connection store. Before first run, initialize only this project's new personal
volume as uid1000/gid1000 (the runtime app stays non-root). Never point tests at
that volume. Runtime needs write access to its own data directory and encryption
key; missing or unreadable storage fails closed. The reviewed owner preview uses
a separately initialized owner-only volume and private config, with rollback.

```sh
WORKPULSE_PERSONAL_ENV=/absolute/private/runtime.env docker compose -f compose.yaml -f compose.personal.yaml up -d --no-build --wait web
```

Offline authorization keeps refresh/access tokens encrypted on the server; the
browser holds an opaque HttpOnly connection cookie. Google can expire/revoke
permission, in which case reconnect. No event titles/attendees or event writes
are requested. Disconnect removes local connection data even if provider revoke
is unavailable. This bounded version has one server writer and no public signup;
only expose it through loopback/SSH. It checks while the page is visible, not when
the browser is closed. Timing/step thresholds are initial parameters to validate,
not medical or physiological measurements.

### Movement route (25 October 2026)

New rounds in `/move` and `/personal` follow three camera-controlled stages:
1. Walk to the gate: six alternating side steps, each with a return to centre.
2. Open the gate: hold both arms out to the sides, then lower them.
3. Light the lantern: hold both arms overhead, then lower them.

The current instruction and animated movement example change at each stage.
Both scene themes use the same route. No button or animation awards progress.
Keep your whole body and both hands visible, and use a comfortable range of
motion. Recognition thresholds require acceptance on the user's actual device.
New persisted rounds carry `movementVersion: route-v1`; previously saved rounds
retain their earlier eight-step exercise. Each route still has eight acknowledged
milestones, with the same once-only completion and calendar cooldown rules.

### My day: busy/free calendar and next-break guidance

`/personal` now presents the next eight hours as a calendar timeline: merged busy
blocks from the selected calendars, free intervals, local timezone/date, a current
moment marker and the nearest recommended five-minute break. It does not request
meeting titles or additional Google scopes. The previous `/calendar` screen is
labelled Connection check and links to My day; its temporary inspector login is
separate from the persistent personal-workday authorization.

Start work explicitly to begin the45-minute interval. The recommendation chooses
the first full five-minute free gap at or after the due time. Snooze, Skip,
completed rounds and changed calendar availability recompute that opportunity.
The in-page invitation appears automatically when a due break fits now, while
the tab is visible. This uses deterministic calendar/work-interval rules, not a
trained prediction of health needs. No events are written and no reminders run
with the browser closed. Stale, unavailable or partial data suppress suggestions
until a fresh successful check. The page checks availability every60seconds while
visible; old stored snapshots are refreshed without deleting personal state.

### One real workday, exercises and saved history

The home route now opens `/personal` (My day). The former fixed-scenario screen
is preserved at `/demo`, labelled fictional and linked to real exercises in
My day. Its browser-local demo/manual history is not imported as verified work.

The personal catalogue offers Lantern route (8 milestones), Neck reset
(4 recognized movements including the final return to centre), and Shoulder
lifts (6 lift-and-return cycles). Choose an exercise and **Start exercise now**
to move deliberately before the next suggestion, including when a calendar
is busy; this is a user choice, not an automatic recommendation. Suggested
breaks still require the original fresh-calendar and due-time rules. Explicitly
enable the camera; there is no personal manual scoring fallback.

Acknowledged progress, pause/resume and completion use the same server run/lease
and encrypted history as My day. History shows exercise, count, time, camera
mode, chosen/suggested source and elapsed wall time (including pauses) where
available. Completion saves once and starts the next45-minute interval. Cancel,
error and incomplete movement do not create a completed activity.

Existing records are preserved. New exercise runs use record format2; current
code reads formats1and2. Old builds intentionally reject format2 rather than
misinterpreting a four/six-movement run as eight. After new data is written,
rollback must preserve it and use a compatible build; do not overwrite it with
an earlier snapshot. Actual-device movement recognition remains owner UAT.

### Camera-driven game

The primary **Camera game** link (`/play`) opens the real camera exercise in
My day; the former manual game is retained at `/demo/game` and labelled legacy
self-reported demo. `/play?activity=neck-reset` or `shoulder-rolls` selects that
real exercise. The old guided dance remains explicitly a demo.

With the camera enabled, the character responds to the current visible pose.
Recognized and saved movements advance it up the mountain; pose following alone
never awards progress. The same existing4/6/8 targets, gate/lantern rules and
history acknowledgement remain. Pause, missing framing and camera shutdown must
not leave a stale pose presented as live. Pose processing stays on-device and
requires acceptance on the owner's actual camera.

### Desk camera challenge (26 October follow-up)
The main exercise catalogue offers **Lantern arms** (four alternating sideways/overhead hold-and-lower gestures, no hips or legs required), Neck reset and seated Shoulder lifts. Gate opens after two gestures; lantern lights after four. The legacy eight-movement full-body route keeps its saved meaning. Shoulder lifts keep the existing six-cycle ID and history; the camera wrapper now uses head and shoulders only, with explicit lift/return and head-bob rejection. Real owner-camera acceptance of that fix remains pending. Use Discard unfinished round to switch from an older paused exercise. `/move` is unsaved arms practice; `/play` defaults to the personal arms challenge. Local explicit tab recording is available at `/record-own-camera.html`; it downloads to the user's computer without uploading.

New arms sessions mark encrypted records format3 to prevent older fallback-eight readers from misinterpreting the four-movement target. Current reader accepts1/2/3; version never downgrades. After arms data exists, rollback must keep a format3-compatible reader; never restore stale personal data over current sessions. Real-camera acceptance remains distinct from deterministic pose tests.

### Current real-camera acceptance status
The owner's desk-camera trial still found unreliable movement recognition and inconvenient framing. Automated and synthetic-pose checks do **not** establish real-person recognition quality. Neck reset was reported working in an earlier owner trial; the complete seated challenge has not been accepted. Treat camera exercises as experimental. Improving the desk-distance setup, recognition feedback and real-camera reliability remains open. The current app records recognized patterns, not exercise form or medical outcomes.
