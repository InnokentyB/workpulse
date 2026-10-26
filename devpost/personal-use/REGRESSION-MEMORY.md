# User-visible regressions

##26October2026 — main game stillmanual / no livecharacter

Owner rejected the game: they expected camera motion to control a character
climbing a mountain. The primary Movementgame link still opened legacy /play,
whose default input was Manual self-report. The newer RouteScene had acknowledged
counter positions but a fixedstick body and horizontalground for both goals.
Earlier synthetic count/history PASS did not establish this visible expectation.

Evidence: WorkPulse avatar browser RED (old82542cc) confirms manual default at
/play and no livecameraavatar at/move. LOCK-006 records correction: canonical
camera-game navigation, preserved explicit legacydemo, ephemeral livepose avatar,
ascendingtrail driven by acknowledgements only, and clear lost/off behavior.

Regression invariants: a primary Camera game link must not open manualscoring;
pose visibly changes before an acknowledged count; pending save does not freeze
livepose but cannot award another count; Pause/missingframe clearslivepose;
acknowledgedcount movesuphill. Test bothroute8 andupper4/6. Keep syntheticmodel
boundary tests distinct from ownerphysical-cameraUAT. Never report count/history
GREEN as acceptance of game feel or actualhuman recognition.

Status: correction in progress; ownerdeviceUAT remains pending after engineering
checks. Historical versions/packages retained, no ownerhistory deletion.

## Owner desk-camera UAT reject —26October2026
Neck reset reportedly works. Shoulder lifts did not work; rootcause not directly measured, code requires hips and sensitive head/torso anchors. Full-body Lantern route impractical with owner's desk camera; automated GREEN did not establish ergonomic suitability. LOCK-007 introduces separate upper-only lantern-arms4 target, keeps oldroute8/history semantics, primarycatalogue arms+neck, existing shoulder/fullbody accessible legacy/resume only. Realcamera UAT required again; no blind threshold loosening. Newarms recordformat3 rejects older fallback8 readers; do not downgrade records/restore stale owner data on rollback.

## Shoulder restore requested —26October2026
Owner rejects disappearance of Shoulder lifts. Restoremaincatalogue explicitly requested; fixdeterministic hipdependency in wrapper rather than silentlyhiding an exercise. LOCK-008: seatedhead+shouldersonly, same6liftreturn history, noheadbob/wholebodytranslationfalseaward. Humanacceptancepending.

## Latest real-camera UAT rejection after shoulder/arms changes
Owner reports movements still not recognized reliably and framing requires too much distance for normal desk use. Exact failing exercise/landmark trace not supplied. Do not infer that syntheticGREEN resolves this rejection. Earlier Neck reset reportedly worked; full seated challenge remains unaccepted. Owner subsequently authorizes publicpublication of41ced70 and verified current-run fixes; this is publication permission, not UATacceptance.

## Recalibration loop on lowering hands —26October2026
Owner screenshot armscalibration0/8 repeatedly after lowering. Anyrequiredwrist/elbow occlusion resetfullbaseline; 'arms down' instruction encouraged handsoutsideframe. LOCK009preservescorecalibration, cancelsincompletegesture, requiresvisibleneutralrearm, explicitinframehandreturncue. No unseencompletion/inferredmovement.
