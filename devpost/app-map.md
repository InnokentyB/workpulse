# Current application map — review checkpoint26October2026

Technical reading guide for the owner; this file does not establish human UAT.

| Surface | Data and visible result | Main implementation |
|---|---|---|
|`/move` |Camera practice: calibration→six steps→gate gesture→lantern gesture; no saved workday completion |app/move/page.tsx, StepTouchChallenge, RouteScene, route-motion-tracker |
|`/personal` |Google setup or connected workday; selected calendars, explicit work start, availability decision and acknowledged persistent rounds |PersonalWorkday, lib/personal, /api/personal |
|`/timing-lab` |Fictional schedule, Accept/Snooze/Dismiss and next recommendation |Timing Lab engine and page; independent simulation |
|`/play` |Older neck/shoulder/dance and character demos, including explicitly manual modes |Original activity/session and MovementScene components |

Camera frames and landmarks stay in the browser. MediaPipe identifies pose;
route-motion-tracker applies deterministic stage rules. The current movement
example is guidance, never a progress source. A recognized milestone is displayed
only after onCycle acknowledges it. Practice immediately acknowledges locally;
personal workday uses run ID/lease and monotonic server progress.

Personal tokens, selection and round state live in an encrypted server file
store, with an opaque connection cookie. The eight-milestone completion is
idempotent. New rounds are route-v1; old missing-version rounds keep eight-step
recognition. Real Google consent/access is still not configured or accepted.
The system does not measure how long someone has been sitting: work starts
explicitly. Closed-browser reminders, medical form assessment and multiplayer
ranking are absent.

Owner review can use the same short route/Pause walkthrough as the video;
there is no need to repeat old manual demos to understand the new route. The
owner's final submission/reflection wording remains their own.
