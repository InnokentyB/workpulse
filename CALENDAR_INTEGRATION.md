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

The Google adapter uses the narrow
`calendar.events.freebusy` OAuth scope. Access tokens enter the adapter for one
request and are not logged or returned.

## Connection flow to implement next

1. Create OAuth endpoints for Google authorization, callback, and revocation.
2. Validate OAuth state and use PKCE where supported.
3. Exchange the authorization code only on the server.
4. Encrypt refresh tokens at rest in a server-side connection store.
5. Keep short-lived access tokens out of browser storage.
6. Add a settings screen that shows connection health and allows revocation.
7. Fetch a bounded availability window and pass the normalized context to the
   decision engine.

The connection store should own `userId`, `providerId`, encrypted credentials,
granted scopes, provider account identifier, connection timestamps, and last
sync status. Provider adapters must not own persistence.

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

This slice does not include a user account system, encrypted token storage,
OAuth callback endpoints, background sync, webhooks, event details, or a live
calendar settings UI. Those require deployment credentials and a persistent
server-side identity/connection store.
