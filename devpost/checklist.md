---
doc: checklist
status: approved
---

# Character Game Build Checklist

Build mode: fast. The user authorized full TDPD preparation and implementation on 2 October 2026; implementation details are filled in under the previously agreed two-scene direction. Existing Timing Lab and Google Calendar work precede this checklist.

## Slices

- [ ] **1. Play a complete six-movement character scene without camera**
  Becomes usable: Choose Trail or Workshop, start a labelled manual demo, advance six self-reported movements, pause/resume and replay.
  Why now: Proves the character's response to movement and a bounded session before requiring hardware.
  PRD ref: `prd.md > Implementation Choices`, `character-game-tdpd.md`
  Spec ref: `spec.md > Character Game Extension`
  Build: Original SVG scenes, shared progression, accessible controls and completion evidence.
  Verify (mechanical): Scene and game interaction tests, lint, production build, browser manual-mode walkthrough.
  Learner check: Open `/play`, compare Trail and Workshop, and describe which scene makes the movement more engaging.
  Commit: `Add movement-powered character scenes and manual demo`

- [ ] **2. Drive the same scene with the optional shoulder camera tracker**
  Becomes usable: Explicitly enable camera, calibrate, count lift-and-return cycles, pause, resume and finish at six.
  Why now: Reuses a demonstrated tracker after the playable story works, with a manual fallback for hardware/model failure.
  PRD ref: `prd.md > Implementation Choices`, `character-game-tdpd.md`
  Spec ref: `spec.md > Character Game Extension`
  Build: Optional progress events from ActivitySession, preserved count on resume, cleanup and accurate camera/manual evidence.
  Verify (mechanical): Camera lifecycle and mocked landmark tests, full regression test suite, lint and production build.
  Learner check: On a camera-capable browser, complete a run, pause halfway, resume and confirm the scene progresses only after counted cycles.
  Commit: `Connect character progression to shoulder movement tracking`

## Hands-on Checkpoints

- [ ] First playable scene explored by user — manual demo and comparison of the two scenes.
- [ ] Final camera walkthrough and feedback completed by user.

## Final Review

- [ ] Final review complete — user feedback resolved and readiness confirmed.

Mechanical verification does not establish real webcam recognition quality. That remains a hands-on check on the user's device.

Current TDPD checkpoint, 2 October 2026: both slices are implemented; 148 tests in 25 files pass (+36 from the first implementation), lint and production build pass. Production `/play`, `/timing-lab` and `/` return HTTP 200 with expected page content. Scene SVGs were visually reviewed at 0/3/6 in the earlier checkpoint. Slice checkboxes remain open because their browser/user walkthroughs have not happened. Real camera, responsive layout, keyboard and screen-reader acceptance remain pending; Chromium download failed in this environment. Current execution detail and all 38 cases are recorded in `character-game-validation.md`.

## Code Tour and App Map

- [ ] Learning wrap-up / code route reviewed by user.
- [ ] Optional transfer reflection addressed.
- [x] App map generated — see `character-game-validation.md`; user walkthrough remains open.

## Revisions

- TDPD source verified against current `TDPD.md` version 2. Renamed `character-game-edpd.md` to `character-game-tdpd.md`, corrected references, documented product/implementation state mapping and added the 38-case evidence matrix. Banking-specific rules were not transferred to WorkPulse.
- Additional changes follow acceptance → failing test → minimal fix: stale camera failures, interrupted tracking, unstable calibration, invalid visibility and scene accessibility. New tests cover model/camera/video failure and retry, and the integrated six-cycle camera run. See `character-game-validation.md` for the current engineering checkpoint and remaining hands-on gates.

- The existing technical spec's frontmatter was still `draft` despite its approved implementation text; synchronized it with the already authorized build.
