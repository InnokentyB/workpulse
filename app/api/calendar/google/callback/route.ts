import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { auth } from "@/auth";
import { getGoogleOAuthConfiguration } from "@/lib/auth/config";
import { saveGoogleCalendarConnection } from "@/lib/calendar/connections";
import { exchangeGoogleCalendarCode } from "@/lib/calendar/google-oauth";

export const dynamic = "force-dynamic";

function matchesState(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function accountRedirect(request: Request, result: string) {
  return Response.redirect(new URL(`/account?calendar=${result}`, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("workpulse-calendar-oauth-state")?.value;
  cookieStore.delete("workpulse-calendar-oauth-state");

  if (
    url.searchParams.has("error") ||
    !matchesState(url.searchParams.get("state"), expectedState)
  ) {
    return accountRedirect(request, "cancelled");
  }

  const code = url.searchParams.get("code");
  const session = await auth();
  if (!code || !session?.user.id) {
    return accountRedirect(request, "failed");
  }

  try {
    const tokens = await exchangeGoogleCalendarCode(
      getGoogleOAuthConfiguration(),
      code,
    );
    await saveGoogleCalendarConnection(session.user.id, tokens);
  } catch {
    return accountRedirect(request, "failed");
  }

  return accountRedirect(request, "connected");
}
