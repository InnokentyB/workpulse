# Workout settings

WorkPulse validates its bundled `workouts.json`, exposes it at `/api/workouts`,
and refreshes that catalog in the browser. The last valid response is cached
locally; if a refresh fails, the app uses that saved copy and then falls back to
the bundled catalog. Increase `version` whenever you publish a catalog change.
The adjacent JSON Schema provides editor completion and documents the format.
Set `WORKPULSE_WORKOUT_CATALOG_URL` to an HTTPS JSON endpoint to make the API
load a remotely managed catalog on every refresh. An invalid or unavailable
remote response is rejected so the browser can use its last valid local copy.

To add a timer-guided workout, append an object to `workouts` with:

- a unique `id`;
- user-facing `name` and `instructions`;
- a positive `durationSeconds`;
- `sessionType: "timer"`;
- one or more ordered `steps`;
- `selection.minimumMinutesSinceLastActivity`, which controls when it becomes eligible.

Optional `guidance` makes a timer workout richer without code changes. It sets
the recommended `position` (`seated`, `standing`, or `either`), a
`safetyWarning`, and timed step objects. Step durations must add up exactly to
the workout duration. A step may include a visual with `kind` (`image` or
`animation`), a local or HTTPS `src`, and meaningful `alt` text.

The selector protects `transitionBufferSeconds` before a meeting, filters out
workouts that do not fit or are not yet eligible, and chooses the longest
remaining workout. Keep at least one workout with a minimum of `0` as the
fallback. If even that workout does not fit after the protected buffer,
WorkPulse returns `NOT NOW` instead of overflowing the calendar window.
Exercises completed during `repeatCooldownMinutes` are excluded so the same
workout is not immediately recommended again.

`camera-neck` is the only camera session currently implemented. Adding another
camera-based workout requires a matching detector and session component; using
`timer` requires no TypeScript changes. The API response is revalidated on page
load, so a deployed catalog can change independently of the UI bundle.
