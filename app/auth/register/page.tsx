"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field, Form, Formik, type FieldInputProps } from "formik";
import { TextField } from "@/components/ui/field";
import { MaleIcon, FemaleIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

import { useRegister } from "@/features/auth/hooks";
import type { RegisterInput } from "@/features/auth/types";
import { validateRegister, passwordRules } from "@/features/auth/validation";

const initialValues: RegisterInput = { name: "", email: "", password: "", gender: "male" };

// Optimized PasswordRules component using React.memo to prevent unnecessary re-renders
const PasswordRules = React.memo(function PasswordRules({ password }: Readonly<{ password: string }>) {
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
});

// Standalone GenderSelector component optimized with React.memo
interface GenderSelectorProps {
  value: "male" | "female";
  onChange: (value: "male" | "female") => void;
}

const GenderSelector = React.memo(function GenderSelector({ value, onChange }: Readonly<GenderSelectorProps>) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        onClick={() => onChange("male")}
        className={`flex items-center justify-center gap-2 rounded-2xl border py-3 transition-all duration-300 cursor-pointer ${
          value === "male"
            ? "border-lime-300 bg-lime-300/10 text-lime-200 shadow-[0_0_15px_rgba(190,242,100,0.12)]"
            : "border-white/10 bg-slate-950/40 text-slate-500 hover:border-white/20 hover:text-slate-300"
        }`}
      >
        <MaleIcon className="size-4" />
        <span className="text-xs font-black uppercase tracking-wider">Male</span>
      </Button>
      <Button
        type="button"
        onClick={() => onChange("female")}
        className={`flex items-center justify-center gap-2 rounded-2xl border py-3 transition-all duration-300 cursor-pointer ${
          value === "female"
            ? "border-lime-300 bg-lime-300/10 text-lime-200 shadow-[0_0_15px_rgba(190,242,100,0.12)]"
            : "border-white/10 bg-slate-950/40 text-slate-500 hover:border-white/20 hover:text-slate-300"
        }`}
      >
        <FemaleIcon className="size-4" />
        <span className="text-xs font-black uppercase tracking-wider">Female</span>
      </Button>
    </div>
  );
});

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-md rounded-4xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur">
        <Link href="/" className="mb-8 block text-2xl font-black">
          FitFlow
        </Link>
        <h1 className="mb-2 text-4xl font-black tracking-[-0.04em]">Create account</h1>
        <p className="mb-8 text-slate-300">Start with auth-ready forms that target the Go backend routes in the spec.</p>
        <Formik
          initialValues={initialValues}
          validate={validateRegister}
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
          {({ errors, touched, isSubmitting, values, setFieldValue }) => {
            // Memoize onChange function for GenderSelector to prevent re-creation
            const handleGenderChange = useCallback((val: "male" | "female") => {
              setFieldValue("gender", val);
            }, [setFieldValue]);

            return (
              <Form noValidate className="space-y-5">
                <Field name="name">
                  {({ field }: { field: FieldInputProps<string> }) => (
                    <TextField<RegisterInput>
                      field={field}
                      errors={errors}
                      touched={touched}
                      label="Name"
                      autoComplete="name"
                      placeholder="Alex"
                    />
                  )}
                </Field>
                
                <Field name="email">
                  {({ field }: { field: FieldInputProps<string> }) => (
                    <TextField<RegisterInput>
                      field={field}
                      errors={errors}
                      touched={touched}
                      label="Email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                  )}
                </Field>
                
                <Field name="password">
                  {({ field }: { field: FieldInputProps<string> }) => (
                    <TextField<RegisterInput>
                      field={field}
                      errors={errors}
                      touched={touched}
                      label="Password"
                      type="password"
                      autoComplete="new-password"
                    />
                  )}
                </Field>

                <PasswordRules password={values.password} />
                
                <div className="block space-y-2">
                  <span className="text-sm font-bold text-slate-200">Gender</span>
                  <GenderSelector value={values.gender} onChange={handleGenderChange} />
                  {touched.gender && errors.gender && (
                    <span className="block text-sm font-semibold text-red-300">{errors.gender}</span>
                  )}
                </div>

                {register.isError && (
                  <p className="rounded-2xl bg-red-400/10 p-3 text-sm font-semibold text-red-200">
                    {register.error?.message || "We could not create your account with those details. Please try again."}
                  </p>
                )}
                
                <Button
                  type="submit"
                  isLoading={isSubmitting || register.isPending}
                  className="w-full py-3"
                >
                  Create account
                </Button>
              </Form>
            );
          }}
        </Formik>
        <p className="mt-6 text-center text-sm text-slate-300">
          Already have an account? <Link className="font-bold text-lime-200" href="/auth/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
