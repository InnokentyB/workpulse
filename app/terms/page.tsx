import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/SiteChrome";
import { TrustPageHeader } from "@/components/TrustPageHeader";

export const metadata: Metadata = {
  title: "Terms and wellbeing notice — WorkPulse",
  description:
    "Plain-language terms and health boundaries for the WorkPulse public beta.",
};

const terms = [
  {
    title: "A beta product",
    text: "WorkPulse is an early workplace-wellbeing product. Features may change, be interrupted, or contain errors. Use of the beta is optional, and you can stop at any time.",
  },
  {
    title: "Not medical advice",
    text: "WorkPulse offers general movement and break suggestions. It is not a medical device or healthcare service and does not diagnose, treat, prevent, or monitor any condition. Its suggestions do not replace advice from a qualified healthcare professional.",
  },
  {
    title: "Choose what is safe for you",
    text: "Do not perform an activity that feels unsuitable. Stop immediately if you feel pain, dizziness, numbness, unusual shortness of breath, or other concerning symptoms. Seek appropriate medical help when needed.",
  },
  {
    title: "Your workspace remains your responsibility",
    text: "Before moving, make sure you have enough clear space and that your chair, desk, cables, and surrounding objects do not create a hazard. Camera-based counting is only a convenience and does not certify that an activity is safe or correctly performed.",
  },
  {
    title: "No guaranteed outcome",
    text: "WorkPulse does not promise health, productivity, pain-reduction, or workplace outcomes. A completed activity records only that the flow was finished; it is not evidence of a health benefit.",
  },
  {
    title: "Acceptable use",
    text: "Do not interfere with the service, attempt unauthorized access, misuse the camera feature, or use WorkPulse in a way that violates applicable law or another person’s privacy.",
  },
] as const;

export default function TermsPage() {
  return (
    <main className="app-shell trust-page">
      <TrustPageHeader current="terms" />

      <header className="trust-intro trust-intro--terms">
        <h1>Move gently. Keep your own limits in charge.</h1>
        <div>
          <p>
            These plain-language beta terms explain what WorkPulse is, what it is
            not, and what to consider before following a suggestion.
          </p>
          <span>Effective 26 September 2026</span>
        </div>
      </header>

      <section className="terms-register" aria-label="Beta terms">
        {terms.map((term) => (
          <article key={term.title}>
            <h2>{term.title}</h2>
            <p>{term.text}</p>
          </article>
        ))}
      </section>

      <section className="trust-close trust-close--terms">
        <div>
          <h2>Privacy is part of the product boundary.</h2>
          <p>
            See exactly what is stored, when the camera can run, and how to erase
            all WorkPulse data from this browser.
          </p>
        </div>
        <Link className="button button--evaluate" href="/privacy">
          Read privacy notice
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
