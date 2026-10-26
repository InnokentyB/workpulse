---
doc: scope
status: approved
---

# Current review scope — camera route, 26 October 2026

Owner decisions: [LOCK-002](personal-use/LOCK-002.md) and
[LOCK-003](personal-use/LOCK-003.md). The current review journey is `/move`:
camera enablement, neutral calibration, six alternating side-step-and-return
cycles, arms sideways held then lowered to open a gate, arms overhead held then
lowered to light the lantern. Eight milestones contain **six walking cycles and
two arm gestures**, not eight walking steps. Both goal selections use this same
recognition sequence; they are not different exercises or a multiplayer contest.

For a screen worker who forgets to move, the intended outcome is an immediately
understandable action and visible character response. Camera-only progression,
the current example/cue and a visible finish are the bounded demonstration.
No clinical, form-quality or employer benefit is claimed. Owner device UAT is
pending; passing synthetic camera scenarios does not establish that outcome.

`/personal` additionally supports one Google account, selected calendars and
encrypted progress/history. Real OAuth access is not configured or accepted.
The camera demo does not depend on it and must not be described as using live
Google calendars. Existing Timing Lab and `/play` are separate older surfaces.
The imported baseline is disclosed in README; eligibility is unresolved.
See [current demo/scenarios](route-demo.md). The approved earlier plan below is
retained as history, not retroactively represented as the original camera plan.

# Historical plan — WorkPulse Timing Lab

**One line:** A timing and feedback experiment added to the existing WorkPulse application, showing how a movement companion changes *when* it suggests a break after accept, snooze, or dismiss.

## The Unique Kernel

The memorable behavior is a reasoned decision to wait. The app uses the same movement need in different work contexts and treats the person's response as new context for the next decision. It explains why the recommendation moved, rather than merely firing another reminder.

## Who It's For

A desk worker with meetings and long focus blocks who tends to ignore fixed-interval movement reminders because they interrupt at the wrong time. This extension explores what happens to the next decision after the person responds.

## The Core Loop

The person opens a simulated workday, sees whether a short movement break fits now and why, advances to a suitable window, responds `accept`, `snooze`, or `dismiss`, then sees the next recommended moment and its explanation. Resetting and trying another response shows how the decision changes.

## Inspiration & Identity

Calm, direct and non-judgmental, with `NOT NOW` treated as a useful decision. Visual details belong in the PRD.

## Why This Matters to the Learner

The learner wants to explore whether context and feedback make a movement intervention feel more considerate than a generic timer.

## What "Working" Looks Like

In a short screen recording, the same simulated worker moves through a workday: a meeting makes the app wait; a free window leads to a movement suggestion; `snooze` or `dismiss` changes the next recommendation, with a visible reason. The new loop works end-to-end in WorkPulse's existing application.

## The POC Boundary

The new work covers one fictional workday, a few meeting/focus blocks, one movement suggestion, three response choices, a deterministic next-time decision, and a visible explanation. Existing application features may remain, but are outside this experiment's acceptance criteria. The chosen timing rules are illustrative demo parameters.

## Later

The user additionally approved a movement-powered character extension on 2 October 2026. Its bounded TDPD is `character-game-tdpd.md`: two short scenes with activity-specific progress, explicit manual self-report, pause/resume and replay. The 6 October expansion adds four guided neck movements, six shoulder lift-and-return cycles and six seated/standing dance phrases; see `all-exercises-game.md` and `desk-dance.md`. This is a separate optional `/play` surface; the Timing Lab remains independently demonstrable.

Real calendar integration, personal preferences learned across days, a larger activity catalog, and optional on-device movement verification.

## Explicitly Cut

- Rebuilding the existing application from scratch: the baseline is imported and the new work focuses on feedback timing. The imported baseline will be identified in the submission.
- Camera and pose verification: they do not prove the timing loop.
- Financial penalties: they add trust and payment complexity without testing whether the timing decision is useful.
- Clinical or employer-outcome claims: neither is established by this demo.
