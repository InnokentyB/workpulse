# Approved personal-use test/acceptance matrix

Baseline a68a562; owner scope confirmation25October2026 in LOCK-002.md.
Test infrastructure: existing Vitest/jsdom and sandboxed Chromium in Tower Docker.
RED evidence: missing API/module, absent UI route404, eight-step scene missing; logs in owning outputs/workpulse-personal-2026-10-25. Infrastructure errors are recorded separately, not treated as feature RED.

| ID | Initial state / action | Observable pass condition | Level |
|---|---|---|---|
| P01 | No Google credentials; open /personal | Setup clearly unavailable, no live free-time claim; camera practice independently reachable | Browser |
| P02 | Connected calendars, start work session |45min due starts explicitly, not derived sitting history | UI/API |
| P03 | Selected calendars busy/partial failure/stale | No challenge start; unknown or WAIT, no manufactured free interval | API/browser |
| P04 | Due+fresh5min window, start a goal | One run issued; lease private response; second simultaneous run rejected | API/browser |
| P05 | Neutral/full-body then alternating side-out/return | Each complete pattern gives one acknowledged scene milestone;8steps reaches chosen goal | Tracker/component/browser-fixture |
| P06 | Stationary/arms-only/partial/wrong-side/lostbody/stalled frames | No step/completion; tracking guidance and recalibration | Tracker/component |
| P07 | Camera denied/model failure/pendingpermission timeout | Camera stopped/retry/stop available; no manual score or fake success | Component/browser |
| P08 | Pose advances but storage response lost | Same pending count/lease retried; history/cooldown never duplicated | API/component/browser-fixture |
| P09 | Pause/tab hide/unmount and latecallbacks | Tracks stopped, no late progress; resume recalibrates kept acknowledged count | Component/browser |
| P10 | Reload active run/competing tab resumes | Explicit resume rotates lease; stalelease can't advance; count survives | API/browser-fixture |
| P11 | Google access expiry/revocation/reconnect | Refresh server-side; no token in response; oldconnection removal serialized; failures reconnect/unknown | API |
| P12 | Owner disconnect, provider revoke down | Local data removed and cookie cleared; warning truthful; no resurrection | API |
| P13 | Missing/corrupt/readonly store, invalidJSON/origin/count | Safe failure; no acknowledged completion, no secrets | API/browser |
| P14 |320/390/768/1440 widths, keyboard, reducedmotion | Navigation/actions accessible; no horizontal overflow; understandable static sample alternative | Browser/UAT |
| P15 | Real MediaPipeWASM/model with synthetic camera no body | Runtime/model initialize withoutrecognition crash;0steps; not a pose-quality claim | Browser/provider-path smoke |
| P16 | OwnerGoogleconsent selectsactual calendars | Expected busy/freetimes; switchselection,expiryreconnect anddisconnect work | Manual live UAT |
| P17 | Ownerfull-body camera,8physical side-out/return steps | Sample comprehensible,framing practical,goalresponds,LEDoffafterstop | Manual real-camera UAT |

Named deterministic adapters:
- API: isolated __fixture bootstrap with synthetic calendars and separate test-only encryptedstore. Live config and owner volume cannot coexist with test mode.
- Camera browser-fixture: injected React detectorFactory only in separate fixture snapshot/page; synthetic browsercamera+known pose stream pass through real tracker/component/API. Production routes never pass this dependency. Not real MLaccuracy evidence.

Quality gates: exact source revision, focused and full checks, independent review, truthful provider-path/device limits. Engineering green is not owner acceptance or competition eligibility.
