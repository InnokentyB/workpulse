"use client";

import Link from "next/link";

import { PulseMark } from "@/components/icons";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="app-shell status-page">
      <header className="trust-header">
        <Link className="brand" href="/" aria-label="WorkPulse home">
          <PulseMark />
          <span>WorkPulse</span>
        </Link>
      </header>
      <section className="status-surface status-surface--error" role="alert">
        <span aria-hidden="true" className="status-surface__signal" />
        <p>Something did not load</p>
        <h1>WorkPulse missed this moment.</h1>
        <span>
          Try the page again. If the problem continues, the live demo and your
          locally saved data remain separate from this error.
        </span>
        <div>
          <button className="button button--primary" onClick={reset} type="button">
            Try again
          </button>
          <Link className="button button--quiet" href="/feedback">
            Report the problem
          </Link>
        </div>
      </section>
    </main>
  );
}
