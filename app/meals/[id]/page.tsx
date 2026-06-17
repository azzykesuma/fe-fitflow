"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { useDeleteMealLog, useMealLog } from "@/features/meals/hooks";

export default function MealDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const meal = useMealLog(unwrappedParams.id);
  const deleteMeal = useDeleteMealLog();
  const deleteStarted = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function onDelete() {
    if (deleteStarted.current || deleteMeal.isPending) {
      return;
    }

    deleteStarted.current = true;
    setIsDeleting(true);
    deleteMeal.mutate(unwrappedParams.id, {
      onSuccess: () => {
        toast.success("Meal deleted.");
        router.push("/meals");
      },
      onError: () => {
        deleteStarted.current = false;
        setIsDeleting(false);
        toast.error("Could not delete meal.");
      },
    });
  }

  return (
    <AppShell title="Meal Detail" eyebrow={unwrappedParams.id}>
      {meal.isLoading ? <p className="rounded-2xl bg-[#101b15] p-4 text-sm font-bold text-slate-400">Loading meal...</p> : null}
      {meal.isError ? <p className="rounded-2xl bg-red-400/10 p-4 text-sm font-bold text-red-200">Could not load this meal log.</p> : null}
      {meal.data ? (
        <section className="rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-lime-200">{meal.data.meal_type}</p>
          <h2 className="mt-2 text-3xl font-black">{meal.data.food_name}</h2>
          <p className="mt-1 text-sm font-bold text-slate-400">{meal.data.meal_date}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#101b15] p-3"><p className="text-xs text-slate-500">Calories</p><p className="text-2xl font-black">{meal.data.calories}</p></div>
            <div className="rounded-2xl bg-[#101b15] p-3"><p className="text-xs text-slate-500">Protein</p><p className="text-2xl font-black">{meal.data.protein_g}g</p></div>
            <div className="rounded-2xl bg-[#101b15] p-3"><p className="text-xs text-slate-500">Carbs</p><p className="text-2xl font-black">{meal.data.carbs_g}g</p></div>
            <div className="rounded-2xl bg-[#101b15] p-3"><p className="text-xs text-slate-500">Fat</p><p className="text-2xl font-black">{meal.data.fat_g}g</p></div>
          </div>
          {meal.data.notes ? <p className="mt-4 rounded-2xl bg-[#101b15] p-3 text-sm font-bold text-slate-300">{meal.data.notes}</p> : null}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href={`/meals/${unwrappedParams.id}/edit`} className="rounded-2xl bg-lime-300 px-5 py-3 text-center font-black text-slate-950">Edit</Link>
            <button
              type="button"
              disabled={isDeleting || deleteMeal.isPending}
              onClick={onDelete}
              className="rounded-2xl border border-red-300/30 px-5 py-3 font-black text-red-100 disabled:opacity-60"
            >
              {isDeleting || deleteMeal.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
