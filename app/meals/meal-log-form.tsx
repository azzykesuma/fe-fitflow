"use client";

import { Field, Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateMealLog, useUpdateMealLog } from "@/features/meals/hooks";
import type { MealLog, MealLogInput, MealType } from "@/features/meals/types";
import { Button } from "@/components/ui/button";

type MealFormValues = {
  meal_date: string;
  meal_type: MealType;
  food_name: string;
  calories: string | number;
  protein_g: string | number;
  carbs_g: string | number;
  fat_g: string | number;
  notes: string;
};

const today = new Date().toISOString().slice(0, 10);

const numberFields = [
  { name: "calories", label: "Calories", suffix: "kcal" },
  { name: "protein_g", label: "Protein", suffix: "g" },
  { name: "carbs_g", label: "Carbs", suffix: "g" },
  { name: "fat_g", label: "Fat", suffix: "g" },
] as const;

function toNumber(value: string | number) {
  return Number(String(value ?? "").trim());
}

function toInitialValues(meal?: MealLog): MealFormValues {
  return {
    meal_date: meal?.meal_date ?? today,
    meal_type: meal?.meal_type ?? "breakfast",
    food_name: meal?.food_name ?? "",
    calories: meal?.calories ?? "",
    protein_g: meal?.protein_g ?? "",
    carbs_g: meal?.carbs_g ?? "",
    fat_g: meal?.fat_g ?? "",
    notes: meal?.notes ?? "",
  };
}

function toPayload(values: MealFormValues): MealLogInput {
  return {
    meal_date: values.meal_date,
    meal_type: values.meal_type,
    food_name: values.food_name.trim(),
    calories: toNumber(values.calories),
    protein_g: toNumber(values.protein_g),
    carbs_g: toNumber(values.carbs_g),
    fat_g: toNumber(values.fat_g),
    notes: values.notes.trim(),
  };
}

export function MealLogForm({ meal }: Readonly<{ meal?: MealLog }>) {
  const router = useRouter();
  const createMealLog = useCreateMealLog();
  const updateMealLog = useUpdateMealLog(meal?.id ?? "");
  const mutation = meal ? updateMealLog : createMealLog;

  return (
    <Formik
      enableReinitialize
      initialValues={toInitialValues(meal)}
      validate={(values) => {
        const errors: Partial<Record<keyof MealFormValues, string>> = {};
        if (!values.meal_date) errors.meal_date = "Date is required";
        if (!values.food_name.trim()) errors.food_name = "Food name is required";

        for (const field of numberFields) {
          const value = String(values[field.name] ?? "").trim();
          if (!value) errors[field.name] = "Required";
          else if (Number.isNaN(Number(value)) || Number(value) < 0) errors[field.name] = "Use zero or a positive number";
        }

        return errors;
      }}
      onSubmit={(values, helpers) => {
        mutation.mutate(toPayload(values), {
          onSuccess: (savedMeal) => {
            toast.success(meal ? "Meal log updated." : "Meal log created.");
            router.push(`/meals/${savedMeal.id}`);
          },
          onError: () => toast.error("Could not save meal log. Please try again."),
          onSettled: () => helpers.setSubmitting(false),
        });
      }}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form noValidate className="space-y-4 rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-200">Meal date</span>
              <Field name="meal_date" type="date" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-lime-300/70" />
              <span className="block h-5 text-sm font-semibold text-red-300">{touched.meal_date && errors.meal_date ? errors.meal_date : ""}</span>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-200">Meal type</span>
              <Field as="select" name="meal_type" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-lime-300/70">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </Field>
              <span className="block h-5" />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-200">Food name</span>
            <Field name="food_name" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-lime-300/70" placeholder="Oatmeal with banana" />
            <span className="block h-5 text-sm font-semibold text-red-300">{touched.food_name && errors.food_name ? errors.food_name : ""}</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {numberFields.map((field) => (
              <label key={field.name} className="block space-y-2">
                <span className="text-sm font-bold text-slate-200">{field.label}</span>
                <div className="flex rounded-2xl border border-white/10 bg-slate-950/70 focus-within:border-lime-300/70">
                  <Field name={field.name} type="number" min="0" step="0.1" className="min-w-0 flex-1 rounded-l-2xl bg-transparent px-4 py-3 text-white outline-none" />
                  <span className="grid place-items-center px-3 text-xs font-black text-slate-500">{field.suffix}</span>
                </div>
                <span className="block h-5 text-sm font-semibold text-red-300">{touched[field.name] && errors[field.name] ? errors[field.name] : ""}</span>
              </label>
            ))}
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-200">Notes</span>
            <Field as="textarea" name="notes" rows={3} className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-lime-300/70" placeholder="Pre-workout meal" />
          </label>

          <Button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full rounded-2xl bg-lime-300 px-5 py-3 font-black text-slate-950 disabled:opacity-60">
            {mutation.isPending ? "Saving..." : meal ? "Update meal" : "Create meal"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
