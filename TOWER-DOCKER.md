# WorkPulse on Tower — container-only execution

Use Docker on Linux amd64 for every install, build, test and application run.
Run the following from this repository's root. The Compose project is
`workpulse-build-ai`; image `workpulse-build-ai:local`; default loopback port13002.
It does not target the original WorkPulse pilot on port3000 or the private
owner-review preview on port13001.

- Build (locked install, tests, lint and production compilation): `docker compose build web`
- Test: `docker compose --profile tools run --rm checks npm test -- --maxWorkers=2`
- Lint: `docker compose --profile tools run --rm checks npm run lint`
- One-off build: `docker compose --profile tools run --rm checks npm run build`
- Start: `docker compose up -d --no-build --wait web`
- Status / health: `docker compose ps`
- Logs: `docker compose logs --tail=50 web`
- Stop: `docker compose stop web`

The reviewed Dockerfile builds the app as a non-root user. Runtime has resource
limits, read-only filesystem, bounded logs and no source/environment/credential
mount. Keep port binding on127.0.0.1 and use SSH forwarding for remote access.
No database is required. Never use down -v or pruning for routine cleanup.

The private owner-review preview is operated through the separate prepared
submission evidence Compose, not this source-root stack. Its current reviewed
commands, exact revision and rollback are in the owner's submission pack RUN.txt.
Do not overwrite a running release or reuse its image tag as a build shortcut.
Before any deliberate cutover, retain its previous verified image/Compose and
backups. The current preview has not cut over the original pilot.
