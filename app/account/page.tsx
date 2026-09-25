import type { Metadata } from "next";

import { auth } from "@/auth";
import {
  deleteAccountAction,
  disconnectGoogleCalendarAction,
  signOutAction,
  startGoogleSignIn,
} from "@/app/account/actions";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getAccountConfiguration } from "@/lib/auth/config";
import { getGoogleCalendarConnectionStatus } from "@/lib/calendar/connections";

export const metadata: Metadata = {
  title: "Account — WorkPulse",
  description: "Connect your account and calendar to WorkPulse.",
};

export const dynamic = "force-dynamic";

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const configuration = getAccountConfiguration();
  const session = configuration.authReady ? await auth() : null;
  const connection = session?.user.id
    ? await getGoogleCalendarConnectionStatus(session.user.id)
    : null;
  const params = await searchParams;
  const calendarResult =
    typeof params.calendar === "string" ? params.calendar : null;
  const accountResult =
    typeof params.account === "string" ? params.account : null;

  return (
    <main className="app-shell account-page">
      <SiteHeader current="account" />

      <section className="account-hero">
        <p>Personal prototype</p>
        <h1>Your workday, with your permission.</h1>
        <span>
          Sign in first. Calendar access is a separate choice and can be removed
          at any time.
        </span>
      </section>

      {calendarResult === "connected" && (
        <p className="account-notice" role="status">Google Calendar connected.</p>
      )}
      {calendarResult === "disconnected" && (
        <p className="account-notice" role="status">Calendar access removed.</p>
      )}
      {calendarResult === "failed" && (
        <p className="account-notice account-notice--error" role="alert">
          Calendar connection did not complete. Please try again.
        </p>
      )}
      {accountResult === "confirmation-required" && (
        <p className="account-notice account-notice--error" role="alert">
          Confirm account deletion before continuing.
        </p>
      )}

      {!configuration.authReady ? (
        <section className="account-card">
          <div>
            <p>Account access</p>
            <h2>Sign-in is ready for server setup.</h2>
          </div>
          <p>
            This deployment still needs its private Google and database settings.
            The public demo remains available while they are added.
          </p>
          <span className="account-status">Not configured</span>
        </section>
      ) : !session?.user ? (
        <section className="account-card">
          <div>
            <p>Step 1</p>
            <h2>Sign in with Google</h2>
          </div>
          <p>
            WorkPulse receives your verified name and email. Signing in does not
            grant access to your calendar.
          </p>
          <form action={startGoogleSignIn}>
            <button className="button button--primary" type="submit">
              Continue with Google
            </button>
          </form>
        </section>
      ) : (
        <div className="account-grid">
          <section className="account-card">
            <div>
              <p>Signed in</p>
              <h2>{session.user.name ?? session.user.email}</h2>
            </div>
            <p>{session.user.email}</p>
            <form action={signOutAction}>
              <button className="button account-button" type="submit">Sign out</button>
            </form>
          </section>

          <section className="account-card">
            <div>
              <p>Step 2 · Calendar</p>
              <h2>{connection ? "Google Calendar is connected" : "Connect Google Calendar"}</h2>
            </div>
            <p>
              WorkPulse reads busy and free periods only. It cannot see meeting
              titles, attendees, notes, or change events.
            </p>
            {connection ? (
              <form action={disconnectGoogleCalendarAction}>
                <button className="button account-button" type="submit">
                  Disconnect calendar
                </button>
              </form>
            ) : configuration.calendarReady ? (
              <a className="button button--primary" href="/api/calendar/google/connect">
                Connect calendar
              </a>
            ) : (
              <span className="account-status">Calendar setup incomplete</span>
            )}
          </section>

          <section className="account-card account-card--danger">
            <div>
              <p>Your data</p>
              <h2>Delete account</h2>
            </div>
            <p>
              Removes your WorkPulse profile and stored calendar connection. This
              cannot be undone.
            </p>
            <form action={deleteAccountAction}>
              <label className="account-confirmation">
                <input name="confirm" required type="checkbox" value="delete" />
                <span>I understand that my stored account data will be deleted.</span>
              </label>
              <button className="button account-button account-button--danger" type="submit">
                Delete my account
              </button>
            </form>
          </section>
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
