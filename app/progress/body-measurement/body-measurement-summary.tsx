"use client";

import { useBodyMeasurements } from "@/features/progress/hooks";
import type { BodyMeasurement } from "@/features/progress/types";

function formatNumber(value: number | undefined, suffix: string) {
  return typeof value === "number" ? `${value.toFixed(1)} ${suffix}` : "--";
}

function getMeasurementCards(measurement: BodyMeasurement | undefined) {
  const bodyFat = measurement?.body_fat_percentage ?? measurement?.body_fat_percent;

  return [
    { label: "Weight", value: formatNumber(measurement?.weight_kg, "kg") },
    { label: "BMI", value: typeof measurement?.bmi === "number" ? measurement.bmi.toFixed(1) : "--" },
    { label: "Body fat", value: typeof bodyFat === "number" ? `${bodyFat.toFixed(1)}%` : "--" },
    { label: "Waist", value: formatNumber(measurement?.waist_cm, "cm") },
  ];
}

export function BodyMeasurementSummary() {
  const measurementsQuery = useBodyMeasurements();
  const measurements = measurementsQuery.data ?? [];
  const latest = measurements[0];
  const cards = getMeasurementCards(latest);
  const chartValues = measurements.slice(0, 7).reverse();

  return (
    <>
      <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#0b1710] p-4 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-5">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Current trend</p>
          <h2 className="mt-2 text-3xl font-black lg:text-5xl">{formatNumber(latest?.weight_kg, "kg")}</h2>
          <p className="mt-1 text-xs font-bold text-lime-200">
            {measurementsQuery.isLoading ? "Loading measurements..." : latest ? `Latest entry: ${latest.date ?? latest.log_date}` : "No measurements found for this week"}
          </p>
          <div className="mt-5 flex h-36 items-end gap-2 rounded-2xl bg-lime-300/10 p-3 lg:h-56">
            {chartValues.length ? (
              chartValues.map((item, index) => (
                <div key={item.id ?? `${item.date ?? item.log_date}-${index}`} className="flex-1 rounded-t-xl bg-lime-300/80" style={{ height: `${Math.max(18, Math.min(100, item.weight_kg))}%` }} />
              ))
            ) : (
              <div className="grid flex-1 place-items-center text-center text-xs font-bold text-slate-500">Add measurements to build your trend</div>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-0">
          {cards.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/5 bg-[#101b15] p-4">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-black">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-black">Measurement History</h2>
          <span className="text-[0.65rem] font-black text-lime-200">This week</span>
        </div>
        <div className="space-y-2">
          {measurementsQuery.isError ? <p className="rounded-2xl bg-red-400/10 p-3 text-sm font-semibold text-red-200">Could not load body measurements.</p> : null}
          {!measurementsQuery.isLoading && !measurements.length ? <p className="rounded-2xl bg-[#101b15] p-3 text-sm font-bold text-slate-500">No measurements in the selected range.</p> : null}
          {measurements.map((row, index) => (
            <div key={row.id ?? `${row.date ?? row.log_date}-${index}`} className="grid grid-cols-3 rounded-2xl border border-white/5 bg-[#101b15] p-3 text-sm">
              <span className="font-black text-slate-400">{row.date ?? row.log_date}</span>
              <span className="font-black text-white">{formatNumber(row.weight_kg, "kg")}</span>
              <span className="text-right font-black text-lime-200">{typeof (row.body_fat_percentage ?? row.body_fat_percent) === "number" ? `${(row.body_fat_percentage ?? row.body_fat_percent)?.toFixed(1)}%` : "--"}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
