"use client";

import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardShell } from "./dashboard-shell";
import { useMealCalories, useMealLogs } from "@/features/meals/hooks";
import { useBodyMeasurements, useBodyWeightLogs, useWorkoutProgress } from "@/features/progress/hooks";
import type { BodyMeasurement } from "@/features/progress/types";
import { useWorkoutPlans } from "@/features/workouts/hooks";

const today = new Date().toISOString().slice(0, 10);
const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;

function formatNumber(value: number | undefined, suffix = "") {
  return typeof value === "number" ? `${value.toFixed(1)}${suffix}` : "--";
}

function getBodyFat(measurement: BodyMeasurement | undefined) {
  return measurement?.body_fat_percentage ?? measurement?.body_fat_percent;
}

function getMeasurementDate(measurement: BodyMeasurement) {
  return measurement.date ?? measurement.log_date ?? measurement.id;
}

function EmptyChartState({ isLoading, hasData }: Readonly<{ isLoading: boolean; hasData: boolean }>) {
  if (isLoading) {
    return <div className="grid h-full place-items-center text-center text-xs font-bold text-slate-500">Loading...</div>;
  }

  if (!hasData) {
    return <div className="grid h-full place-items-center text-center text-xs font-bold text-slate-500">No data yet</div>;
  }

  return null;
}

export default function DashboardPage() {
  const meals = useMealCalories(today);
  const mealLogs = useMealLogs(today);
  const workoutPlans = useWorkoutPlans();
  const workouts = useWorkoutProgress();
  const bodyWeights = useBodyWeightLogs();
  const bodyMeasurements = useBodyMeasurements();
  const latestWeight = bodyWeights.data?.at(-1)?.weight_kg;
  const latestMeasurement = bodyMeasurements.data?.[0];
  const latestBodyFat = getBodyFat(latestMeasurement);
  const bodyFatPoints = (bodyMeasurements.data ?? [])
    .slice(0, 7)
    .reverse()
    .map((measurement) => ({ date: getMeasurementDate(measurement), value: getBodyFat(measurement) ?? 0 }))
    .filter((point) => point.value > 0);
  const caloriePoints = mealTypes.map((type) => ({ type, calories: meals.data?.by_meal_type[type] ?? 0 }));
  const todayWorkout = workoutPlans.data?.[0];
  const statCards = [
    { label: "Calories", value: meals.data?.total_calories?.toString() ?? "--", hint: "today" },
    { label: "Meals", value: mealLogs.data?.length?.toString() ?? "--", hint: "logged today" },
    { label: "Workouts", value: workouts.data?.length?.toString() ?? "--", hint: "tracked" },
    { label: "Weight", value: formatNumber(latestWeight, "kg"), hint: "latest" },
  ];

  return (
    <DashboardShell>
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-4 lg:gap-3">
        {statCards.map((card) => (
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
              <h2 className="text-2xl font-black leading-none tracking-tight lg:text-5xl">{todayWorkout?.name ?? "No plan yet"}</h2>
              <p className="mt-1 text-xs font-bold text-slate-400">{todayWorkout?.scheduled_day ? `Scheduled ${todayWorkout.scheduled_day}` : "Create a workout plan to start training"}</p>
            </div>
            <Link href={todayWorkout?.id ? `/workouts/${todayWorkout.id}` : "/workouts/new"} className="rounded-xl bg-lime-300 px-4 py-3 text-xs font-black text-slate-950">
              {todayWorkout?.id ? "Open" : "Create"}
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr]">
        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black">Today's Meals</h2>
            <Link href="/meals" className="text-[0.65rem] font-black text-lime-200">Log meal</Link>
          </div>
          <div className="mb-4 h-36 rounded-2xl bg-[#101b15] p-3">
            <EmptyChartState isLoading={meals.isLoading} hasData={caloriePoints.some((point) => point.calories > 0)} />
            {!meals.isLoading && caloriePoints.some((point) => point.calories > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caloriePoints} margin={{ left: -28, right: 4, top: 8, bottom: 0 }}>
                  <XAxis dataKey="type" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#07120c", border: "1px solid rgba(190,242,100,0.18)", borderRadius: 12, color: "#f8fafc" }} />
                  <Bar dataKey="calories" fill="#bef264" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
          <div className="space-y-3">
            {mealLogs.data?.slice(0, 3).map((meal) => (
              <Link key={meal.id} href={`/meals/${meal.id}`} className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#101b15] p-3">
                <div>
                  <p className="text-sm font-black text-white">{meal.food_name}</p>
                  <p className="text-[0.68rem] font-bold text-slate-500">{meal.meal_type} · P {meal.protein_g}g · C {meal.carbs_g}g · F {meal.fat_g}g</p>
                </div>
                <span className="rounded-full bg-lime-300 px-3 py-1 text-[0.62rem] font-black text-slate-950">{meal.calories}</span>
              </Link>
            ))}
            {!mealLogs.isLoading && !mealLogs.data?.length ? <p className="rounded-2xl bg-[#101b15] p-3 text-sm font-bold text-slate-500">No meals logged today.</p> : null}
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black">Workout Plans</h2>
            <Link href="/workouts/new" className="text-[0.65rem] font-black text-lime-200">New</Link>
          </div>
          <div className="space-y-3">
            {workoutPlans.data?.slice(0, 4).map((plan) => (
              <Link key={plan.id} href={`/workouts/${plan.id}`} className="block rounded-2xl border border-white/5 bg-[#101b15] p-3">
                <p className="text-sm font-black">{plan.name}</p>
                <p className="text-[0.68rem] font-bold text-slate-500">{plan.scheduled_day ?? "Unscheduled"}</p>
              </Link>
            ))}
            {!workoutPlans.isLoading && !workoutPlans.data?.length ? <p className="rounded-2xl bg-[#101b15] p-3 text-sm font-bold text-slate-500">No workout plans yet.</p> : null}
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black">Progress Snapshot</h2>
            <Link href="/progress/body-measurement" className="text-[0.65rem] font-black text-lime-200">View</Link>
          </div>
          <div className="rounded-2xl bg-lime-300/10 p-4">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Body fat trend</p>
            <p className="mt-2 text-3xl font-black">{formatNumber(latestBodyFat, "%")}</p>
            <div className="mt-5 h-32">
              <EmptyChartState isLoading={bodyMeasurements.isLoading} hasData={bodyFatPoints.length > 0} />
              {!bodyMeasurements.isLoading && bodyFatPoints.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bodyFatPoints} margin={{ left: -28, right: 4, top: 8, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#07120c", border: "1px solid rgba(190,242,100,0.18)", borderRadius: 12, color: "#f8fafc" }} />
                    <Area type="monotone" dataKey="value" stroke="#bef264" fill="#bef264" fillOpacity={0.25} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
