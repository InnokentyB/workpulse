# LOCK-003 — movement route, 25 October 2026

Owner approved: «Да, давай сделаем такой маршрут: шагами идём, руки в стороны — открываем ворота, руки вверх — зажигаем фонарь. И чтобы на экране было понятно, какое движение сейчас делать.»

Problem: user cannot infer what movement controls the character, and identical side steps do not feel like a purposeful route. Outcome: visible current action, distinct character response to walking/gate/lantern, camera-only progression.

Scope/surface: existing /move and /personal React challenge; preserve two scene themes and full-body camera/no upload/no microphone. First six alternating full side-out/return cycles walk toward gate; arms sideways held stably then lowered open gate (7); arms overhead held stably then lowered light lantern (8). Each stage shows prominent instruction, current animated example and visible route status. Count remains eight acknowledged milestones for existing API/idempotency/cooldown. Sample animation never scores.

ARCH: reuse bounded MediaPipe detector and camera lifecycle; deterministic route tracker composes existing foot tracker and new arm-hold/neutral recognition. No new dependencies/provider/secrets/storage boundary. New personal runs tagged route-v1; old unversioned saved runs/history remain legacy eight-step behavior, avoiding reinterpretation. No owner data migration/deletion. Existing encrypted store/leases and fresh calendar checks unchanged.

QAR: visible cue and stage list at320/390/768/1440; keyboard buttons and live text/reduced motion. Full body + required arm joints finite/visible; arms held ≥600ms, then neutral return before recognition. Lost framing/stalled samples reset incomplete action while preserving acknowledged count. No gate/lantern before its stage. Pause/hide/error/finish stops capture and ignores late callbacks. Existing30sec startup/8sec save deadlines remain. No manual counts/automatic success. Do not assert medical form quality.

RISK: reversible private UI change, no paid/live Google actions. Body recognition/threshold comfort is device UAT, not proved by synthetic landmarks. Old data interpretation protected by optional route version. Keep previous artifact snapshot/compose rollback before rebuild and don't touch original pilot. Synthetic E2E uses independent volume/build and never owner store.

Authority: user approved concrete route and current UI/camera boundary. Implementation details six walking cycles+two arm cycles preserve existing eight milestones; no new material architectural boundary requires renewed permission. Engineering green requires RED/GREEN, focused review, lint/build and bounded sandboxed browser round; owner UAT remains pending until feedback.

Scenario matrix: R01 six alternating steps advance walk only; R02 sideways hold+lower opens gate once; R03 overhead hold+lower lights lantern once; R04 arms early/wrong/incomplete/invisible do not advance; R05 pose held/no neutral never double counts; R06 pause/resume at6/7, stale/hidden callbacks no progress; R07 new route saved/reloaded/versioned while old rounds retain behavior; R08 desktop/mobile current cue, stage example, goal visible; R09 camera deny/model failure preserves existing recovery.
