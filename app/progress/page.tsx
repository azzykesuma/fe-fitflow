"use client";

import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { useMealCalories } from "@/features/meals/hooks";
import { useBodyMeasurements, useBodyWeightLogs, useWorkoutProgress } from "@/features/progress/hooks";
import type { BodyMeasurement, BodyWeightLog, ProgressPoint } from "@/features/progress/types";

function formatNumber(value: number | undefined, suffix = "") {
  return typeof value === "number" ? `${value.toFixed(1)}${suffix}` : "--";
}

function getBodyFat(measurement: BodyMeasurement | undefined) {
  return measurement?.body_fat_percentage ?? measurement?.body_fat_percent;
}

type ChartPoint = {
  key: string;
  value: number;
};

function EmptyChartState({ isLoading, points }: Readonly<{ isLoading: boolean; points: ChartPoint[] }>) {
  if (isLoading) {
    return <div className="grid h-full place-items-center text-center text-xs font-bold text-slate-500">Loading...</div>;
  }

  if (!points.length) {
    return <div className="grid h-full place-items-center text-center text-xs font-bold text-slate-500">No data yet</div>;
  }

  return null;
}

function ChartCard({ title, points, isLoading, variant = "bar" }: Readonly<{ title: string; points: ChartPoint[]; isLoading: boolean; variant?: "bar" | "line" }>) {
  return (
    <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#101b15] p-4">
      <h2 className="text-base font-black">{title}</h2>
      <div className="mt-4 h-40 rounded-2xl bg-[#07120c] p-3">
        <EmptyChartState isLoading={isLoading} points={points} />
        {!isLoading && points.length ? (
          <ResponsiveContainer width="100%" height="100%">
            {variant === "line" ? (
              <LineChart data={points} margin={{ left: -28, right: 4, top: 8, bottom: 0 }}>
                <XAxis dataKey="key" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#07120c", border: "1px solid rgba(190,242,100,0.18)", borderRadius: 12, color: "#f8fafc" }} />
                <Line type="monotone" dataKey="value" stroke="#bef264" strokeWidth={3} dot={false} />
              </LineChart>
            ) : (
              <BarChart data={points} margin={{ left: -28, right: 4, top: 8, bottom: 0 }}>
                <XAxis dataKey="key" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#07120c", border: "1px solid rgba(190,242,100,0.18)", borderRadius: 12, color: "#f8fafc" }} />
                <Bar dataKey="value" fill="#bef264" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : null}
      </div>
    </section>
  );
}

function workoutPointsToBars(points: ProgressPoint[] | undefined) {
  return (points ?? []).slice(-7).map((point) => ({ key: point.date, value: point.value }));
}

function weightLogsToBars(logs: BodyWeightLog[] | undefined) {
  return (logs ?? []).slice(-7).map((log) => ({ key: log.id ?? log.log_date, value: log.weight_kg }));
}

function bodyMeasurementsToBars(measurements: BodyMeasurement[] | undefined) {
  return (measurements ?? [])
    .slice(0, 7)
    .reverse()
    .map((measurement, index) => ({
      key: measurement.id ?? `${measurement.date ?? measurement.log_date}-${index}`,
      value: getBodyFat(measurement) ?? 0,
    }))
    .filter((point) => point.value > 0);
}

export default function ProgressPage() {
  const meals = useMealCalories();
  const workouts = useWorkoutProgress();
  const bodyWeights = useBodyWeightLogs();
  const bodyMeasurements = useBodyMeasurements();
  const latestMeasurement = bodyMeasurements.data?.[0];
  const latestBodyFat = getBodyFat(latestMeasurement);

  return (
    <AppShell title="Transformation Analytics" eyebrow="Momentum and measurements">
      <div className="mb-4 rounded-[1.35rem] border border-lime-200/10 bg-[#0b1710] p-4">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Biometric trends</p>
        <h2 className="mt-2 text-2xl font-black">{formatNumber(latestBodyFat, "% Body Fat")}</h2>
        <p className="mt-1 text-xs font-bold text-lime-200">
          {latestMeasurement ? `Latest entry: ${latestMeasurement.date ?? latestMeasurement.log_date}` : "No body measurement in this range"}
        </p>
          <div className="mt-5 h-36 rounded-2xl bg-lime-300/10 p-3">
          <BodyFatAreaChart points={bodyMeasurementsToBars(bodyMeasurements.data)} isLoading={bodyMeasurements.isLoading} />
        </div>
        <Link href="/progress/body-measurement" className="mt-4 inline-flex rounded-xl bg-lime-300 px-4 py-3 text-xs font-black text-slate-900 transition hover:bg-lime-400">
          Body measurements
        </Link>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#101b15] p-4">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Calories today</p>
          <p className="mt-2 text-3xl font-black">{meals.data?.total_calories ?? "--"}</p>
        </section>
        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#101b15] p-4">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Latest weight</p>
          <p className="mt-2 text-3xl font-black">{formatNumber(bodyWeights.data?.at(-1)?.weight_kg, "kg")}</p>
        </section>
        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#101b15] p-4">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Workouts tracked</p>
          <p className="mt-2 text-3xl font-black">{workouts.data?.length ?? "--"}</p>
        </section>
      </div>

      <div className="grid gap-3">
        <ChartCard title="Meal calories" points={meals.data ? Object.entries(meals.data.by_meal_type).map(([key, value]) => ({ key, value })) : []} isLoading={meals.isLoading} />
        <ChartCard title="Workouts per week" points={workoutPointsToBars(workouts.data)} isLoading={workouts.isLoading} />
        <ChartCard title="Body weight" points={weightLogsToBars(bodyWeights.data)} isLoading={bodyWeights.isLoading} variant="line" />
      </div>
    </AppShell>
  );
}

function BodyFatAreaChart({ points, isLoading }: Readonly<{ points: ChartPoint[]; isLoading: boolean }>) {
  const emptyState = <EmptyChartState isLoading={isLoading} points={points} />;

  if (emptyState) return emptyState;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ left: -28, right: 4, top: 8, bottom: 0 }}>
        <XAxis dataKey="key" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "#07120c", border: "1px solid rgba(190,242,100,0.18)", borderRadius: 12, color: "#f8fafc" }} />
        <Area type="monotone" dataKey="value" stroke="#bef264" fill="#bef264" fillOpacity={0.25} strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
