import { DashboardShell } from "./dashboard-shell";
import { dashboardCards, habits, workoutPlans } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-4 lg:gap-3">
        {dashboardCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-lime-200/10 bg-[#0b1710] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] last:hidden lg:last:block lg:p-5">
            <p className="text-[0.6rem] font-black uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className="mt-2 text-xl font-black tracking-tight text-white lg:text-3xl">{card.value}</p>
            <p className="mt-1 text-[0.62rem] font-bold text-lime-200/80">{card.hint}</p>
          </article>
        ))}
      </div>

      <section className="mt-4 overflow-hidden rounded-[1.35rem] border border-lime-200/10 bg-[#0a1710] p-3 lg:mt-6 lg:p-4">
        <div className="rounded-[1.1rem] bg-[linear-gradient(135deg,rgba(12,36,24,0.95),rgba(5,11,8,0.9)),radial-gradient(circle_at_80%_20%,rgba(167,255,79,0.22),transparent_9rem)] p-4 lg:min-h-64 lg:p-6">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-lime-200">Today workout</p>
          <div className="mt-8 flex items-end justify-between gap-4 lg:mt-28">
            <div>
              <h2 className="text-2xl font-black leading-none tracking-tight lg:text-5xl">Push Day A</h2>
              <p className="mt-1 text-xs font-bold text-slate-400">Chest, shoulders and triceps</p>
            </div>
            <button className="rounded-xl bg-lime-300 px-4 py-3 text-xs font-black text-slate-950">Start</button>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr]">
        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black">Today's Habits</h2>
            <span className="text-[0.65rem] font-black text-lime-200">75% Done</span>
          </div>
          <div className="space-y-3">
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#101b15] p-3">
                <div>
                  <p className="text-sm font-black text-white">{habit.name}</p>
                  <p className="text-[0.68rem] font-bold text-slate-500">{habit.streak} day streak</p>
                </div>
                <span className={habit.completed ? "rounded-full bg-lime-300 px-3 py-1 text-[0.62rem] font-black text-slate-950" : "rounded-full bg-white/10 px-3 py-1 text-[0.62rem] font-bold text-slate-300"}>
                  {habit.completed ? "Done" : "Open"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
          <h2 className="mb-3 text-base font-black">Scheduled Workouts</h2>
          <div className="space-y-3">
            {workoutPlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-white/5 bg-[#101b15] p-3">
                <p className="text-sm font-black">{plan.name}</p>
                <p className="text-[0.68rem] font-bold text-slate-500">{plan.day} · {plan.exercises} exercises</p>
              </div>
            ))}
          </div>
        </section>

        <section className="hidden rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black">Progress Snapshot</h2>
            <a href="/progress/body-measurement" className="text-[0.65rem] font-black text-lime-200">View</a>
          </div>
          <div className="rounded-2xl bg-lime-300/10 p-4">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Body fat trend</p>
            <p className="mt-2 text-3xl font-black">-3.2%</p>
            <div className="mt-5 flex h-28 items-end gap-2">
              {[28, 36, 52, 58, 70, 83].map((height, index) => (
                <div key={index} className="flex-1 rounded-t-xl bg-lime-300/80" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
