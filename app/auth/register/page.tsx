"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field, Form, Formik, type FieldInputProps } from "formik";
import { TextField } from "@/components/ui/field";
import { getSafeAuthErrorMessage } from "@/features/auth/errors";
import { useRegister } from "@/features/auth/hooks";
import type { RegisterInput } from "@/features/auth/types";

const initialValues: RegisterInput = { name: "", email: "", password: "" };

const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "At least 1 uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "At least 1 lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "At least 1 number", test: (value: string) => /\d/.test(value) },
  { label: "At least 1 special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

function isPasswordValid(password: string) {
  return passwordRules.every((rule) => rule.test(password));
}

function PasswordRules({ password }: Readonly<{ password: string }>) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-sm">
      <p className="mb-2 font-bold text-slate-200">Password must include:</p>
      <div className="space-y-1.5">
        {passwordRules.map((rule) => {
          const passed = rule.test(password);

          return (
            <p key={rule.label} className={passed ? "font-semibold text-lime-200" : "font-semibold text-slate-400"}>
              {passed ? "OK" : "--"} {rule.label}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur">
        <Link href="/" className="mb-8 block text-2xl font-black">
          FitFlow
        </Link>
        <h1 className="mb-2 text-4xl font-black tracking-[-0.04em]">Create account</h1>
        <p className="mb-8 text-slate-300">Start with auth-ready forms that target the Go backend routes in the spec.</p>
        <Formik
          initialValues={initialValues}
          validate={(values) => {
            const errors: Partial<RegisterInput> = {};
            const email = values.email.trim();
            if (!values.name.trim()) errors.name = "Name is required";
            if (!email) errors.email = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
            if (!values.password) errors.password = "Password is required";
            else if (!isPasswordValid(values.password)) errors.password = "Password does not meet the rules below";
            return errors;
          }}
          onSubmit={(values, helpers) => {
            register.mutate(
              { ...values, name: values.name.trim(), email: values.email.trim().toLowerCase() },
              {
                onSuccess: () => {
                  router.push("/auth/login?registered=1");
                },
                onSettled: () => helpers.setSubmitting(false),
              },
            );
          }}
        >
          {({ errors, touched, isSubmitting, values }) => (
            <Form noValidate className="space-y-5">
              <Field name="name">{({ field }: { field: FieldInputProps<string> }) => <TextField<RegisterInput> field={field} errors={errors} touched={touched} label="Name" autoComplete="name" placeholder="Alex" />}</Field>
              <Field name="email">{({ field }: { field: FieldInputProps<string> }) => <TextField<RegisterInput> field={field} errors={errors} touched={touched} label="Email" inputMode="email" autoComplete="email" placeholder="you@example.com" />}</Field>
              <Field name="password">{({ field }: { field: FieldInputProps<string> }) => <TextField<RegisterInput> field={field} errors={errors} touched={touched} label="Password" type="password" autoComplete="new-password" />}</Field>
              <PasswordRules password={values.password} />
              {register.isError ? <p className="rounded-2xl bg-red-400/10 p-3 text-sm font-semibold text-red-200">{getSafeAuthErrorMessage(register.error, "We could not create your account with those details. Please try again.")}</p> : null}
              <button type="submit" disabled={isSubmitting || register.isPending} className="w-full rounded-2xl bg-lime-300 px-5 py-3 font-black text-slate-950 disabled:opacity-60">
                {register.isPending ? "Creating..." : "Create account"}
              </button>
            </Form>
          )}
        </Formik>
        <p className="mt-6 text-center text-sm text-slate-300">
          Already have an account? <Link className="font-bold text-lime-200" href="/auth/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
