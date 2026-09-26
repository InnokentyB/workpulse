# WorkPulse public beta release runbook

This runbook covers preview verification, production release, smoke testing, and
rollback for the desktop-first public beta. It is intentionally
provider-neutral: use the equivalent deployment controls on the selected host.

## Environment variables

Copy `.env.example` to `.env.local` for local development. Never commit real
values. Deployment secrets belong in the hosting provider's encrypted secret
store, with separate values for preview and production.

| Variable | Required now | Runtime | Purpose |
| --- | --- | --- | --- |
| `GOOGLE_CALENDAR_CLIENT_ID` | No | Server only | OAuth client identifier for the future live Google Calendar connection. |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | No | Server only | OAuth secret. Never expose it through a `NEXT_PUBLIC_` variable or logs. |
| `GOOGLE_CALENDAR_REDIRECT_URI` | No | Server only | Exact callback URI registered with Google. Use the production HTTPS origin when OAuth ships. |
| `CALENDAR_SESSION_SECRET` | No | Server only | Encrypts account-free calendar connection cookies. At least 32 characters; keep stable across deploys. |
| `APP_BASE_URL` | Yes for smoke test | Release command only | URL checked by `npm run smoke`; the application itself does not read it. |

The app does not require secrets when the optional Google Calendar connection is
disabled. Google is considered configured only when all four calendar values
above are valid. Do not add placeholder production credentials merely to make a
deployment look configured.

## Before merging a release

- [ ] The pull request CI is green: lint, tests, production dependency audit,
      and production build.
- [ ] The change set contains no `.env` files, credentials, calendar payloads,
      captured video, or screenshots with personal data.
- [ ] Product scope and known limitations match the public copy.
- [ ] Camera remains opt-in and every camera activity can finish without it.
- [ ] Preview uses HTTPS and opens without registration, calendar, or camera.
- [ ] If Google Calendar is enabled, the OAuth client uses the exact preview or
      production callback URI and only the FreeBusy scope.
- [ ] Connect, token refresh, availability, and disconnect have been checked;
      application logs contain no tokens or calendar payloads.
- [ ] A maintainer records the current production deployment identifier and Git
      commit as the rollback target.

## Preview smoke check

Run the automated read-only check against the deployed preview:

```bash
APP_BASE_URL=https://preview.example.com npm run smoke
```

Then check manually in a clean browser profile:

- [ ] `/`, `/privacy`, `/terms`, `/roadmap`, and `/for-teams` load without
      console CSP errors.
- [ ] The main flow works with local storage empty.
- [ ] `Not now` suppresses another prompt during the cooldown.
- [ ] A screen-guided activity completes and appears in local history.
- [ ] Declining camera access leaves “Finish without camera” available.
- [ ] Granting camera access shows a live preview and pose guidance.
- [ ] Stopping or completing an activity turns off the browser camera indicator.
- [ ] Reloading preserves expected settings/history but never camera state.
- [ ] Keyboard focus is visible and the flow is operable without a pointer.
- [ ] Chrome, Safari, Edge, and Firefox receive an explicit pass/fail note.

Do not release when the camera continues after leaving the activity, a primary
flow breaks without permission, sensitive data appears in logs, or a relevant CI
check fails.

## Production release

1. Merge the reviewed release commit into `main`.
2. Deploy that exact commit to production; do not deploy an unreviewed working
   tree.
3. Confirm the production domain has a valid TLS certificate and redirects HTTP
   to HTTPS.
4. Run `APP_BASE_URL=https://<production-domain> npm run smoke`.
5. Repeat the main path, camera-denied path, and one camera-enabled activity in a
   clean browser profile.
6. Confirm the response contains CSP, Permissions-Policy, Referrer-Policy,
   X-Content-Type-Options, X-Frame-Options, and HSTS headers.
7. Record the deployment URL, commit, time, verifier, browser results, and any
   accepted limitation in the release notes.

The CSP intentionally allows MediaPipe WebAssembly from `cdn.jsdelivr.net` and
the pose model from `storage.googleapis.com`. `wasm-unsafe-eval` is required for
the current on-device model runtime. Inline styles and Next.js bootstrap scripts
currently require `unsafe-inline`. Treat any new CSP origin as a security review,
not a routine deployment tweak.

## Rollback

Rollback is preferred over a live production patch when the main flow, privacy
boundary, or camera lifecycle is broken.

1. In the hosting dashboard, promote or redeploy the previously recorded stable
   deployment. If the provider cannot promote builds, deploy the previous stable
   Git commit through the normal pipeline.
2. Do not rewrite Git history or delete the failed deployment; keep it for
   diagnosis.
3. Run the production smoke command and the manual camera-off check against the
   restored deployment.
4. Confirm the public URL points to the stable commit, then record the rollback
   time and reason.
5. Fix forward on a branch and repeat preview verification before another
   production release.

WorkPulse currently stores user state locally in the browser. A deployment
rollback does not erase or migrate that state. Any future local-storage schema
change must remain backward compatible or include an explicit migration and
rollback test.
