"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useWorkoutPlans, useWorkoutPlansToday } from "@/features/workouts/hooks";

export default function WorkoutsPage() {
  const { data: plans, isLoading: isPlansLoading, isError: isPlansError } = useWorkoutPlans();
  const { data: todayPlans, isLoading: isTodayLoading } = useWorkoutPlansToday();

  const todayPlan = todayPlans && todayPlans.length > 0 ? todayPlans[0] : null;

  return (
    <AppShell title="Training Plan" eyebrow="Manage your routines and tracks">
      {/* Today's Goal Card */}
      <div className="mb-6 overflow-hidden rounded-[1.35rem] border border-lime-200/10 bg-[#0a1710] p-3 shadow-lg">
        <div className="rounded-[1.1rem] bg-[linear-gradient(135deg,rgba(12,36,24,0.95),rgba(5,11,8,0.9)),radial-gradient(circle_at_85%_15%,rgba(167,255,79,0.22),transparent_9rem)] p-5">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-lime-200">Today's Goal</p>
          
          {isTodayLoading ? (
            <div className="mt-6 animate-pulse space-y-3">
              <div className="h-6 w-1/3 rounded bg-slate-700/50" />
              <div className="h-4 w-1/4 rounded bg-slate-700/30" />
            </div>
          ) : todayPlan ? (
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black leading-none text-white">{todayPlan.name}</h2>
                <p className="mt-2 text-xs font-bold text-slate-400">
                  {todayPlan.scheduled_day ? `${todayPlan.scheduled_day} · ` : ""}
                  {todayPlan.exercise_count ?? todayPlan.exercises?.length ?? 0} exercises planned
                </p>
                {todayPlan.description && (
                  <p className="mt-2 text-xs text-slate-400 italic max-w-xs">{todayPlan.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/workouts/session/${todayPlan.id}`}
                  className="rounded-xl bg-lime-300 px-4 py-3 text-xs font-black text-slate-950 transition hover:bg-lime-400 hover:scale-105 active:scale-95"
                >
                  Start Session
                </Link>
                <Link
                  href={`/workouts/${todayPlan.id}`}
                  className="rounded-xl border border-lime-200/20 bg-lime-300/10 px-4 py-3 text-xs font-black text-lime-200 transition hover:bg-lime-300/20"
                >
                  View Details
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold leading-none text-slate-300">No workout scheduled for today</h2>
                <p className="mt-2 text-xs font-semibold text-slate-500">Take a well-deserved rest day or start a custom routine.</p>
              </div>
              <Link href="/workouts/new" className="rounded-xl bg-lime-300 px-4 py-3 text-xs font-black text-slate-950 transition hover:bg-lime-400">
                New Workout
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Existing Workouts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-400">All Workout Plans</h3>
          {plans && plans.length > 0 && (
            <Link href="/workouts/new" className="text-xs font-bold text-lime-300 hover:underline">
              + Add New
            </Link>
          )}
        </div>

        {isPlansLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 animate-pulse rounded-2xl border border-lime-200/5 bg-[#101b15]/50 p-4" />
            ))}
          </div>
        ) : isPlansError ? (
          <div className="rounded-2xl border border-red-950 bg-red-950/20 p-4 text-center">
            <p className="text-sm font-semibold text-red-400">Failed to load workout plans.</p>
            <p className="mt-1 text-xs text-slate-500">Please start the Go API server and refresh the page.</p>
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/workouts/${plan.id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-lime-200/10 bg-[#101b15] p-5 transition-all hover:border-lime-300/40 hover:bg-[#14231b] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-lime-200/70">{plan.scheduled_day}</p>
                    <span className="opacity-0 transition-opacity group-hover:opacity-100 text-[10px] text-lime-300">Edit details &rarr;</span>
                  </div>
                  <h2 className="mt-2 text-lg font-black text-white">{plan.name}</h2>
                  {plan.description && (
                    <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">{plan.description}</p>
                  )}
                </div>
                <div className="mt-5 pt-3 border-t border-white/5">
                  <p className="text-[0.68rem] font-bold text-slate-500">
                    {plan.exercise_count ?? plan.exercises?.length ?? 0} exercises planned
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-lime-200/20 p-8 text-center bg-[#101b15]/20">
            <p className="text-sm font-bold text-slate-400">No workout plans found</p>
            <p className="mt-1 text-xs text-slate-500">Create your first training routine to get started!</p>
            <Link href="/workouts/new" className="mt-4 inline-block rounded-xl bg-lime-300 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:bg-lime-400">
              Create Plan
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
