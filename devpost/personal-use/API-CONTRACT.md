# Personal-use API/interface contract — implementation guidance

GET /api/personal returns JSON:
{configured:boolean,connected:boolean,calendars?:[{id,name,primary}],selected:string[],workStartedAt:number|null,dueAt:number|null,lastCompletedAt:number|null,history:[{id,goal,steps,completedAt}],run:null|{id,goal:'trail'|'workshop',count:number,status:'active'|'paused'|'complete'},availability:null|{observedAt:number,isBusy:boolean,freeMinutes:number,reason:string},decision:'setup'|'start-work'|'wait'|'move'|'unknown'}.
GET must not leak tokens/lease; server may refresh availability on ?refresh=1. Current observer's timestamps are server time.
POST /api/personal takes action:
- select {calendarIds:string[]}
- start-work
- snooze (20min)
- skip (45min)
- refresh
- start-run {goal:'trail'|'workshop'} -> response state plus runLease string
- resume-run {runId} -> state plus new runLease
- pause-run {runId,lease}
- cancel-run {runId,lease}
- progress {runId,lease,count} where count is next recognized1..8; same-count retry idempotent; exactly8completes once
- disconnect
Returns same state JSON (plus runLease only on start/resume), errors {error:string},403origin,401connection,409state/lease/conflict,400invalid,502provider,503store.

GET /api/personal/google/start uses existing Google redirect URI and state/PKCE flow with purpose:'personal', offline access. Existing /api/calendar/google/callback handles personal purpose by storing refresh/access credentials in new store, sets workpulse_personal opaque HttpOnly cookie at /api/personal, redirects /personal. Legacy inspector flow unchanged. Google helper only requests scopes already approved.

State/config store defaults server WORKPULSE_PERSONAL_DATA_DIR. All per-record encrypted on disk. Test adapter enabled only via WORKPULSE_PERSONAL_TEST=1 with separate TEST-only secret/store path; refuse combined real Google credentials, refuse directory not labelled test/fixture. Tests may seed through fixture-specific bootstrap route/API action guarded by test-only mode; never production UI fallback for tests. Personal entry without Google config displays setup instructions and camera practice link.

Camera-only practice route /move (same StepTouchChallenge component used in /personal): allows real camera exercise without Google to validate framing/model. Explicitly says 'Camera practice — calendar not connected', history not attached to personal workday. It has no manual progression and never claims full live-loop acceptance. User can choose trail/workshop;8recognized steps end one local practice round. This route enables necessary real-camera UAT before OAuth is configured; do not conflate it with a connected workday.

Component StepTouchChallenge props:
{goal:'trail'|'workshop',initialCount?:number,onCycle:(count:number)=>Promise<boolean>,onPause?:()=>void,onCancel?:()=>void,onComplete?:()=>void}
onCycleack true advances scene;false/errors pause camera and show save/retry,never fabricate completion. Resume recalibrates,count preserved. Practice onCycle resolves true locally; personal wrapper persists via API. No actual Google cookies needed to practice but no workdayrecord saved.

Module lib/step-touch-tracker.ts exports initialStepTouchState(count?:number),updateStepTouch(state,landmarks,timestamp),type StepTouchState. State includes count,phase:'calibrating'|'step'|'return'|'complete',expectedSide:'left'|'right',tracking:'lost'|'ready' etc. Client motion driver can be deterministic only in explicit test adapter separate from live runtime; production never accepts a JS/global/URL query fake counter. Browser tests can stub MediaPipe module response via response interception in test build; real inference/model availability requires separate smoke/device UAT.
