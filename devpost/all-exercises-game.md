# All existing exercises in the movement game

Date: 2026-10-06. Source request: add game capabilities to every existing exercise variant. Method: TDPD by Innokenty Bodrov.

## Problem and approved surface

A user choosing Neck reset cannot currently use the game; only Shoulder rolls is wired in. Success is being able to choose either existing exercise, either world, and manual or camera input, and finish the complete scene with the exercise's actual target. Extend the existing `/play` browser surface and recommendation entry point, preserving its design and camera consent boundary. No new exercises, accounts, storage, permissions or provider changes.

## Contract and architecture

- Use the existing ACTIVITIES catalog: Neck reset 4 movements; Shoulder rolls 6 cycles.
- Both Forest trail and Workshop support both exercises. Each movement visibly advances the scene; the final movement completes it.
- Exercise, world and input mode are fixed during active/paused/complete runs; reset unlocks them.
- Manual entries remain self-reported, show exercise instructions and never request a camera.
- Camera uses the selected exercise's existing tracker. Neck progress preserves sequence and first-side direction through pause/stop/retry, recalibrates in neutral, and requires final neutral return before the fourth game point/completion.
- Game checkpoint is transient, belongs to the current run, carries no images or personal data, and is cleared on reset/new run. Generation protection rejects stale progress/checkpoint/failure events.
- Shoulder behavior and six-cycle scenes stay compatible. Camera failure offers a new unverified manual run from zero for the same exercise.
- Recommendations link to `/play?activity=<catalog ID>`; validate through selectActivity. Standalone `/play` retains shoulders as its default.
- Real movement accuracy and perceived engagement remain human UAT, not automatic claims. User can stop or opt out; no automatic camera access or medical assessment.

## Scenarios and evidence

| ID | User sequence | Expected output | Evidence |
| --- | --- | --- | --- |
| AG-01 | Choose neck, choose either world, start manually, report four movements | Four-step scene completes, unverified result; exercise locked until reset | MovementGame.test.tsx |
| AG-02 | Reset neck run, choose shoulders | Target returns to six and count to zero | MovementGame.test.tsx |
| AG-03 | Camera neck: first side, pause, resume, recalibrate, repeat first side, opposite side/down/up/center | No duplicate point; correct remaining guidance; complete only at center; camera closes | MovementGame.camera.test.tsx, both worlds |
| AG-04 | Camera error before final neck return, retry and recalibrate | Checkpoint and return requirement retained; completes once | MovementGame.camera.test.tsx |
| AG-05 | Open game from either recommendation | Exercise preselected, camera still optional | Recommendation UI test + browser smoke |
| AG-06 | Both exercises in both worlds, manual/camera, keyboard and mobile | Readable controls, visible progress and truthful result | Browser smoke for manual combinations; real camera/keyboard/mobile UAT pending |

The repository's existing Vitest browser-component integration tests are reused with deterministic pose/camera adapters. They do not constitute real-device end-to-end camera acceptance. RED: four new cases failed because Neck reset selection was absent (log in local work/). Human UAT remains open.

## Engineering results, 6 October

- GREEN: 155 tests in 25 files passed (148 baseline + 7 new checks).
- ESLint and production build passed; diff whitespace check passed.
- Browser: manual Neck reset in Forest trail (including pause/resume) and Workshop completed at 4/4; manual Shoulder rolls in both worlds completed at 6/6.
- Browser: recommendation's Play this exercise link navigated to `/play?activity=neck-reset`, selected Neck reset, and left camera optional/off.
- 390px browser inspection found horizontal overflow from the navigation; scoped game layout/navigation correction eliminated it. Final measured document width 379px at viewport 390px, no horizontal overflow. Viewport override reset afterward.
- Camera adapter checks cover both worlds, preserved first-side direction through pause and Stop camera, retry before final center, cleanup, and reset clearing the checkpoint. Real camera/pose accuracy, screen reader and user engagement remain unverified.
- Dev server for this change: http://localhost:3011/play . No commit, push, or deploy performed.
