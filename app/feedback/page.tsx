import type { Metadata } from "next";

import { FeedbackWorksheet } from "@/components/FeedbackWorksheet";
import { SiteFooter } from "@/components/SiteChrome";
import { TrustPageHeader } from "@/components/TrustPageHeader";

export const metadata: Metadata = {
  title: "Beta feedback — WorkPulse",
  description:
    "Share what felt useful, mistimed, or unclear in the WorkPulse public beta.",
};

export default function FeedbackPage() {
  return (
    <main className="app-shell trust-page feedback-page">
      <TrustPageHeader current="feedback" />

      <header className="trust-intro feedback-intro">
        <h1>Help make the next interruption worth it.</h1>
        <div>
          <p>
            We are testing whether WorkPulse chooses a genuinely useful moment,
            not whether people can complete another reminder. One specific story
            is more valuable than a score.
          </p>
          <span>Public beta feedback · no account required</span>
        </div>
      </header>

      <section className="feedback-prompt" aria-labelledby="feedback-heading">
        <div>
          <h2 id="feedback-heading">Tell us what happened.</h2>
          <p>Four short prompts, then you decide what leaves this page.</p>
        </div>
        <FeedbackWorksheet />
      </section>

      <SiteFooter />
    </main>
  );
}
