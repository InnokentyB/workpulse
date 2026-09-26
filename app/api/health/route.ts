export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "workpulse",
      revision:
        process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
        process.env.GITHUB_SHA?.slice(0, 12) ??
        "local",
      checkedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
