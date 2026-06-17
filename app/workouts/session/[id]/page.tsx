import { AppShell } from "@/components/layout/app-shell";

export default async function WorkoutSessionPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;

  return (
    <AppShell title="Workout session" eyebrow={id}>
      <section className="max-w-3xl rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
        <p className="text-slate-300">Session logging UI will capture sets, reps, weight, notes, and finish state against `/api/workout-sessions` routes.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {['Set', 'Reps', 'Weight'].map((label) => (
            <div key={label} className="rounded-2xl bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="text-3xl font-black">--</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
