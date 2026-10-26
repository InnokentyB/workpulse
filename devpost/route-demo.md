# Camera route — demo mechanics and acceptance, 26 October 2026

Technical operator notes, not the learner's submission prose or narration.
Current behavior baseline: fb4164b. Owner approved movement LOCK-003; real-device
UAT and a new working-camera recording remain pending. Eligibility is unresolved.

## Version boundary

| Version | Recognition | Evidence | Human acceptance |
|---|---|---|---|
| b4fb3d8 | Eight alternating side-step/return cycles; two goal scenes |229tests,20browser checks; positive poses synthetic |Not recorded |
|99c648e |Six alternating walking cycles, sideways-arm gate gesture, overhead-arm lantern gesture |241tests,13browser checks; synthetic poses |Not recorded |
|fb4164b |Same route; mobile cue immediately above camera |Production build,10bounded browser confirmations; source changes from99 are CSS only |Not recorded |

Eight is the milestone total for route-v1:6walking+2arm gestures. Both goal
choices use the same recognition sequence; they are not two different exercises.
No claim that old video or UAT proves the new route. Old unversioned personal
rounds retain eight-step behavior; new ones are tagged route-v1.

## Minimal owner camera acceptance

Use the already-open `/move` page; refresh it. For a clean local checkout use
Docker instructions in README and http://127.0.0.1:13002/move. Owner preview is
http://127.0.0.1:13001/move through its private tunnel. Enable camera explicitly.
Whole body and hands must fit; wait until the cue finishes neutral calibration.

| ID | Owner action | Visible pass condition | Existing evidence |
|---|---|---|---|
|R01 |Choose either goal; enable camera; stand still with arms down |0/8 until calibration; cue then names side |Component tests; camera/model lifecycle checks; owner pending |
|R02 |Six alternating side steps, each followed by return to centre |Exactly+1 per full cycle; at6/8 character reaches closed gate; no completion |Synthetic full-route browser PASS; owner pending |
|R03 |After neutral calibration, arms sideways for about1second, then down |Hold alone stays6/8; return gives7/8; gate visibly opens |Synthetic full-route browser PASS; owner pending |
|R04 |After neutral calibration, arms overhead for about1second, then down |Hold alone stays7/8; return gives8/8; lantern lights; camera ends |Synthetic full-route browser PASS; owner pending |
|R05 |At closed gate try overhead arms; make a short/partial gesture |No gate opening or extra point |Tracker/component+synthetic wrong-gesture browser PASS; owner pending |
|R06 |During a new run press Pause, then move; resume explicitly |Browser camera indicator turns off, video stops, count stays fixed; resume recalibrates |Browser tracks ended/no late count PASS; physical indicator owner pending |
|R07 |Leave frame or hide page mid-gesture, return/resume |No incomplete milestone; acknowledged count retained, recalibration required |Tracker/lifecycle tests PASS; owner pending |
|R08 |Try the other goal selection |Same route and gestures; accurate count/cue/finish |Shared tracker tests; no claim of separate live-human recognition acceptance |

Record PASS/FAIL, browser, chosen goal, expected/actual count. For FAIL keep the
stage and observation, fix before filming; no manual confirmation fallback.
Practice does not save a personal-workday completion. Google is not connected.
Do not use synthetic bootstrap against personal storage. Move comfortably; this
is neither form-quality scoring nor a medical outcome measurement.

## Recording shot list — target2:30, always under3minutes

- 0:00–0:15: actual `/move`, learner explains their purpose in their own words.
- 0:15–0:30: choose a goal; show current example and explicit camera enablement.
- 0:30–0:45: show full-body framing/neutral calibration and0/8.
- 0:45–1:30: show six real steps, sideways hold/return opens gate, overhead
 hold/return lights lantern. Let the viewer see input and response together.
- 1:30–1:55: restart, show partial/wrong movement gives no score, then Pause
 visibly stops capture. If timing is tight, keep the full route and Pause.
- 1:55–2:15: optionally show `/personal` setup honestly; no connected-calendar
 claim. Timing Lab, if shown, must remain labelled fictional simulation.
- 2:15–2:30: learner explains what they learned; show repository/docs if useful.

Do not write narration for the learner. English narration or complete English
translation/subtitles required. Avoid personal windows, calendar names, tokens,
credentials and third-party music. No synthetic fixture footage presented as a
human-camera run. Local video is a review artifact; public YouTube/Vimeo upload
requires owner authorization and must be checked without login. Previous23Oct
103.64sec recording demonstrates the previous product, not this route.

## Calendar boundary

One-account/multiple-calendar OAuth, encrypted token storage, calendar selection,
45minute explicit work interval,≥5minute fresh availability and persistent
route milestones are implemented for `/personal`. Actual Google client/consent
and live list/freebusy acceptance are still pending. No cross-account support,
background reminders in a closed browser, or clinically validated motion claims.

## Submission mechanics checklist

- Resolve/disclose baseline eligibility; organizer question is draft only.
- Owner camera acceptance and learning wrap-up recorded, not inferred from tests.
- Review current commit/history for secrets/private material and third-party notices.
- Publish exact reviewed code+MIT+scope/prd/spec only after authorization.
- Record working route, verify<3minutes and English materials, authorize upload.
- Check public repository and public YouTube/Vimeo links without login.
- Owner writes final Devpost answers and exit survey; agent only grammar/spelling.
- Check exact authorized form fields, eligibility and participants; Submit with
 owner authorization and retain receipt. No receipt has been recorded.

Official deadline26Oct2026 17:00EDT=21:00Europe/Lisbon.19:00 is a suggested
internal target only. Preserve free judge access through judging30Oct. Live
public deployment is optional; private localhost is not a public video/repo URL.
Sources: https://learn-ai-basics.devpost.com/rules and https://learn-ai-basics.devpost.com/ .
