# LOCK-006 — camera-following mountain game,26October2026

Owner UAT reject: game should follow their camera movements and the character
should climb the mountain. Findings: /play still mounts legacy default manual
MovementGame; RouteScene shows a fixedstick on horizontalcountermilestones.
Owner authorizes correcting both within existing camera/privacy architecture.

## User boundary / rules

Main Camera game link and /play open the canonical My day camera exercise,
default Lanternroute/trail; no manual mode or self-report scoring in that path.
Existing specificneck/shoulder exercise links retain correctcatalogue mapping;
legacyguideddesk-dance stays explicitlydemo, not renamedas camera tracking.
Preserve legacygame at /demo/game with visible manual/unverifieddemo label.

On enabledcamera, the avatar follows current visible head/torso/arm/leg geometry
at the existing inference cadence, including partial actions without scoring.
Confirmed acknowledgements alone move the avatar upward along the trail and
unlock gate/lantern milestones. Route keeps sixwalkingcycles+twoarmgestures;
neck/shoulder keep4/6 existing rules. Upperbody sessions also show climbing
progress while only visiblejoints drive the avatar. Never substitute sample
animation for livecamera feedback. Workshop remains a separatelevelscene.

## Architecture / QAR / risk

Ephemeral on-device pose projection into SVG, no newML model/dependency/server
fields/scopes/video storage/upload. Currentframe only, no posehistory retained.
Missing required frame, hidden tab, Pause/error/unmount/finish clearsliveavatar
and accuratelylabels lost/off state. A safe neutral/off placeholder is not labelled
as live. Keep model/overlay/poseupdate duringpendingACK but freeze score/tracker;
existing startup30sec/save8sec guards, generationcancellation andcamera cleanup
remain. Singlevisibleperson, finitevisiblejointchecks, boundedmapping andscale;
partialupperbody can omit unknownlimbs ratherthaninvent motion. Crispascending
trail withavatarwithinviewBox; responsive320/390/768/1440 and reducedmotion.
Animation between savedpositions never awardsprogress or bypasses gate.

Scenarios G01 oldgame no longermainmanualpath; G02 liveposemoveslimbsbeforecount;
G03 incomplete/heldpose no savedmovement; G04 confirmedsteps decreasehillY;
G05 routegate/lantern andupper4/6 remaincorrect; G06 missingframe/Pause/hide clears
livepose with cameraoff/lost text; G07 pendingACKposeupdates but countstayssaved;
G08 no falsemanual/historychanges, no servermodelchanges; G09 mobile/desktop
readability. RED→GREEN plusindependentreview and ownerrealcameraUAT required.
A syntheticpose test proveslifecycle/projection only, not actualhumanrecognition.
Existing encryptedstate/format2 unchanged; prior82542cc compatiblebuild backedup
beforecutover, syntheticfixture isolated. No publishing/Submit/outreach inferred.
