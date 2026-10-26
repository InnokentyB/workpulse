/** Deployment origin is server configuration, never an untrusted forwarding header. */
export function trustedPublicOrigin(request: Request): string | null {
  try {
    const explicit = process.env.WORKPULSE_PUBLIC_ORIGIN;
    const configured = explicit || process.env.GOOGLE_CALENDAR_REDIRECT_URI;
    if (!configured && request.headers.has('host')) return null;
    const publicUrl = new URL(configured || new URL(request.url).origin);
    if (publicUrl.username || publicUrl.password || publicUrl.search || publicUrl.hash ||
        (explicit && publicUrl.pathname !== '/') ||
        (publicUrl.protocol !== 'https:' && !(publicUrl.protocol === 'http:' && (['localhost', '127.0.0.1'].includes(publicUrl.hostname) || (!configured && publicUrl.hostname === '0.0.0.0'))))) return null;
    // Host is required on real HTTP requests. Bare-Request fallback supports unit calls.
    const actualHost = request.headers.get('host') || new URL(request.url).host;
    if (!actualHost || /[\s/\\?#@]/.test(actualHost)) return null;
    const actual = new URL(`${publicUrl.protocol}//${actualHost}`);
    return actual.origin === publicUrl.origin ? publicUrl.origin : null;
  } catch { return null; }
}

export function publicCookieSecure(request: Request): boolean {
  return trustedPublicOrigin(request)?.startsWith('https:') === true;
}
