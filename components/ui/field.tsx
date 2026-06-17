import type { FieldInputProps, FormikErrors, FormikTouched } from "formik";
import { AnimatePresence, motion } from "motion/react";
import type { HTMLAttributes } from "react";

type FieldProps<T> = Readonly<{
  label: string;
  field: FieldInputProps<string>;
  errors: FormikErrors<T>;
  touched: FormikTouched<T>;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  placeholder?: string;
}>;

export function TextField<T extends object>({ label, field, errors, touched, type = "text", inputMode, autoComplete, placeholder }: FieldProps<T>) {
  const fieldName = field.name as keyof T;
  const error = touched[fieldName] && errors[fieldName];

  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <input
        {...field}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-lime-300/70"
      />
      <div className="h-5">
        <AnimatePresence initial={false}>
          {typeof error === "string" ? (
            <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="block text-sm font-semibold text-red-300">
              {error}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </label>
  );
}
