import { GOOGLE_CALENDAR_FREEBUSY_SCOPE } from "@/lib/calendar/google";
import { CalendarIntegrationError } from "@/lib/calendar/types";

export type GoogleOAuthConfiguration = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type GoogleCalendarTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scope: string;
};

type GoogleTokenPayload = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  scope?: unknown;
};

export function buildGoogleCalendarAuthorizationUrl(
  configuration: GoogleOAuthConfiguration,
  state: string,
): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    access_type: "offline",
    client_id: configuration.clientId,
    include_granted_scopes: "true",
    prompt: "consent",
    redirect_uri: configuration.redirectUri,
    response_type: "code",
    scope: GOOGLE_CALENDAR_FREEBUSY_SCOPE,
    state,
  }).toString();
  return url.toString();
}

export async function exchangeGoogleCalendarCode(
  configuration: GoogleOAuthConfiguration,
  code: string,
  fetchImplementation: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<GoogleCalendarTokens> {
  let response: Response;
  try {
    response = await fetchImplementation("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: configuration.clientId,
        client_secret: configuration.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: configuration.redirectUri,
      }),
    });
  } catch (error) {
    throw new CalendarIntegrationError(
      "provider-unavailable",
      "Google authorization is temporarily unavailable.",
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new CalendarIntegrationError(
      response.status === 400 || response.status === 401
        ? "authentication-failed"
        : "provider-unavailable",
      "Google Calendar authorization could not be completed.",
    );
  }

  let payload: GoogleTokenPayload;
  try {
    payload = (await response.json()) as GoogleTokenPayload;
  } catch (error) {
    throw new CalendarIntegrationError(
      "invalid-provider-response",
      "Google returned an invalid authorization response.",
      { cause: error },
    );
  }

  if (
    typeof payload.access_token !== "string" ||
    typeof payload.refresh_token !== "string" ||
    typeof payload.expires_in !== "number" ||
    !Number.isFinite(payload.expires_in) ||
    payload.expires_in <= 0
  ) {
    throw new CalendarIntegrationError(
      "invalid-provider-response",
      "Google returned an incomplete authorization response.",
    );
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: new Date(now().getTime() + payload.expires_in * 1000).toISOString(),
    scope: typeof payload.scope === "string" ? payload.scope : "",
  };
}
