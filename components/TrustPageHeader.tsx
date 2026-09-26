import Link from "next/link";

import { PulseMark } from "@/components/icons";

export function TrustPageHeader({
  current,
}: {
  current?: "privacy" | "terms" | "feedback";
}) {
  return (
    <header className="trust-header">
      <Link className="brand" href="/#top" aria-label="WorkPulse home">
        <PulseMark />
        <span>WorkPulse</span>
      </Link>
      <nav aria-label="Trust and legal navigation">
        <Link aria-current={current === "privacy" ? "page" : undefined} href="/privacy">
          Privacy
        </Link>
        <Link aria-current={current === "terms" ? "page" : undefined} href="/terms">
          Terms
        </Link>
        <Link
          aria-current={current === "feedback" ? "page" : undefined}
          href="/feedback"
        >
          Feedback
        </Link>
        <Link href="/">Live demo</Link>
      </nav>
    </header>
  );
}
