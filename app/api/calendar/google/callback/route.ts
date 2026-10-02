import { NextRequest, NextResponse } from "next/server";
import { cookieOptions, FLOW_COOKIE, getGoogleConfig, GOOGLE_CALENDAR_LIST_SCOPE,
  SESSION_COOKIE, seal, unseal, type PendingFlow } from "@/lib/calendar/google-oauth";
import { GOOGLE_CALENDAR_FREEBUSY_SCOPE } from "@/lib/calendar/google";

export async function GET(request: NextRequest) {
  const config = getGoogleConfig();
  if (!config || new URL(config.redirectUri).origin !== request.nextUrl.origin) return new Response("OAuth configuration mismatch", { status: 400 });
  const params = request.nextUrl.searchParams;
  const pending = unseal<PendingFlow>(request.cookies.get(FLOW_COOKIE)?.value, config.sessionSecret);
  const redirect = (error?: string) => {
    const result = NextResponse.redirect(new URL(error ? `/calendar?error=${error}` : "/calendar?connected=1", request.url));
    result.cookies.delete(FLOW_COOKIE);
    return result;
  };
  if (!pending || typeof pending.state !== "string" || typeof pending.verifier !== "string" ||
    !Number.isFinite(pending.expiresAt) || pending.expiresAt < Date.now() ||
    !params.get("state") || params.get("state") !== pending.state) return redirect("state");
  if (params.has("error")) return redirect("denied");
  const code = params.get("code");
  if (!code) return redirect("code");
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, cache: "no-store",
      body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret,
        redirect_uri: config.redirectUri, grant_type: "authorization_code", code_verifier: pending.verifier }),
    });
    if (!tokenResponse.ok) return redirect("exchange");
    const token = await tokenResponse.json() as { access_token?: unknown; expires_in?: unknown; scope?: unknown; token_type?: unknown };
    const scopes = typeof token.scope === "string" ? token.scope.split(" ") : [];
    if (typeof token.access_token !== "string" || token.token_type !== "Bearer" ||
      typeof token.expires_in !== "number" || token.expires_in <= 60 ||
      ![GOOGLE_CALENDAR_FREEBUSY_SCOPE, GOOGLE_CALENDAR_LIST_SCOPE].every((scope) => scopes.includes(scope))) return redirect("scope");
    const result = redirect();
    result.cookies.set(SESSION_COOKIE, seal({ accessToken: token.access_token,
      expiresAt: Date.now() + token.expires_in * 1000 }, config.sessionSecret),
      { ...cookieOptions(request.nextUrl.protocol === "https:"), maxAge: token.expires_in });
    return result;
  } catch { return redirect("exchange"); }
}
