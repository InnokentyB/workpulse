import type { Metadata } from "next";
import Link from "next/link";

import { LocalDataControls } from "@/components/LocalDataControls";
import { SiteFooter } from "@/components/SiteChrome";
import { TrustPageHeader } from "@/components/TrustPageHeader";

export const metadata: Metadata = {
  title: "Privacy — WorkPulse",
  description:
    "What WorkPulse reads, what stays in your browser, and how to delete it.",
};

const dataFacts = [
  {
    title: "Activity and preferences",
    detail:
      "Completed activities, dismissals, onboarding answers, and exercise preferences stay in this browser’s local storage. There is no WorkPulse account or cross-device sync in this beta.",
  },
  {
    title: "Camera",
    detail:
      "The camera is off by default. If you enable it inside a supported exercise, frames are processed in your browser to count movement. WorkPulse does not record, save, or upload your video or pose landmarks, and it never asks for microphone access.",
  },
  {
    title: "Calendar",
    detail:
      "The current product UI uses a manual work session, and calendar context shown in Demo mode is sample data. Google Calendar connection infrastructure is prepared but remains disabled until production consent credentials and connection controls are ready. When enabled, it will be optional and limited to free/busy availability.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="app-shell trust-page">
      <TrustPageHeader current="privacy" />

      <header className="trust-intro">
        <h1>Your movement data stays close to you.</h1>
        <div>
          <p>
            WorkPulse is built to make small workday suggestions without creating
            a record of your body, your room, or your calendar.
          </p>
          <span>Current beta privacy notice · 26 September 2026</span>
        </div>
      </header>

      <section className="trust-facts" aria-label="How WorkPulse handles data">
        {dataFacts.map((fact) => (
          <article key={fact.title}>
            <h2>{fact.title}</h2>
            <p>{fact.detail}</p>
          </article>
        ))}
      </section>

      <section className="trust-copy" aria-labelledby="camera-boundary-heading">
        <div>
          <h2 id="camera-boundary-heading">What happens when you enable the camera</h2>
        </div>
        <div>
          <p>
            Your browser asks for camera permission only after you choose a
            camera-assisted exercise and select <strong>Enable camera</strong>. A
            live preview makes the active state visible. The camera stream stops
            when you finish, stop the camera, leave the exercise, or close the
            page.
          </p>
          <p>
            To run pose detection, the camera feature downloads processing code
            from jsDelivr and a pose model hosted by Google. Those requests do not
            include camera images. Detection then runs on your device. You can
            always finish supported exercises without the camera.
          </p>
        </div>
      </section>

      <section className="trust-copy" aria-labelledby="control-heading">
        <div>
          <h2 id="control-heading">See it, change it, remove it.</h2>
        </div>
        <div>
          <p>
            The demo’s History section shows completed activities saved by this
            browser. Preferences can be changed in the app. Because this beta has
            no account or connected calendar, clearing WorkPulse local data
            removes the product data WorkPulse currently keeps about you.
          </p>
          <p>
            The current beta does not use third-party analytics, advertising
            trackers, or tracking cookies. Basic product events and activity
            feedback stay locally in this browser unless you explicitly copy
            feedback and choose to submit it through GitHub.
          </p>
          <LocalDataControls />
        </div>
      </section>

      <section className="trust-close">
        <div>
          <h2>Wellbeing guidance, not medical monitoring.</h2>
          <p>
            WorkPulse does not diagnose conditions or evaluate your health. Read
            the full beta boundaries before using an activity suggestion.
          </p>
        </div>
        <Link className="button button--evaluate" href="/terms">
          Read terms and wellbeing notice
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
