export type CalendarProviderId =
  | "google"
  | "microsoft"
  | "apple"
  | "caldav";

export type CalendarConnectionKind = "oauth2" | "caldav";

export type CalendarProviderStatus =
  | "configured"
  | "configuration-required"
  | "planned";

export type CalendarProviderCapabilities = {
  availability: boolean;
  eventDetails: boolean;
  incrementalSync: boolean;
  multipleCalendars: boolean;
  webhooks: boolean;
};

export type CalendarProviderDefinition = {
  id: CalendarProviderId;
  name: string;
  description: string;
  connectionKind: CalendarConnectionKind;
  primary: boolean;
  status: CalendarProviderStatus;
  capabilities: CalendarProviderCapabilities;
};

export type CalendarCredential = {
  accessToken: string;
};

export type CalendarReadRequest = {
  credential: CalendarCredential;
  timeMin: string;
  timeMax: string;
  calendarIds?: readonly string[];
};

export type CalendarBusyPeriod = {
  start: string;
  end: string;
  calendarId: string;
};

export type CalendarSnapshot = {
  providerId: CalendarProviderId;
  timeMin: string;
  timeMax: string;
  busy: CalendarBusyPeriod[];
  fetchedAt: string;
};

export interface CalendarProviderAdapter {
  readonly id: CalendarProviderId;
  readAvailability(request: CalendarReadRequest): Promise<CalendarSnapshot>;
}

export class CalendarIntegrationError extends Error {
  readonly code:
    | "invalid-request"
    | "authentication-failed"
    | "provider-unavailable"
    | "invalid-provider-response";

  constructor(
    code: CalendarIntegrationError["code"],
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CalendarIntegrationError";
    this.code = code;
  }
}
