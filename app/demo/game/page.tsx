import { MovementGame } from "@/components/MovementGame";

export default async function PlayPage({ searchParams }: {
  searchParams: Promise<{ activity?: string | string[] }>;
}) {
  const { activity } = await searchParams;
  const activityId = typeof activity === "string" ? activity : "shoulder-rolls";
  return <MovementGame key={activityId} initialActivityId={activityId} />;
}
