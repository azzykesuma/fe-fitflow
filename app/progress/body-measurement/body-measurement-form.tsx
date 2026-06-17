"use client";

import { Field, Form, Formik } from "formik";
import { toast } from "sonner";
import { useCreateBodyMeasurement } from "@/features/progress/hooks";
import type { CreateBodyMeasurementInput } from "@/features/progress/types";

type NumericFieldName = Exclude<keyof BodyMeasurementFormValues, "log_date" | "notes">;

type BodyMeasurementFormValues = {
  weight_kg: string | number;
  neck_cm: string | number;
  shoulder_cm: string | number;
  chest_cm: string | number;
  waist_cm: string | number;
  belly_cm: string | number;
  hips_cm: string | number;
  left_bicep_cm: string | number;
  right_bicep_cm: string | number;
  left_forearm_cm: string | number;
  right_forearm_cm: string | number;
  left_thigh_cm: string | number;
  right_thigh_cm: string | number;
  left_calf_cm: string | number;
  right_calf_cm: string | number;
  notes: string;
  log_date: string;
};

const today = new Date().toISOString().slice(0, 10);

const initialValues: BodyMeasurementFormValues = {
  weight_kg: "",
  neck_cm: "",
  shoulder_cm: "",
  chest_cm: "",
  waist_cm: "",
  belly_cm: "",
  hips_cm: "",
  left_bicep_cm: "",
  right_bicep_cm: "",
  left_forearm_cm: "",
  right_forearm_cm: "",
  left_thigh_cm: "",
  right_thigh_cm: "",
  left_calf_cm: "",
  right_calf_cm: "",
  notes: "",
  log_date: today,
};

const fields: Array<{ name: NumericFieldName; label: string; suffix: string }> = [
  { name: "weight_kg", label: "Weight", suffix: "kg" },
  { name: "neck_cm", label: "Neck", suffix: "cm" },
  { name: "shoulder_cm", label: "Shoulder", suffix: "cm" },
  { name: "chest_cm", label: "Chest", suffix: "cm" },
  { name: "waist_cm", label: "Waist", suffix: "cm" },
  { name: "belly_cm", label: "Belly", suffix: "cm" },
  { name: "hips_cm", label: "Hips", suffix: "cm" },
  { name: "left_bicep_cm", label: "Left bicep", suffix: "cm" },
  { name: "right_bicep_cm", label: "Right bicep", suffix: "cm" },
  { name: "left_forearm_cm", label: "Left forearm", suffix: "cm" },
  { name: "right_forearm_cm", label: "Right forearm", suffix: "cm" },
  { name: "left_thigh_cm", label: "Left thigh", suffix: "cm" },
  { name: "right_thigh_cm", label: "Right thigh", suffix: "cm" },
  { name: "left_calf_cm", label: "Left calf", suffix: "cm" },
  { name: "right_calf_cm", label: "Right calf", suffix: "cm" },
];

function toTrimmedString(value: string | number) {
  return String(value ?? "").trim();
}

function toRequiredNumber(value: string | number) {
  return Number(toTrimmedString(value));
}

function toPayload(values: BodyMeasurementFormValues): CreateBodyMeasurementInput {
  return {
    weight_kg: toRequiredNumber(values.weight_kg),
    neck_cm: toRequiredNumber(values.neck_cm),
    shoulder_cm: toRequiredNumber(values.shoulder_cm),
    chest_cm: toRequiredNumber(values.chest_cm),
    waist_cm: toRequiredNumber(values.waist_cm),
    belly_cm: toRequiredNumber(values.belly_cm),
    hips_cm: toRequiredNumber(values.hips_cm),
    left_bicep_cm: toRequiredNumber(values.left_bicep_cm),
    right_bicep_cm: toRequiredNumber(values.right_bicep_cm),
    left_forearm_cm: toRequiredNumber(values.left_forearm_cm),
    right_forearm_cm: toRequiredNumber(values.right_forearm_cm),
    left_thigh_cm: toRequiredNumber(values.left_thigh_cm),
    right_thigh_cm: toRequiredNumber(values.right_thigh_cm),
    left_calf_cm: toRequiredNumber(values.left_calf_cm),
    right_calf_cm: toRequiredNumber(values.right_calf_cm),
    notes: values.notes.trim(),
    log_date: values.log_date,
  };
}

export function BodyMeasurementForm() {
  const createBodyMeasurement = useCreateBodyMeasurement();

  return (
    <section className="mt-4 rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
      <div className="mb-4">
        <h2 className="text-base font-black">Add measurement</h2>
        <p className="mt-1 text-xs font-bold text-slate-500">All measurements are required so the backend can calculate BMI and body fat consistently.</p>
      </div>
      <Formik
        initialValues={initialValues}
        validate={(values) => {
          const errors: Partial<Record<keyof BodyMeasurementFormValues, string>> = {};

          if (!values.log_date) errors.log_date = "Date is required";
          if (!values.notes.trim()) errors.notes = "Notes are required";

          for (const field of fields) {
            const value = toTrimmedString(values[field.name]);
            if (!value) {
              errors[field.name] = "Required";
            } else if (Number.isNaN(Number(value)) || Number(value) <= 0) {
              errors[field.name] = "Use a positive number";
            }
          }

          return errors;
        }}
        onSubmit={(values, helpers) => {
          createBodyMeasurement.mutate(toPayload(values), {
            onSuccess: () => {
              toast.success("Body measurement saved.");
              helpers.resetForm({ values: { ...initialValues, log_date: values.log_date } });
            },
            onError: () => toast.error("Could not save body measurement. Please try again."),
            onSettled: () => helpers.setSubmitting(false),
          });
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form noValidate className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-200">Date</span>
              <Field name="log_date" type="date" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-lime-300/70" />
              <span className="block h-5 text-sm font-semibold text-red-300">{touched.log_date && errors.log_date ? errors.log_date : ""}</span>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.name} className="block space-y-2">
                  <span className="text-sm font-bold text-slate-200">{field.label}</span>
                  <div className="flex rounded-2xl border border-white/10 bg-slate-950/70 focus-within:border-lime-300/70">
                    <Field name={field.name} type="number" step="0.1" min="0" inputMode="decimal" className="min-w-0 flex-1 rounded-l-2xl bg-transparent px-4 py-3 text-white outline-none" />
                    <span className="grid place-items-center px-3 text-xs font-black text-slate-500">{field.suffix}</span>
                  </div>
                  <span className="block h-5 text-sm font-semibold text-red-300">{touched[field.name] && errors[field.name] ? errors[field.name] : ""}</span>
                </label>
              ))}
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-200">Notes</span>
              <Field as="textarea" name="notes" rows={3} className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-lime-300/70" placeholder="Morning measurement" />
              <span className="block h-5 text-sm font-semibold text-red-300">{touched.notes && errors.notes ? errors.notes : ""}</span>
            </label>

            <button type="submit" disabled={isSubmitting || createBodyMeasurement.isPending} className="w-full rounded-2xl bg-lime-300 px-5 py-3 font-black text-slate-950 disabled:opacity-60">
              {createBodyMeasurement.isPending ? "Saving..." : "Save measurement"}
            </button>
          </Form>
        )}
      </Formik>
    </section>
  );
}
