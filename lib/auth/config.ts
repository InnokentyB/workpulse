export type AccountEnvironment = Readonly<Record<string, string | undefined>>;

export type AccountConfiguration = {
  authReady: boolean;
  calendarReady: boolean;
  missing: string[];
};

const AUTH_VARIABLES = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "GOOGLE_CALENDAR_CLIENT_ID",
  "GOOGLE_CALENDAR_CLIENT_SECRET",
] as const;

const CALENDAR_VARIABLES = [
  ...AUTH_VARIABLES,
  "CALENDAR_TOKEN_ENCRYPTION_KEY",
  "GOOGLE_CALENDAR_REDIRECT_URI",
] as const;

function hasValue(environment: AccountEnvironment, variable: string): boolean {
  const value = environment[variable]?.trim();
  if (!value) return false;
  if (variable === "CALENDAR_TOKEN_ENCRYPTION_KEY") {
    try {
      return Buffer.from(value, "base64").length === 32;
    } catch {
      return false;
    }
  }
  return true;
}

export function getAccountConfiguration(
  environment: AccountEnvironment = process.env,
): AccountConfiguration {
  const missing = CALENDAR_VARIABLES.filter(
    (variable) => !hasValue(environment, variable),
  );

  return {
    authReady: AUTH_VARIABLES.every((variable) =>
      hasValue(environment, variable),
    ),
    calendarReady: missing.length === 0,
    missing,
  };
}

export function getGoogleOAuthConfiguration(
  environment: AccountEnvironment = process.env,
) {
  const clientId = environment.GOOGLE_CALENDAR_CLIENT_ID?.trim();
  const clientSecret = environment.GOOGLE_CALENDAR_CLIENT_SECRET?.trim();
  const redirectUri = environment.GOOGLE_CALENDAR_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google Calendar OAuth is not configured.");
  }

  return { clientId, clientSecret, redirectUri };
}
