"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useWorkoutPlans } from "@/features/workouts/hooks";

export default function WorkoutSessionStartPage() {
  const { data: plans, isLoading, isError } = useWorkoutPlans();

  return (
    <AppShell title="Start Workout Session" eyebrow="Select a training routine to begin tracking">
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 animate-pulse rounded-3xl border border-white/5 bg-[#101b15]/50 p-5" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-[1.5rem] border border-red-950 bg-red-950/20 p-8 text-center">
            <p className="text-sm font-semibold text-red-400">Failed to load workout plans.</p>
            <p className="mt-1 text-xs text-slate-500">Please start the Go API server and refresh the page.</p>
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-lime-200/10 bg-[#101b15]/65 p-5 backdrop-blur-sm transition-all hover:border-lime-300/40 hover:bg-[#14231b]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-lime-300/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-lime-200 border border-lime-300/20">
                      {plan.scheduled_day || "Unscheduled"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {plan.exercise_count ?? plan.exercises?.length ?? 0} exercises
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-white group-hover:text-lime-300 transition-colors">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 italic">
                      {plan.description}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    href={`/workouts/session/${plan.id}`}
                    className="flex w-full h-11 items-center justify-center rounded-xl bg-lime-300 text-xs font-black text-slate-950 transition hover:bg-lime-400 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Start Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-lime-200/20 p-8 text-center bg-[#101b15]/20">
            <p className="text-sm font-bold text-slate-400">No workout plans found</p>
            <p className="mt-1 text-xs text-slate-500">You need to create a workout routine before you can start a session.</p>
            <Link
              href="/workouts/new"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-lime-300 px-6 text-xs font-black text-slate-950 transition hover:bg-lime-400 active:scale-95"
            >
              Create New Plan
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
