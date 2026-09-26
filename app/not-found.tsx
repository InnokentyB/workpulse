import Link from "next/link";

import { SiteFooter } from "@/components/SiteChrome";
import { TrustPageHeader } from "@/components/TrustPageHeader";

export default function NotFound() {
  return (
    <main className="app-shell trust-page status-page">
      <TrustPageHeader />
      <section className="status-surface">
        <span aria-hidden="true" className="status-surface__signal" />
        <p>Page not found</p>
        <h1>This path is not part of the workday.</h1>
        <span>
          The link may be outdated, or the page may have moved. Your local
          activity data has not been affected.
        </span>
        <div>
          <Link className="button button--primary" href="/">
            Return to WorkPulse
          </Link>
          <Link className="button button--quiet" href="/feedback">
            Report a broken link
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
