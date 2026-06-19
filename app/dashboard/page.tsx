"use client";

import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardShell } from "./dashboard-shell";
import { useMealCalories, useMealLogs } from "@/features/meals/hooks";
import { useBodyMeasurements, useWorkoutProgress } from "@/features/progress/hooks";
import type { BodyMeasurement } from "@/features/progress/types";
// import { useWorkoutPlans } from "@/features/workouts/hooks";
import { getAuthToken } from "@/lib/auth-token";
import { toast } from "sonner";

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
  
  const handleDownloadReport = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("You must be logged in to download the report.");
        return;
      }

      const response = await fetch(`/api/reports/summary?token=${token}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "FitFlow_Summary.xlsx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Report downloaded successfully.");
    } catch (error) {
      console.error("Report download failed:", error);
      toast.error("Could not download summary report. Please try again.");
    }
  };
  const mealLogs = useMealLogs(today);
  // const workoutPlans = useWorkoutPlans();
  // const workouts = useWorkoutProgress();
  const bodyMeasurements = useBodyMeasurements();
  const latestMeasurement = bodyMeasurements.data?.[0];
  const latestWeight = latestMeasurement?.weight_kg;
  const latestBodyFat = getBodyFat(latestMeasurement);
  const bodyFatPoints = (bodyMeasurements.data ?? [])
    .slice(0, 7)
    .reverse()
    .map((measurement) => ({ date: getMeasurementDate(measurement), value: getBodyFat(measurement) ?? 0 }))
    .filter((point) => point.value > 0);
  const caloriePoints = mealTypes.map((type) => ({ type, calories: meals.data?.by_meal_type[type] ?? 0 }));
  // const todayWorkout = workoutPlans.data?.[0];
  const statCards = [
    { label: "Calories", value: meals.data?.total_calories?.toString() ?? "--", hint: "today" },
    { label: "Meals", value: mealLogs.data?.length?.toString() ?? "--", hint: "logged today" },
    // { label: "Workouts", value: workouts.data?.length?.toString() ?? "--", hint: "tracked" },
    { label: "Weight", value: formatNumber(latestWeight, "kg"), hint: "latest" },
  ];

  return (
    <DashboardShell>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Summary Dashboard</span>
        <button
          type="button"
          onClick={handleDownloadReport}
          className="inline-flex items-center gap-1.5 rounded-xl border border-lime-200/20 bg-lime-300/10 px-3.5 py-2 text-xs font-black text-lime-200 hover:bg-lime-300/20 active:scale-[0.98] transition cursor-pointer"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        {statCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-lime-200/10 bg-[#0b1710] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:p-5">
            <p className="text-[0.6rem] font-black uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className="mt-2 text-xl font-black tracking-tight text-white lg:text-3xl">{card.value}</p>
            <p className="mt-1 text-[0.62rem] font-bold text-lime-200/80">{card.hint}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
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
