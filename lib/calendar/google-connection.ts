import {
  GoogleOAuthError,
  refreshGoogleAccessToken,
  type GoogleOAuthConfig,
} from "@/lib/calendar/google-oauth";
import type { GoogleCalendarSession } from "@/lib/calendar/google-session";

const REFRESH_EARLY_MS = 60_000;

export async function ensureFreshGoogleSession(
  session: GoogleCalendarSession,
  config: GoogleOAuthConfig,
  fetchImplementation: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<{ session: GoogleCalendarSession; refreshed: boolean }> {
  if (session.expiresAt > now().getTime() + REFRESH_EARLY_MS) {
    return { session, refreshed: false };
  }

  if (!session.refreshToken) {
    throw new GoogleOAuthError(
      "authentication-failed",
      "Google Calendar authorization has expired.",
    );
  }

  const refreshedTokens = await refreshGoogleAccessToken(
    config,
    session.refreshToken,
    fetchImplementation,
    now,
  );
  return {
    refreshed: true,
    session: {
      ...session,
      ...refreshedTokens,
      refreshToken: session.refreshToken,
    },
  };
}
