"use client";

import { useRouter } from "next/navigation";
import { Field, Form, Formik, type FieldInputProps } from "formik";
import { AppShell } from "@/components/layout/app-shell";
import { TextField } from "@/components/ui/field";
import { useCreateWorkoutPlan } from "@/features/workouts/hooks";
import type { CreateWorkoutPlanInput } from "@/features/workouts/types";

const initialValues: CreateWorkoutPlanInput = { name: "", description: "", scheduled_day: "Monday" };

export default function NewWorkoutPage() {
  const router = useRouter();
  const createWorkoutPlan = useCreateWorkoutPlan();

  return (
    <AppShell title="Create workout" eyebrow="Planner">
      <section className="max-w-2xl rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
        <Formik
          initialValues={initialValues}
          validate={(values) => {
            const errors: Partial<CreateWorkoutPlanInput> = {};
            if (!values.name) errors.name = "Workout name is required";
            return errors;
          }}
          onSubmit={(values, helpers) => {
            createWorkoutPlan.mutate(values, {
              onSuccess: () => {
                router.push("/workouts");
              },
              onSettled: () => helpers.setSubmitting(false),
            });
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-5">
              <Field name="name">{({ field }: { field: FieldInputProps<string> }) => <TextField<CreateWorkoutPlanInput> field={field} errors={errors} touched={touched} label="Plan name" placeholder="Pull Day" />}</Field>
              <Field name="description">{({ field }: { field: FieldInputProps<string> }) => <TextField<CreateWorkoutPlanInput> field={field} errors={errors} touched={touched} label="Description" placeholder="Back, biceps, rear delts" />}</Field>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-200">Scheduled day</span>
                <Field as="select" name="scheduled_day" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-lime-300/70">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => <option key={day} value={day}>{day}</option>)}
                </Field>
              </label>
              {createWorkoutPlan.isError ? <p className="rounded-2xl bg-red-400/10 p-3 text-sm font-semibold text-red-200">Could not create workout. Start the backend API and try again.</p> : null}
              <button disabled={isSubmitting || createWorkoutPlan.isPending} className="rounded-2xl bg-lime-300 px-5 py-3 font-black text-slate-950 disabled:opacity-60" type="submit">
                {createWorkoutPlan.isPending ? "Saving..." : "Save workout"}
              </button>
            </Form>
          )}
        </Formik>
      </section>
    </AppShell>
  );
}
