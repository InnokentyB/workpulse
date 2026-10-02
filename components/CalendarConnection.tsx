"use client";

import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

type Calendar = { id: string; name: string; primary: boolean };
type Availability = { timeMin: string; timeMax: string;
  busy: Array<{ start: string; end: string; calendarId: string }>;
  context: { isBusy: boolean; minutesToNextMeeting: number | null; currentBusyEnd: string | null } };

export function CalendarConnection() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [connected, setConnected] = useState(false);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [error, setError] = useState("");
  const [oauthError, setOauthError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const session = await fetch("/api/calendar/google/session", { cache: "no-store" });
        const state = await session.json() as { configured: boolean; connected: boolean };
        if (!active) return;
        setOauthError(new URLSearchParams(window.location.search).get("error") ?? "");
        setConfigured(state.configured); setConnected(state.connected);
        if (state.connected) {
          const list = await fetch("/api/calendar/google/calendars", { cache: "no-store" });
          const body = await list.json() as { calendars?: Calendar[]; error?: string };
          if (!active) return;
          if (!list.ok) { setError(body.error ?? "Could not read calendars."); return; }
          setCalendars(body.calendars ?? []);
          const primary = body.calendars?.find((calendar) => calendar.primary);
          setSelected(primary ? [primary.id] : body.calendars?.[0] ? [body.calendars[0].id] : []);
        }
      } catch { if (active) setError("Could not check calendar connection."); }
    })();
    return () => { active = false; };
  }, []);

  async function checkAvailability() {
    setLoading(true); setError(""); setAvailability(null);
    try {
      const query = new URLSearchParams();
      selected.forEach((id) => query.append("calendarId", id));
      const response = await fetch(`/api/calendar/google/availability?${query}`, { cache: "no-store" });
      const body = await response.json() as Availability & { error?: string };
      if (!response.ok) { setError(body.error ?? "Could not read availability."); return; }
      setAvailability(body);
    } catch { setError("Could not read availability."); }
    finally { setLoading(false); }
  }

  async function disconnect() {
    setLoading(true);
    try {
      const response = await fetch("/api/calendar/google/disconnect", { method: "POST",
        headers: { "Content-Type": "application/json" } });
      if (!response.ok) throw new Error();
      setConnected(false); setCalendars([]); setSelected([]); setAvailability(null); setError("");
    } catch { setError("Could not disconnect. Try again."); }
    finally { setLoading(false); }
  }

  return <main className="app-shell calendar-page">
    <SiteHeader current="calendar" />
    <header className="timing-lab__intro">
      <p className="timing-lab__eyebrow">WorkPulse / Calendar</p>
      <h1>Find a free moment in your day.</h1>
      <p>Connect Google Calendar to inspect free/busy time. WorkPulse reads no meeting titles, people, or descriptions.</p>
    </header>
    <section className="calendar-card" aria-label="Google Calendar connection">
      {configured === null && <p>Checking configuration…</p>}
      {configured === false && <p>Google Calendar needs local OAuth configuration. See <code>.env.example</code> and <code>CALENDAR_INTEGRATION.md</code>.</p>}
      {oauthError && <p role="alert">Google connection was not completed ({oauthError}). Try connecting again.</p>}
      {configured && !connected && <a className="button button--primary" href="/api/calendar/google/start">Connect Google Calendar</a>}
      {configured && connected && <>
        <div className="calendar-card__head"><h2>Connected calendars</h2><button type="button" className="button button--quiet" onClick={disconnect} disabled={loading}>Disconnect</button></div>
        <p>Choose up to 20 calendars. Only busy intervals for the next 8 hours are requested.</p>
        {calendars.length === 0 ? <p>No readable calendars found.</p> :
          <fieldset className="calendar-choices"><legend>Include in availability</legend>
            {calendars.map((calendar) => <label key={calendar.id}><input type="checkbox" checked={selected.includes(calendar.id)}
              onChange={() => setSelected((current) => current.includes(calendar.id) ? current.filter((id) => id !== calendar.id) : current.length < 20 ? [...current, calendar.id] : current)} />
              {calendar.name}{calendar.primary ? " (primary)" : ""}</label>)}
          </fieldset>}
        <button type="button" className="button button--primary" disabled={loading || selected.length === 0} onClick={checkAvailability}>
          {loading ? "Checking…" : "Check next 8 hours"}</button>
      </>}
      {error && <p role="alert">{error}</p>}
      {availability && <section aria-live="polite" className="calendar-result">
        <h2>{availability.context.isBusy ? "Busy now" : "Free now"}</h2>
        <p><strong>{availability.context.isBusy || (availability.context.minutesToNextMeeting !== null && availability.context.minutesToNextMeeting < 5) ? "WAIT" : "A five-minute window is available"}</strong> — calendar context only; movement need is not inferred from meetings.</p>
        <p>{availability.context.isBusy ?
          `Current busy period ends ${new Date(availability.context.currentBusyEnd!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.` :
          availability.context.minutesToNextMeeting === null ? "No busy interval in the next 8 hours." :
          `${availability.context.minutesToNextMeeting} minutes until the next busy interval.`}</p>
        <p>{availability.busy.length} busy interval{availability.busy.length === 1 ? "" : "s"} returned across selected calendars. Overlaps count once for the current decision.</p>
        <ul>{availability.busy.map((period, index) => <li key={`${period.calendarId}-${period.start}-${index}`}>
          {new Date(period.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{new Date(period.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </li>)}</ul>
      </section>}
    </section>
    <p className="timing-lab__footnote">This local demo keeps an encrypted, short-lived access token in an HttpOnly cookie. It does not retain a refresh token; reconnect when the session expires.</p>
    <SiteFooter />
  </main>;
}
