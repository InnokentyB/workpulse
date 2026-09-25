import { handlers } from "@/auth";
import { getAccountConfiguration } from "@/lib/auth/config";

function unavailable() {
  return Response.json(
    { error: "Account sign-in is not configured for this deployment." },
    { status: 503 },
  );
}

const configuration = getAccountConfiguration();

export const GET = configuration.authReady ? handlers.GET : unavailable;
export const POST = configuration.authReady ? handlers.POST : unavailable;
