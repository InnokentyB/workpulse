import {
  loadWorkoutSettings,
  parseWorkoutSettings,
} from "@/lib/workout-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const catalogUrl = process.env.WORKPULSE_WORKOUT_CATALOG_URL;
  if (!catalogUrl) {
    return Response.json(loadWorkoutSettings(), {
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    if (new URL(catalogUrl).protocol !== "https:") {
      throw new Error("Remote catalog URL must use HTTPS.");
    }
    const response = await fetch(catalogUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Remote catalog request failed.");
    const settings = parseWorkoutSettings(await response.json());
    return Response.json(settings, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "The remote workout catalog is unavailable or invalid." },
      { status: 502 },
    );
  }
}
