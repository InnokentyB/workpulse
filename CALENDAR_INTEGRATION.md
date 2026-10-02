# Calendar integration architecture

## Product boundary

WorkPulse needs calendar context to answer one narrow question: is there enough
uninterrupted time for a short activity? The first integration therefore reads
availability only. It does not read meeting titles, attendees, descriptions, or
locations, and it cannot create, edit, or delete events.

Google Calendar is the first provider. Microsoft Outlook, Apple Calendar, and
generic CalDAV providers are represented in the same registry so product logic
does not depend on a vendor-specific response.

## Current implementation

- `lib/calendar/types.ts` owns the provider-neutral contract.
- `lib/calendar/providers.ts` is the safe public provider registry.
- `lib/calendar/google.ts` converts Google FreeBusy responses into the shared
  snapshot model.
- `lib/calendar/context.ts` converts busy periods into WorkPulse inputs such as
  `minutesToNextMeeting` and `freeWindowMinutes`.
- `GET /api/calendar/providers` exposes readiness and capabilities, never
  credentials.
- `/calendar` provides a Google connection and free/busy inspector. OAuth
  `state` and PKCE protect the callback. A server-encrypted HttpOnly cookie holds
  a short-lived access token; no refresh token, event details, or database are
  used. The session expires and the user reconnects. Disconnect revokes the
  token when Google responds and clears the local cookie.
- The inspector can combine up to 20 selected calendars for the next eight
  hours, showing whether the current calendar window can fit five minutes.
  The Timing Lab remains a separate fictional replay; calendar availability
  alone does not establish movement need.

The Google adapter uses `calendar.events.freebusy`; listing calendar names for
selection additionally requires `calendar.calendarlist.readonly`. Access tokens
stay in encrypted, server-only cookies and are never returned in API payloads.

## Local Google setup

1. In a Google Cloud project, enable the Google Calendar API and configure
   the OAuth consent screen. For an External app in Testing, add the account
   that will try the demo as a test user.
2. Create an OAuth client of type **Web application**. Add the exact authorized
   redirect URI `http://localhost:3000/api/calendar/google/callback`.
3. Copy `.env.example` to `.env.local`; fill in client ID, client secret,
   redirect URI and a random `CALENDAR_SESSION_SECRET` of at least 32 characters.
   Keep `.env.local` outside Git. Run `npm run dev` and open
   `http://localhost:3000/calendar` on the same computer as the app server.
4. Connect, select calendars, inspect availability, then Disconnect. The
   fixed Timing Lab at `/timing-lab` still works without OAuth.

The `localhost` callback must reach this Next.js server. A cloud workspace's
`localhost` is not the user's Mac; a hosted HTTPS URL needs its own matching
authorized redirect URI and server-side secrets.

## Production connection work still needed

1. Add user identity and a durable encrypted connection store if sessions
   should survive an hour; refresh tokens must remain server-side.
2. Connect the live availability model to a real timing-feedback loop, including
   consent, timezone/day boundaries, and unknown-calendar fallbacks.
3. Add connection diagnostics and production hosting/security review.

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

This slice does not include a user account system, persistent token storage,
background sync, webhooks, event details, or live timing replay. An encrypted
short-lived browser cookie is suitable for local inspection, not a shared
production account system.
