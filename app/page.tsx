export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
        WorkPulse
      </p>
      <h1 className="text-5xl font-semibold tracking-tight text-zinc-950 sm:text-7xl">
        Move more. Interrupt less.
      </h1>
      <p className="max-w-2xl text-lg leading-8 text-zinc-600">
        A minimal hackathon starter for an AI coworker that knows when to get
        you away from your computer.
      </p>
      <p className="text-sm text-zinc-500">
        Product UI implementation starts from the canonical specification in
        WORKPULSE_SPEC.md.
      </p>
    </main>
  );
}
