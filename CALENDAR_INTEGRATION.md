# Calendar integration architecture

## Product boundary

WorkPulse needs calendar context to answer one narrow question: is there enough
uninterrupted time for a short activity? The first integration therefore reads
availability only. It does not read meeting titles, attendees, descriptions, or
locations, and it cannot create, edit, or delete events.

Google Calendar is the first provider. Microsoft Outlook, Apple Calendar, and
generic CalDAV providers are represented in the same registry so product logic
does not depend on a vendor-specific response.

## Current infrastructure slice

- `lib/calendar/types.ts` owns the provider-neutral contract.
- `lib/calendar/providers.ts` is the safe public provider registry.
- `lib/calendar/google.ts` converts Google FreeBusy responses into the shared
  snapshot model.
- `lib/calendar/context.ts` converts busy periods into WorkPulse inputs such as
  `minutesToNextMeeting` and `freeWindowMinutes`.
- `GET /api/calendar/providers` exposes readiness and capabilities, never
  credentials.
- `GET /api/calendar/google/connect` starts a state-bound PKCE redirect flow.
- `GET /api/calendar/google/callback` exchanges the code on the server and stores
  an encrypted, HttpOnly connection session.
- `GET /api/calendar/google/status` returns safe connection health and refreshes
  an expiring access token.
- `GET /api/calendar/google/availability` reads a caller-supplied window of at
  most seven days through the FreeBusy adapter.
- `POST /api/calendar/google/disconnect` verifies same-origin intent, asks Google
  to revoke the credential, and always deletes the local connection session.

The Google adapter uses only the narrow `calendar.events.freebusy` OAuth scope.
Access and refresh tokens are never returned to browser JavaScript, local
storage, application responses, or logs. For this account-free beta they live
inside an AES-GCM encrypted, `HttpOnly`, `SameSite=Lax` cookie which only server
route handlers can decrypt. The cookie is `Secure` in production and expires
after 30 days. Its path is limited to `/api/calendar/google`, so it is not sent
to pages or unrelated endpoints. Rotating `CALENDAR_SESSION_SECRET` disconnects
existing sessions.

## Connection flow

1. The connect endpoint creates high-entropy OAuth state and a PKCE verifier.
2. The callback validates the encrypted state cookie and its ten-minute lifetime.
3. The authorization code is exchanged only on the server.
4. The encrypted connection cookie is issued; neither token is client-readable.
5. Status and availability refresh access tokens shortly before expiry.
6. Disconnect attempts provider revocation and deletes the cookie even when
   Google is temporarily unreachable.
7. The UI can use safe status and bounded availability responses. Manual mode
   remains independent of every calendar endpoint.

OAuth deliberately uses a full-page redirect rather than a popup. This keeps the
flow compatible with the production `Cross-Origin-Opener-Policy: same-origin`
header and avoids popup-blocker behavior.

When accounts or multi-device sync are introduced, replace the encrypted-cookie
session with a durable connection store keyed by an opaque session/user ID. That
store should own `userId`, `providerId`, encrypted credentials, granted scopes,
provider account identifier, connection timestamps, and last sync status.
Provider adapters must not own persistence.

## Required environment

All four values must be present and valid before Google is reported as
configured. If any are absent, endpoints return `configuration-required` and the
manual product flow continues normally.

| Variable | Requirement |
| --- | --- |
| `GOOGLE_CALENDAR_CLIENT_ID` | OAuth web client ID from Google Cloud. |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Server-only OAuth secret. |
| `GOOGLE_CALENDAR_REDIRECT_URI` | Exact registered callback; HTTPS except localhost development. |
| `CALENDAR_SESSION_SECRET` | Stable secret of at least 32 characters; generate with `openssl rand -base64 32`. |

Before enabling the connection publicly:

1. Enable Google Calendar API in the production Google Cloud project.
2. Configure the OAuth consent screen and declare only
   `https://www.googleapis.com/auth/calendar.events.freebusy`.
3. While the app is in testing mode, add every intended tester explicitly.
4. Create a Web application OAuth client and register the exact production
   callback URI, including scheme and path.
5. Store the four values above in the deployment secret store, redeploy, and
   verify that `/api/calendar/providers` reports Google as `configured`.
6. Complete connect, status, FreeBusy, refresh, and disconnect checks in a clean
   browser profile before exposing the connection control.

## Provider strategy

| Provider | Connection | MVP data path | Notes |
| --- | --- | --- | --- |
| Google Calendar | OAuth 2.0 | FreeBusy API | Primary implementation; minimal availability scope. |
| Microsoft Outlook | OAuth 2.0 | Microsoft Graph schedule/calendar APIs | Use availability or basic-read permission according to account type. |
| Apple Calendar | CalDAV | Server-side CalDAV reader | A browser cannot use native EventKit; iCloud credentials need a separate, carefully explained connection flow. |
| Other providers | CalDAV | Server-side CalDAV reader | Covers compatible services such as Fastmail and Nextcloud. |

Apple and generic CalDAV must share protocol code but remain separate provider
entries so setup copy, credentials, and support diagnostics can differ.

## Failure and privacy behavior

- Missing configuration is reported as `configuration-required`; it is not
  presented as a broken user connection.
- Expired or revoked authorization becomes `authentication-failed` and should
  offer reconnection.
- Provider outages become `provider-unavailable`; WorkPulse falls back to an
  explicit unknown-calendar state, never invented availability.
- Invalid provider payloads are rejected before reaching decision logic.
- No provider response body or token should be written to application logs.
- Calendar disconnect must revoke provider access when possible and remove the
  stored connection.

## Not implemented yet

This slice does not include a user account system, multi-device persistence,
background sync, webhooks, event details, or a live calendar settings UI. The
Google OAuth consent screen, production credentials, verified domain, redirect
URI, and privacy review must be completed before enabling the public connection
button.
