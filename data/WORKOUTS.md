# Workout settings

WorkPulse loads its activity catalog from `workouts.json` at build time. The
adjacent JSON Schema provides editor completion and catches structural mistakes;
the application validates the same settings when it starts.

To add a timer-guided workout, append an object to `workouts` with:

- a unique `id`;
- user-facing `name` and `instructions`;
- a positive `durationSeconds`;
- `sessionType: "timer"`;
- one or more ordered `steps`;
- `selection.minimumMinutesSinceLastActivity`, which controls when it becomes eligible.

The selector protects `transitionBufferSeconds` before a meeting, filters out
workouts that do not fit or are not yet eligible, and chooses the longest
remaining workout. Keep at least one workout with a minimum of `0` as the
fallback. If even that workout does not fit after the protected buffer,
WorkPulse returns `NOT NOW` instead of overflowing the calendar window.

`camera-neck` is the only camera session currently implemented. Adding another
camera-based workout requires a matching detector and session component; using
`timer` requires no TypeScript changes. Restart or rebuild the app after editing
the JSON file.
