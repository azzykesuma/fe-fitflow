"use client";

import { use } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useMealLog } from "@/features/meals/hooks";
import { MealLogForm } from "../../meal-log-form";

export default function EditMealPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const meal = useMealLog(id);

  return (
    <AppShell title="Edit Meal" eyebrow={id}>
      {meal.isLoading ? <p className="rounded-2xl bg-[#101b15] p-4 text-sm font-bold text-slate-400">Loading meal...</p> : null}
      {meal.isError ? <p className="rounded-2xl bg-red-400/10 p-4 text-sm font-bold text-red-200">Could not load this meal log.</p> : null}
      {meal.data ? <MealLogForm meal={meal.data} /> : null}
    </AppShell>
  );
}
