import Link from "next/link";
import { MotionSection } from "@/components/motion-section";

const highlights = [
  "Daily habit checklist",
  "Workout plans and sessions",
  "Weekly progress snapshots",
  "Installable PWA shell",
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
      <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
        <Link href="/" className="text-lg font-black tracking-tight">
          FitFlow
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link className="rounded-full px-4 py-2 text-white/75 transition hover:text-white" href="/auth/login">
            Login
          </Link>
          <Link className="rounded-full bg-lime-300 px-4 py-2 font-bold text-slate-950" href="/auth/register">
            Start
          </Link>
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <MotionSection className="space-y-8">
          <p className="w-fit rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-sm font-bold text-lime-200">
            Habit and workout tracker
          </p>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.06em] text-white sm:text-7xl">
              Build consistency without losing training context.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              FitFlow keeps your daily habits, planned workouts, logged sets, and progress signals in one responsive frontend ready for the Go API.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="rounded-2xl bg-lime-300 px-6 py-4 text-center font-black text-slate-950 shadow-[0_20px_60px_rgba(132,255,96,0.25)]" href="/dashboard">
              Open dashboard
            </Link>
            <Link className="rounded-2xl border border-white/15 px-6 py-4 text-center font-bold text-white/85" href="/habits">
              View habits
            </Link>
          </div>
        </MotionSection>

        <MotionSection delay={0.12} className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur">
          <div className="rounded-[1.5rem] bg-slate-950/80 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Today</p>
                <h2 className="text-2xl font-black">Pull Day</h2>
              </div>
              <span className="rounded-full bg-lime-300 px-3 py-1 text-xs font-black text-slate-950">3 streak</span>
            </div>
            <div className="space-y-3">
              {highlights.map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-white/[0.06] p-4">
                  <span className="font-bold">{item}</span>
                  <span className="grid size-8 place-items-center rounded-full bg-lime-300/15 text-sm font-black text-lime-200">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </MotionSection>
      </section>
    </main>
  );
}
