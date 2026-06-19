"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useCurrentUser, useUserProfile, useUpdateUserProfile } from "@/features/auth/hooks";
import { Field, Form, Formik } from "formik";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

type ProfileFormValues = {
  name: string;
  fitness_goal: string;
  height_cm: string | number;
  weight_kg: string | number;
  gender: "male" | "female";
};

export default function SettingsPage() {
  const currentUser = useCurrentUser();
  const userProfile = useUserProfile();
  const updateUserProfile = useUpdateUserProfile();

  if (currentUser.isLoading || userProfile.isLoading) {
    return (
      <AppShell title="Settings" eyebrow="Profile">
        <div className="max-w-2xl space-y-6">
          <div className="h-12 w-1/3 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-[400px] animate-pulse rounded-[2rem] border border-white/5 bg-white/[0.03]" />
        </div>
      </AppShell>
    );
  }

  // Handle case where userProfile request failed (e.g. no profile set up yet)
  const profileData = userProfile.data;
  const initialValues: ProfileFormValues = {
    name: profileData?.name ?? currentUser.data?.name ?? "",
    fitness_goal: profileData?.fitness_goal ?? "build_muscle",
    height_cm: profileData?.height_cm ?? 175,
    weight_kg: profileData?.weight_kg ?? 75.0,
    gender: profileData?.gender ?? "male",
  };

  return (
    <AppShell title="Settings" eyebrow="Profile">
      <div className="max-w-2xl space-y-6">
        {/* Profile Card Summary */}
        <div className="relative overflow-hidden rounded-[2rem] border border-lime-200/10 bg-[#07120c]/90 p-6 backdrop-blur">
          <div className="absolute -right-12 -top-12 size-36 rounded-full bg-lime-300/10 blur-3xl" />
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-2xl bg-lime-300 text-2xl font-black text-slate-950">
              {(profileData?.name ?? currentUser.data?.name ?? "U").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{profileData?.name ?? currentUser.data?.name ?? "User Setup"}</h2>
              <p className="text-xs font-bold text-slate-400">{currentUser.data?.email}</p>
              <p className="mt-1.5 inline-flex items-center rounded-full bg-lime-300/10 px-2.5 py-0.5 text-[0.68rem] font-bold text-lime-200">
                {profileData ? "Profile Active" : "Setup Required"}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Settings Form Container */}
        <section className="rounded-[2rem] border border-lime-200/10 bg-[#07120c]/90 p-6 shadow-2xl backdrop-blur">
          <div className="mb-6 border-b border-white/5 pb-4">
            <h3 className="text-lg font-black text-white">Metrics & Biometrics</h3>
            <p className="text-xs font-bold text-slate-400">Configure your physical traits to calibrate metabolic and habit targets.</p>
          </div>

          <Formik
            initialValues={initialValues}
            enableReinitialize
            validate={(values) => {
              const errors: Partial<Record<keyof ProfileFormValues, string>> = {};
              if (!values.name.trim()) {
                errors.name = "Name is required";
              }
              const height = Number(values.height_cm);
              if (!values.height_cm) {
                errors.height_cm = "Height is required";
              } else if (isNaN(height) || height <= 0 || height > 300) {
                errors.height_cm = "Enter a valid height (1 - 300 cm)";
              }
              const weight = Number(values.weight_kg);
              if (!values.weight_kg) {
                errors.weight_kg = "Weight is required";
              } else if (isNaN(weight) || weight <= 0 || weight > 500) {
                errors.weight_kg = "Enter a valid weight (1 - 500 kg)";
              }
              if (!values.fitness_goal) {
                errors.fitness_goal = "Goal is required";
              }
              if (!values.gender) {
                errors.gender = "Gender is required";
              }
              return errors;
            }}
            onSubmit={(values, helpers) => {
              updateUserProfile.mutate(
                {
                  name: values.name.trim(),
                  fitness_goal: values.fitness_goal,
                  height_cm: Number(values.height_cm),
                  weight_kg: Number(values.weight_kg),
                  gender: values.gender,
                },
                {
                  onSuccess: () => {
                    toast.success("Profile settings updated!");
                  },
                  onError: () => {
                    toast.error("Could not update profile. Please try again.");
                  },
                  onSettled: () => helpers.setSubmitting(false),
                }
              );
            }}
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form noValidate className="space-y-6">
                {/* Name */}
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-200">Name</span>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Brian"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-lime-300/70"
                  />
                  {touched.name && errors.name && (
                    <span className="block text-sm font-semibold text-red-300">{errors.name}</span>
                  )}
                </label>

                {/* Fitness Goal Select */}
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-200">Fitness Goal</span>
                  <div className="relative">
                    <Field
                      as="select"
                      name="fitness_goal"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-lime-300/70 appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1.2rem center",
                        backgroundSize: "1.1em",
                      }}
                    >
                      <option value="build_muscle" className="bg-slate-950">Build Muscle</option>
                      <option value="lose_fat" className="bg-slate-950">Lose Fat</option>
                      <option value="maintain" className="bg-slate-950">Maintain Weight</option>
                      <option value="improve_fitness" className="bg-slate-950">Improve Fitness</option>
                    </Field>
                  </div>
                  {touched.fitness_goal && errors.fitness_goal && (
                    <span className="block text-sm font-semibold text-red-300">{errors.fitness_goal}</span>
                  )}
                </label>

                {/* Height & Weight grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Height */}
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-slate-200">Height</span>
                    <div className="flex rounded-2xl border border-white/10 bg-slate-950/70 focus-within:border-lime-300/70 transition">
                      <Field
                        name="height_cm"
                        type="number"
                        step="1"
                        min="1"
                        placeholder="175"
                        className="min-w-0 flex-1 rounded-l-2xl bg-transparent px-4 py-3.5 text-white outline-none"
                      />
                      <span className="grid place-items-center px-4 text-xs font-black text-slate-400 border-l border-white/5 bg-white/[0.02] rounded-r-2xl">cm</span>
                    </div>
                    {touched.height_cm && errors.height_cm && (
                      <span className="block text-sm font-semibold text-red-300">{errors.height_cm}</span>
                    )}
                  </label>

                  {/* Weight */}
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-slate-200">Weight</span>
                    <div className="flex rounded-2xl border border-white/10 bg-slate-950/70 focus-within:border-lime-300/70 transition">
                      <Field
                        name="weight_kg"
                        type="number"
                        step="0.1"
                        min="1"
                        placeholder="78.5"
                        className="min-w-0 flex-1 rounded-l-2xl bg-transparent px-4 py-3.5 text-white outline-none"
                      />
                      <span className="grid place-items-center px-4 text-xs font-black text-slate-400 border-l border-white/5 bg-white/[0.02] rounded-r-2xl">kg</span>
                    </div>
                    {touched.weight_kg && errors.weight_kg && (
                      <span className="block text-sm font-semibold text-red-300">{errors.weight_kg}</span>
                    )}
                  </label>
                </div>

                {/* Gender Select Cards (New Field: "male" | "female") */}
                <div className="block space-y-2">
                  <span className="text-sm font-bold text-slate-200">Gender</span>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      onClick={() => setFieldValue("gender", "male")}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border py-4 transition-all duration-300 cursor-pointer ${
                        values.gender === "male"
                          ? "border-lime-300 bg-lime-300/10 text-lime-200 shadow-[0_0_20px_rgba(190,242,100,0.15)]"
                          : "border-white/10 bg-slate-950/40 text-slate-500 hover:border-white/20 hover:text-slate-350"
                      }`}
                    >
                      <svg className="size-6 transition-transform duration-300 active:scale-95" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <circle cx="10" cy="14" r="4" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5L20 4m0 0h-5m5 0v5" />
                      </svg>
                      <span className="text-xs font-black uppercase tracking-wider">Male</span>
                      {values.gender === "male" && (
                        <span className="absolute right-2 top-2 size-2 rounded-full bg-lime-300" />
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setFieldValue("gender", "female")}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border py-4 transition-all duration-300 cursor-pointer ${
                        values.gender === "female"
                          ? "border-lime-300 bg-lime-300/10 text-lime-200 shadow-[0_0_20px_rgba(190,242,100,0.15)]"
                          : "border-white/10 bg-slate-950/40 text-slate-500 hover:border-white/20 hover:text-slate-350"
                      }`}
                    >
                      <svg className="size-6 transition-transform duration-300 active:scale-95" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <circle cx="12" cy="9" r="4" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 13v7m-3-3h6" />
                      </svg>
                      <span className="text-xs font-black uppercase tracking-wider">Female</span>
                      {values.gender === "female" && (
                        <span className="absolute right-2 top-2 size-2 rounded-full bg-lime-300" />
                      )}
                    </Button>
                  </div>
                  {touched.gender && errors.gender && (
                    <span className="block text-sm font-semibold text-red-300">{errors.gender}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || updateUserProfile.isPending}
                  className="w-full mt-2 rounded-2xl bg-lime-300 px-5 py-4 font-black text-slate-950 hover:bg-lime-200 active:scale-[0.98] transition duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                >
                  {updateUserProfile.isPending ? "Saving changes..." : "Save Profile Settings"}
                </Button>
              </Form>
            )}
          </Formik>
        </section>
      </div>
    </AppShell>
  );
}
