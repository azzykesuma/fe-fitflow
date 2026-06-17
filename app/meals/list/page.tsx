"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useMealCalories, useMealLogs } from "@/features/meals/hooks";

const today = new Date().toISOString().slice(0, 10);

export default function MealListPage() {
  const [date, setDate] = useState(today);
  const meals = useMealLogs(date);
  const calories = useMealCalories(date);

  return (
    <AppShell title="Meal History" eyebrow="Browse logged meals">
      <section className="mb-4 rounded-[1.35rem] border border-lime-200/10 bg-[#0b1710] p-4">
        <div className="flex items-end justify-between gap-3">
          <label className="block flex-1 space-y-2">
            <span className="text-sm font-bold text-slate-200">Date</span>
            <input value={date} onChange={(event) => setDate(event.target.value)} type="date" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-lime-300/70" />
          </label>
          <Link href="/meals" className="rounded-2xl bg-lime-300 px-4 py-3 text-xs font-black text-slate-950">Add meal</Link>
        </div>
        <div className="mt-4 rounded-2xl bg-[#101b15] p-4">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Total calories</p>
          <p className="mt-2 text-3xl font-black">{calories.data?.total_calories ?? "--"}</p>
        </div>
      </section>

      <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-black">Meals</h2>
          <span className="text-[0.65rem] font-black text-lime-200">{date}</span>
        </div>
        <div className="space-y-3">
          {meals.isLoading ? <p className="rounded-2xl bg-[#101b15] p-3 text-sm font-bold text-slate-500">Loading meals...</p> : null}
          {meals.isError ? <p className="rounded-2xl bg-red-400/10 p-3 text-sm font-bold text-red-200">Could not load meal logs.</p> : null}
          {!meals.isLoading && !meals.isError && !meals.data?.length ? <p className="rounded-2xl bg-[#101b15] p-3 text-sm font-bold text-slate-500">No meals logged for this date.</p> : null}
          {meals.data?.map((meal) => (
            <Link key={meal.id} href={`/meals/${meal.id}`} className="block rounded-2xl border border-white/5 bg-[#101b15] p-4 transition hover:border-lime-300/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-lime-200">{meal.meal_type}</p>
                  <h3 className="mt-1 text-base font-black text-white">{meal.food_name}</h3>
                  <p className="mt-1 text-xs font-bold text-slate-500">P {meal.protein_g}g · C {meal.carbs_g}g · F {meal.fat_g}g</p>
                </div>
                <span className="rounded-full bg-lime-300 px-3 py-1 text-xs font-black text-slate-950">{meal.calories}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
