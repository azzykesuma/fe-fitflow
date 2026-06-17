import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { workoutPlans } from "@/lib/demo-data";

export default function WorkoutsPage() {
  return (
    <AppShell title="Training Plan" eyebrow="Focus on explosive power today">
      <div className="mb-4 overflow-hidden rounded-[1.35rem] border border-lime-200/10 bg-[#0a1710] p-3">
        <div className="rounded-[1.1rem] bg-[linear-gradient(135deg,rgba(12,36,24,0.95),rgba(5,11,8,0.9)),radial-gradient(circle_at_85%_15%,rgba(167,255,79,0.22),transparent_9rem)] p-4">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-lime-200">Today's goal</p>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black leading-none">Push Day A</h2>
              <p className="mt-1 text-xs font-bold text-slate-400">45 min · high intensity</p>
            </div>
            <Link href="/workouts/new" className="rounded-xl bg-lime-300 px-4 py-3 text-xs font-black text-slate-950">New</Link>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {workoutPlans.map((plan) => (
          <Link key={plan.id} href={`/workouts/${plan.id}`} className="rounded-2xl border border-lime-200/10 bg-[#101b15] p-4 transition hover:border-lime-300/40">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-lime-200/70">{plan.day}</p>
            <h2 className="mt-2 text-base font-black">{plan.name}</h2>
            <p className="mt-1 text-[0.68rem] font-bold text-slate-500">{plan.exercises} exercises planned</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
