import type {
  CalendarProviderDefinition,
  CalendarProviderStatus,
} from "@/lib/calendar/types";
import { getGoogleOAuthConfiguration } from "@/lib/calendar/google-oauth";

type CalendarProviderEnvironment = Readonly<Record<string, string | undefined>>;

function googleStatus(
  environment: CalendarProviderEnvironment,
): CalendarProviderStatus {
  return getGoogleOAuthConfiguration(environment).configured
    ? "configured"
    : "configuration-required";
}

export function getCalendarProviders(
  environment: CalendarProviderEnvironment = process.env,
): CalendarProviderDefinition[] {
  return [
    {
      id: "google",
      name: "Google Calendar",
      description: "Free/busy context from Google Workspace and Gmail calendars.",
      connectionKind: "oauth2",
      primary: true,
      status: googleStatus(environment),
      capabilities: {
        availability: true,
        eventDetails: false,
        incrementalSync: false,
        multipleCalendars: true,
        webhooks: false,
      },
    },
    {
      id: "microsoft",
      name: "Microsoft Outlook",
      description: "Planned adapter for Microsoft 365 and Outlook calendars.",
      connectionKind: "oauth2",
      primary: false,
      status: "planned",
      capabilities: {
        availability: true,
        eventDetails: false,
        incrementalSync: false,
        multipleCalendars: true,
        webhooks: false,
      },
    },
    {
      id: "apple",
      name: "Apple Calendar",
      description: "Planned iCloud calendar connection through CalDAV.",
      connectionKind: "caldav",
      primary: false,
      status: "planned",
      capabilities: {
        availability: true,
        eventDetails: false,
        incrementalSync: false,
        multipleCalendars: true,
        webhooks: false,
      },
    },
    {
      id: "caldav",
      name: "Other CalDAV calendar",
      description: "Future path for Fastmail, Nextcloud, and compatible services.",
      connectionKind: "caldav",
      primary: false,
      status: "planned",
      capabilities: {
        availability: true,
        eventDetails: false,
        incrementalSync: false,
        multipleCalendars: true,
        webhooks: false,
      },
    },
  ];
}
