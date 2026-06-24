"use client";

import { Field, Form, Formik } from "formik";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth/hooks";
import { uploadProgressPhoto } from "@/features/progress/api";
import { useCreateBodyMeasurement } from "@/features/progress/hooks";
import type { CreateBodyMeasurementInput } from "@/features/progress/types";
import { Button } from "@/components/ui/button";

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

function toPayload(values: BodyMeasurementFormValues, photoUrl?: string): CreateBodyMeasurementInput {
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
    image_url: photoUrl,
  };
}

// ─── Photo Upload Widget ─────────────────────────────────────────────────────

function PhotoUpload({
  file,
  preview,
  uploading,
  onFileChange,
  onRemove,
}: {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  onFileChange: (f: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) onFileChange(dropped);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) onFileChange(selected);
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-bold text-slate-200">
        Progress photo{" "}
        <span className="font-normal text-slate-500">(optional)</span>
      </span>

      {preview ? (
        /* ── Preview state ── */
        <div className="relative overflow-hidden rounded-2xl border border-lime-300/20 bg-slate-950/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Progress photo preview"
            className="h-48 w-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <span className="flex items-center gap-2 text-sm font-bold text-lime-300">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Uploading…
              </span>
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-slate-300 transition hover:bg-red-500 hover:text-white"
              aria-label="Remove photo"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          {!uploading && (
            <p className="px-4 py-2 text-xs text-slate-500">
              {file?.name}
            </p>
          )}
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload progress photo"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition",
            dragging
              ? "border-lime-300/60 bg-lime-300/5"
              : "border-white/10 bg-slate-950/40 hover:border-lime-300/30 hover:bg-slate-950/60",
          ].join(" ")}
        >
          {/* Camera icon */}
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-slate-300">
              Drop a photo here, or{" "}
              <span className="text-lime-400">browse</span>
            </p>
            <p className="mt-1 text-xs text-slate-600">PNG, JPG, WEBP up to 10 MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
      />
    </div>
  );
}

// ─── Main Form ───────────────────────────────────────────────────────────────

export function BodyMeasurementForm() {
  const createBodyMeasurement = useCreateBodyMeasurement();
  const { data: currentUser } = useCurrentUser();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleFileChange(file: File) {
    setPhotoFile(file);
    // Use FileReader instead of createObjectURL — data: URLs are not
    // subject to CSP blob: restrictions and render reliably in Next.js.
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  return (
    <section className="mt-4 rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
      <div className="mb-4">
        <h2 className="text-base font-black">Add measurement</h2>
        <p className="mt-1 text-xs font-bold text-slate-500">
          All measurements are required so the backend can calculate BMI and body fat consistently.
        </p>
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
        onSubmit={async (values, helpers) => {
          try {
            let photoUrl: string | undefined;

            // Upload photo first if one was selected
            if (photoFile) {
              const userId = currentUser?.id ?? "anonymous";
              setUploading(true);
              try {
                photoUrl = await uploadProgressPhoto(userId, photoFile);
              } catch {
                toast.error("Photo upload failed. Saving measurement without photo.");
              } finally {
                setUploading(false);
              }
            }

            createBodyMeasurement.mutate(toPayload(values, photoUrl), {
              onSuccess: () => {
                toast.success("Body measurement saved.");
                handleRemovePhoto();
                helpers.resetForm({ values: { ...initialValues, log_date: values.log_date } });
              },
              onError: () => toast.error("Could not save body measurement. Please try again."),
              onSettled: () => helpers.setSubmitting(false),
            });
          } catch {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form noValidate className="space-y-4">
            {/* Date */}
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-200">Date</span>
              <Field
                name="log_date"
                type="date"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-lime-300/70"
              />
              <span className="block h-5 text-sm font-semibold text-red-300">
                {touched.log_date && errors.log_date ? errors.log_date : ""}
              </span>
            </label>

            {/* Measurement fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.name} className="block space-y-2">
                  <span className="text-sm font-bold text-slate-200">{field.label}</span>
                  <div className="flex rounded-2xl border border-white/10 bg-slate-950/70 focus-within:border-lime-300/70">
                    <Field
                      name={field.name}
                      type="number"
                      step="0.1"
                      min="0"
                      inputMode="decimal"
                      className="min-w-0 flex-1 rounded-l-2xl bg-transparent px-4 py-3 text-white outline-none"
                    />
                    <span className="grid place-items-center px-3 text-xs font-black text-slate-500">
                      {field.suffix}
                    </span>
                  </div>
                  <span className="block h-5 text-sm font-semibold text-red-300">
                    {touched[field.name] && errors[field.name] ? errors[field.name] : ""}
                  </span>
                </label>
              ))}
            </div>

            {/* Notes */}
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-200">Notes</span>
              <Field
                as="textarea"
                name="notes"
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-lime-300/70"
                placeholder="Morning measurement"
              />
              <span className="block h-5 text-sm font-semibold text-red-300">
                {touched.notes && errors.notes ? errors.notes : ""}
              </span>
            </label>

            {/* Photo upload */}
            <PhotoUpload
              file={photoFile}
              preview={photoPreview}
              uploading={uploading}
              onFileChange={handleFileChange}
              onRemove={handleRemovePhoto}
            />

            <Button
              type="submit"
              disabled={isSubmitting || createBodyMeasurement.isPending || uploading}
              className="w-full rounded-2xl bg-lime-300 px-5 py-3 font-black text-slate-950 disabled:opacity-60"
            >
              {uploading
                ? "Uploading photo…"
                : createBodyMeasurement.isPending
                ? "Saving…"
                : "Save measurement"}
            </Button>
          </Form>
        )}
      </Formik>
    </section>
  );
}
