import Link from "next/link";

import { PulseMark } from "@/components/icons";

export function SiteHeader({ current }: { current: "demo" | "roadmap" | "teams" }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/#top" aria-label="WorkPulse home">
        <PulseMark />
        <span>WorkPulse</span>
      </Link>
      <p>Move more. Interrupt less.</p>
      <nav aria-label="Primary navigation" className="site-nav">
        <Link aria-current={current === "demo" ? "page" : undefined} href="/">
          Live demo
        </Link>
        <Link href="/#history">History</Link>
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
