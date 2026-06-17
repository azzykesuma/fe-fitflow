"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useMealCalories } from "@/features/meals/hooks";
import { MealLogForm } from "./meal-log-form";

const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;

export default function MealsPage() {
  const calories = useMealCalories();
  const summary = calories.data;

  return (
    <AppShell title="Meal Logs" eyebrow="Calories and macros">
      <section className="mb-4 rounded-[1.35rem] border border-lime-200/10 bg-[#0b1710] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Today calories</p>
            <h2 className="mt-2 text-4xl font-black">{summary ? summary.total_calories : "--"}</h2>
            <p className="mt-1 text-xs font-bold text-lime-200">{summary?.date ?? "Loading daily summary"}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/meals/list" className="rounded-xl bg-lime-300 px-4 py-3 text-xs font-black text-slate-950">List</Link>
            <Link href="/meals/search" className="rounded-xl border border-lime-200/20 px-4 py-3 text-xs font-black text-lime-200">Find</Link>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {mealTypes.map((type) => (
            <article key={type} className="rounded-2xl bg-[#101b15] p-3">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{type}</p>
              <p className="mt-1 text-xl font-black">{summary?.by_meal_type[type] ?? 0}</p>
            </article>
          ))}
        </div>
      </section>

      <MealLogForm />
    </AppShell>
  );
}
