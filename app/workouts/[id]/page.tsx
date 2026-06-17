import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { workoutPlans } from "@/lib/demo-data";

export default async function WorkoutDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const plan = workoutPlans.find((item) => item.id === id) ?? workoutPlans[0];

  return (
    <AppShell title={plan.name} eyebrow="Workout detail">
      <section className="max-w-3xl rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
        <p className="text-slate-300">Scheduled for {plan.day}. Exercises, target sets, reps, weight, and rest times will load from the Go API.</p>
        <Link href={`/workouts/session/${plan.id}`} className="mt-6 inline-flex rounded-2xl bg-lime-300 px-5 py-3 font-black text-slate-950">
          Start session
        </Link>
      </section>
    </AppShell>
  );
}
