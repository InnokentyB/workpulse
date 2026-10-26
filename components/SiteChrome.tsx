import Link from "next/link";

import { PulseMark } from "@/components/icons";

export function SiteHeader({ current }: { current: "personal" | "demo" | "lab" | "calendar" | "play" | "roadmap" | "teams" }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/personal" aria-label="WorkPulse home">
        <PulseMark />
        <span>WorkPulse</span>
      </Link>
      <p>Move more. Interrupt less.</p>
      <nav aria-label="Primary navigation" className="site-nav">
        <Link aria-current={current === "personal" ? "page" : undefined} href="/personal">
          My day
        </Link>
        <Link aria-current={current === "demo" ? "page" : undefined} href="/demo">
          Demo
        </Link>
        <Link href="/personal#exercises">Exercises</Link>
        <Link href="/personal#activity-history">History</Link>
        <Link aria-current={current === "lab" ? "page" : undefined} href="/timing-lab">
          Timing Lab
        </Link>
        <Link aria-current={current === "play" ? "page" : undefined} href="/play">
          Movement game
        </Link>
        <Link aria-current={current === "calendar" ? "page" : undefined} href="/calendar">
          Connection check
        </Link>
        <Link
          aria-current={current === "roadmap" ? "page" : undefined}
          href="/roadmap"
        >
          What&apos;s next
        </Link>
        <Link
          aria-current={current === "teams" ? "page" : undefined}
          href="/for-teams"
        >
          For teams
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <PulseMark />
      <p>
        A workplace wellbeing prototype. Activity suggestions are not medical
        advice.
      </p>
    </footer>
  );
}
