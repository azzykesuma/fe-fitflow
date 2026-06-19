"use client";

import Link from "next/link";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { useMealCalories } from "@/features/meals/hooks";
import { useBodyMeasurements, useWorkoutProgress } from "@/features/progress/hooks";
import type { BodyMeasurement } from "@/features/progress/types";

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

function formatDateLabel(dateStr: string) {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
}

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
                <Line type="monotone" dataKey="value" stroke="#bef264" strokeWidth={3} dot={{ fill: "#bef264", r: 3 }} />
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

function bodyMeasurementsToBars(measurements: BodyMeasurement[] | undefined) {
  return (measurements ?? [])
    .slice(0, 7)
    .reverse()
    .map((measurement) => ({
      key: formatDateLabel(measurement.date ?? measurement.log_date ?? ""),
      value: getBodyFat(measurement) ?? 0,
    }))
    .filter((point) => point.value > 0);
}

// Unified helper to extract biometrics trend from measurements history
function getBiometricPoints(
  measurements: BodyMeasurement[] | undefined,
  field: "weight_kg" | "waist_cm" | "bmi",
  viewMode: "last7" | "all" | "weekly"
) {
  const data = measurements ?? [];
  // Sort oldest first for graphical representation
  const sorted = [...data].sort((a, b) => {
    const dateA = a.date ?? a.log_date ?? "";
    const dateB = b.date ?? b.log_date ?? "";
    return dateA.localeCompare(dateB);
  });

  const mapped = sorted
    .map((item) => ({
      date: item.date ?? item.log_date ?? "",
      value: Number(item[field]) || 0,
    }))
    .filter((point) => point.value > 0);

  if (viewMode === "weekly") {
    const groups: Record<string, { sum: number; count: number }> = {};
    for (const point of mapped) {
      const date = new Date(point.date);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const weekKey = monday.toISOString().slice(0, 10);

      if (!groups[weekKey]) {
        groups[weekKey] = { sum: 0, count: 0 };
      }
      groups[weekKey].sum += point.value;
      groups[weekKey].count += 1;
    }

    return Object.entries(groups).map(([weekStart, stats]) => {
      const dateObj = new Date(weekStart);
      const formattedKey = isNaN(dateObj.getTime())
        ? weekStart
        : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
      return {
        key: `Wk of ${formattedKey}`,
        value: Number((stats.sum / stats.count).toFixed(1)),
      };
    });
  } else if (viewMode === "last7") {
    return mapped.slice(-7).map((point) => ({
      key: formatDateLabel(point.date),
      value: point.value,
    }));
  } else {
    return mapped.map((point) => ({
      key: formatDateLabel(point.date),
      value: point.value,
    }));
  }
}

export default function ProgressPage() {
  const meals = useMealCalories();
  // const workouts = useWorkoutProgress();
  
  // Date range states
  const [rangeMode, setRangeMode] = useState<"7d" | "30d" | "90d">("30d");
  const range = (() => {
    const to = new Date();
    const from = new Date(to);
    if (rangeMode === "7d") {
      from.setDate(to.getDate() - 6);
    } else if (rangeMode === "90d") {
      from.setDate(to.getDate() - 90);
    } else {
      from.setDate(to.getDate() - 30);
    }
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  })();

  const bodyMeasurements = useBodyMeasurements(range);
  const latestMeasurement = bodyMeasurements.data?.[0];
  const latestBodyFat = getBodyFat(latestMeasurement);
  const latestWeight = latestMeasurement?.weight_kg;

  // View state configuration
  const [weightViewMode, setWeightViewMode] = useState<"last7" | "all" | "weekly">("last7");
  const [biometricTab, setBiometricTab] = useState<"waist" | "bmi">("waist");
  const [biometricViewMode, setBiometricViewMode] = useState<"last7" | "all" | "weekly">("last7");

  // Calculate points dynamically from measurements query
  const weightPoints = getBiometricPoints(bodyMeasurements.data, "weight_kg", weightViewMode);
  const biometricPoints = getBiometricPoints(bodyMeasurements.data, biometricTab === "waist" ? "waist_cm" : "bmi", biometricViewMode);

  return (
    <AppShell title="Transformation Analytics" eyebrow="Momentum and measurements">
      {/* Date Range Selector Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-lime-200/10 bg-[#0b1710] px-4 py-3">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">Analysis Timeline</span>
        <div className="flex rounded-lg bg-slate-950/60 p-1 text-[0.68rem] font-bold text-slate-400">
          <button
            type="button"
            onClick={() => setRangeMode("7d")}
            className={`rounded-md px-3 py-1 transition cursor-pointer ${
              rangeMode === "7d" ? "bg-lime-300 text-slate-950" : "hover:text-white"
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setRangeMode("30d")}
            className={`rounded-md px-3 py-1 transition cursor-pointer ${
              rangeMode === "30d" ? "bg-lime-300 text-slate-950" : "hover:text-white"
            }`}
          >
            30 Days
          </button>
          <button
            type="button"
            onClick={() => setRangeMode("90d")}
            className={`rounded-md px-3 py-1 transition cursor-pointer ${
              rangeMode === "90d" ? "bg-lime-300 text-slate-950" : "hover:text-white"
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

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
          <p className="mt-2 text-3xl font-black">{formatNumber(latestWeight, "kg")}</p>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Meal calories" points={meals.data ? Object.entries(meals.data.by_meal_type).map(([key, value]) => ({ key, value })) : []} isLoading={meals.isLoading} />
        
        {/* Custom Body Weight Chart (rendered from body measurements) */}
        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#101b15] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-black">Body weight</h2>
            <div className="flex rounded-lg bg-slate-950/60 p-1 text-[0.68rem] font-bold text-slate-400">
              <button
                type="button"
                onClick={() => setWeightViewMode("last7")}
                className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                  weightViewMode === "last7" ? "bg-lime-300 text-slate-950" : "hover:text-white"
                }`}
              >
                Last 7
              </button>
              <button
                type="button"
                onClick={() => setWeightViewMode("all")}
                className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                  weightViewMode === "all" ? "bg-lime-300 text-slate-950" : "hover:text-white"
                }`}
              >
                All Logs
              </button>
              <button
                type="button"
                onClick={() => setWeightViewMode("weekly")}
                className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                  weightViewMode === "weekly" ? "bg-lime-300 text-slate-950" : "hover:text-white"
                }`}
              >
                Weekly Avg
              </button>
            </div>
          </div>
          
          <div className="mt-4 h-40 rounded-2xl bg-[#07120c] p-3">
            <EmptyChartState isLoading={bodyMeasurements.isLoading} points={weightPoints} />
            {!bodyMeasurements.isLoading && weightPoints.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightPoints} margin={{ left: -28, right: 4, top: 8, bottom: 0 }}>
                  <XAxis dataKey="key" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#07120c", border: "1px solid rgba(190,242,100,0.18)", borderRadius: 12, color: "#f8fafc" }} />
                  <Line type="monotone" dataKey="value" stroke="#bef264" strokeWidth={3} dot={{ fill: "#bef264", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </section>

        {/* Biometrics Chart Card (replaces workouts card, selectors for Waist & BMI) */}
        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#101b15] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-950/60 p-1 text-[0.68rem] font-bold text-slate-400">
              <button
                type="button"
                onClick={() => setBiometricTab("waist")}
                className={`rounded-md px-2.5 py-1.5 transition cursor-pointer ${
                  biometricTab === "waist" ? "bg-lime-300 text-slate-950" : "hover:text-white"
                }`}
              >
                Waist
              </button>
              <button
                type="button"
                onClick={() => setBiometricTab("bmi")}
                className={`rounded-md px-2.5 py-1.5 transition cursor-pointer ${
                  biometricTab === "bmi" ? "bg-lime-300 text-slate-950" : "hover:text-white"
                }`}
              >
                BMI
              </button>
            </div>
            
            <div className="flex rounded-lg bg-slate-950/60 p-1 text-[0.68rem] font-bold text-slate-400">
              <button
                type="button"
                onClick={() => setBiometricViewMode("last7")}
                className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                  biometricViewMode === "last7" ? "bg-lime-300 text-slate-950" : "hover:text-white"
                }`}
              >
                Last 7
              </button>
              <button
                type="button"
                onClick={() => setBiometricViewMode("all")}
                className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                  biometricViewMode === "all" ? "bg-lime-300 text-slate-950" : "hover:text-white"
                }`}
              >
                All Logs
              </button>
              <button
                type="button"
                onClick={() => setBiometricViewMode("weekly")}
                className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                  biometricViewMode === "weekly" ? "bg-lime-300 text-slate-950" : "hover:text-white"
                }`}
              >
                Weekly Avg
              </button>
            </div>
          </div>
          
          <div className="mt-4 h-40 rounded-2xl bg-[#07120c] p-3">
            <EmptyChartState isLoading={bodyMeasurements.isLoading} points={biometricPoints} />
            {!bodyMeasurements.isLoading && biometricPoints.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={biometricPoints} margin={{ left: -28, right: 4, top: 8, bottom: 0 }}>
                  <XAxis dataKey="key" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#07120c", border: "1px solid rgba(190,242,100,0.18)", borderRadius: 12, color: "#f8fafc" }} />
                  <Line type="monotone" dataKey="value" stroke="#bef264" strokeWidth={3} dot={{ fill: "#bef264", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </section>
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
