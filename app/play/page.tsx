import { redirect } from 'next/navigation';

export default async function PlayPage({ searchParams }: {
  searchParams: Promise<{ activity?: string | string[] }>;
}) {
  const { activity } = await searchParams;
  if(activity==='desk-dance')redirect('/demo/game?activity=desk-dance');
  const exercise=activity==='neck-reset'||activity==='shoulder-rolls'||activity==='lantern-route'?activity:'lantern-arms';
  redirect(`/personal?exercise=${exercise}&scene=trail#exercises`);
}
