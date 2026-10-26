# LOCK-005 — one workday/exercise/history flow,26October2026

Owner asked to connect hardcoded Live Demo with My day so exercises can actually
be performed and recorded. Bounded implementation: make My day the product home,
move current hardcoded application to explicitly labelled /demo, expose real
camera exercise catalogue in My day and use the existing encrypted personal
history as canonical durable truth. No migration of local demo/self-reported
history into verified personal completion; preserve it on /demo.

## Surface / lifecycle

Connect existing personal Google account (same scopes), view calendar/guidance,
choose lantern route8 / neck reset4 / shoulder lifts6 and perform it with camera.
Scheduled suggestions obey the existing fresh-calendar/due rules. A separate
explicit Start exercise now permits owner-chosen movement before due or while
busy/availability unknown; it is an intentional choice, not an automatic
recommendation or a manual success confirmation. Incomplete/cancelled runs do
not become history. One active run, explicit resume, monotonic acknowledged
movements, pause camera-off and exactly-once completion remain.

Show exercise name, completed count, completion time, camera verification and
elapsed wall time where available (includes pauses, no claim of active exercise
duration). On completed exercise, update lastCompletedAt and next due45minutes;
if no work session exists, the completed break establishes the next interval.
History survives reload. Camera access remains explicit, frames stay on device,
no manual fallback may produce a personal verified result.

## Architecture / QAR / risk

Canonical PersonalRecord/Run/History, encrypted existing store and leases.
Optional exerciseId/source/target/startedAt and history metadata preserve legacy
records. Target is derived from server catalogue, never arbitrary client target;
legacy missing fields remain target8 and retain previous recognition version.
Reuse camera lifecycle/MediaPipe and neck/shoulder trackers in robust challenge
adapter. Neck finalup must returnneutral before last completion. Shoulder lift
proxy must not count head-only bob; do not describe exercise-form validation.
Catalogue choices4/6/8, clear current cue, accessible buttons and saved history,
320/390/768/1440 no overflow. Existingstartup30sec/save8sec, freshness90sec and
Google request10sec boundaries preserved. No dependency/scopes/calendarwrites,
video recording/upload, public publishing, new scheduler or personal-data reset.
Back up private state/config and previous build before cutover; synthetic browser
source/volume separate. Never mark demo/manual history as real exercise.

Scenarios U01 home/Myday+labelledDemo; U02 choose3exercises before45min;
U03 camera-only target4/6/8 completes once and survives reload; U04 completion
updatesnextdue45; U05 pause/error/cancel neveraddscompletion; U06 exactretry and
oldlease no duplicate; U07 chosencasebusy/unknown permitted intentionally while
scheduled suggestion remainsfailclosed; U08 legacyhistory/count/versionretained;
U09 no arbitrary/manualcomplete and targetderivedcatalogue; U10 currentexercise
cue/example/resume, neckneutralreturn andshoulderhead-onlynegative; U11 use real
scope existingcalendar/privacy, no syntheticdemo import. EngineeringGREEN and
ownerUAT remain separate. Owner asked this integrated behavior; lowriskUI/API
extension retains approveddata/securityarchitecture. Device accuracy and user
usefulness remain owner acceptance, not inferred from tests.

Rollback safety resolution: new exercise-bearing runs atomically mark their
connection record format2. Current code reads1and2; existing1records/legacyruns
are not bulk-upgraded. A pre-feature server accepts only1 and therefore fails
closed onnew4/6/8exercise data ratherthanreinterpretingit asold8step progress.
After newwrites, preferfixforward; do not downgrade/restoreoverpersonaldata.
New neck/shoulder progress also names the exercise ID. Older cached eight-step
players cannot advance a typed upper-body run; missing/mismatched IDs are rejected
without mutation and ask to reload My day. Existing lantern/legacy requests stay
compatible. This guards mixed browser revisions as well as server rollback.
