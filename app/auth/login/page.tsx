"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Form, Formik, type FieldInputProps } from "formik";
import { toast } from "sonner";
import { TextField } from "@/components/ui/field";
import { getSafeAuthErrorMessage } from "@/features/auth/errors";
import { useLogin } from "@/features/auth/hooks";
import type { LoginInput } from "@/features/auth/types";
import { setAuthTokens } from "@/lib/auth-token";

const initialValues: LoginInput = { email: "", password: "" };

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "1") {
      setSuccessMessage("Registration successful. Please log in.");
    }
    if (params.get("loggedOut") === "1") {
      setSuccessMessage("You have been logged out.");
      const timeout = window.setTimeout(() => setSuccessMessage(""), 5000);

      return () => window.clearTimeout(timeout);
    }
  }, []);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-md rounded-4xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur">
        <Link href="/" className="mb-8 block text-2xl font-black">
          FitFlow
        </Link>
        <h1 className="mb-2 text-4xl font-black tracking-[-0.04em]">Welcome back</h1>
        <p className="mb-8 text-slate-300">Log in to sync meals, workouts, and progress with the API.</p>
        <Formik
          initialValues={initialValues}
          validate={(values) => {
            const errors: Partial<LoginInput> = {};
            const email = values.email.trim();
            if (!email) errors.email = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
            if (!values.password) errors.password = "Password is required";
            return errors;
          }}
          onSubmit={(values, helpers) => {
            login.mutate(
              { ...values, email: values.email.trim().toLowerCase() },
              {
                onSuccess: (response) => {
                  setAuthTokens(response.data);
                  toast.success("Login successful.");
                  router.push("/dashboard");
                  router.refresh();
                },
                onSettled: () => helpers.setSubmitting(false),
              },
            );
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form noValidate className="space-y-5">
              {successMessage ? <p className="rounded-2xl bg-lime-300/10 p-3 text-sm font-semibold text-lime-100">{successMessage}</p> : null}
              <Field name="email">{({ field }: { field: FieldInputProps<string> }) => <TextField<LoginInput> field={field} errors={errors} touched={touched} label="Email" inputMode="email" autoComplete="email" placeholder="you@example.com" />}</Field>
              <Field name="password">{({ field }: { field: FieldInputProps<string> }) => <TextField<LoginInput> field={field} errors={errors} touched={touched} label="Password" type="password" autoComplete="current-password" />}</Field>
              {login.isError ? <p className="rounded-2xl bg-red-400/10 p-3 text-sm font-semibold text-red-200">{getSafeAuthErrorMessage(login.error, "Login failed. Check your details and try again.")}</p> : null}
              <button type="submit" disabled={isSubmitting || login.isPending} className="w-full rounded-2xl bg-lime-300 px-5 py-3 font-black text-slate-950 disabled:opacity-60">
                {login.isPending ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>
        <p className="mt-6 text-center text-sm text-slate-300">
          New here? <Link className="font-bold text-lime-200" href="/auth/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
