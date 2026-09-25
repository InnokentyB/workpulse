# Components

`WorkPulseApp` owns the MVP interaction state and composes the two-scenario
selector, work context, decision, and one activity session. Domain decisions
stay isolated in `lib/`.

The core interaction paths are covered in `WorkPulseApp.test.tsx`.
`NeckMovementGuide` provides the four-step preview and the current visual cue
shown over the live camera feed.
