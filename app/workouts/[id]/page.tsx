"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  useWorkoutPlan,
  useUpdateWorkoutPlan,
  useDeleteWorkoutPlan,
  useAddExercise,
  useUpdateExercise,
  useDeleteExercise,
} from "@/features/workouts/hooks";
import type { CreateExerciseInput, Exercise } from "@/features/workouts/types";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WorkoutDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const router = useRouter();

  // Queries
  const { data: plan, isLoading, isError } = useWorkoutPlan(id);

  // Mutations
  const updatePlanMutation = useUpdateWorkoutPlan(id);
  const deletePlanMutation = useDeleteWorkoutPlan();
  const addExerciseMutation = useAddExercise(id);
  const updateExerciseMutation = useUpdateExercise();
  const deleteExerciseMutation = useDeleteExercise();

  // Local UI States
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [planForm, setPlanForm] = useState({ name: "", description: "", scheduled_day: "Monday" });

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseForm, setNewExerciseForm] = useState<CreateExerciseInput>({
    name: "",
    muscle_group: "",
    target_sets: 3,
    target_reps: 10,
    target_weight_kg: 0,
    rest_seconds: 60,
    order_index: 1,
  });

  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExerciseForm, setEditingExerciseForm] = useState<Partial<Exercise>>({});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handlers for Plan CRUD
  const handleEditPlanClick = () => {
    if (plan) {
      setPlanForm({
        name: plan.name,
        description: plan.description ?? "",
        scheduled_day: plan.scheduled_day ?? "Monday",
      });
      setIsEditingPlan(true);
    }
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim()) return;

    updatePlanMutation.mutate(planForm, {
      onSuccess: () => {
        setIsEditingPlan(false);
      },
    });
  };

  const handleDeletePlan = () => {
    deletePlanMutation.mutate(id, {
      onSuccess: () => {
        router.push("/workouts");
      },
    });
  };

  // Handlers for Exercise CRUD
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseForm.name.trim()) return;

    // Determine the next order index
    const currentExercises = plan?.exercises ?? [];
    const nextOrderIndex = currentExercises.length > 0 
      ? Math.max(...currentExercises.map(e => e.order_index ?? 0)) + 1 
      : 1;

    addExerciseMutation.mutate(
      {
        ...newExerciseForm,
        order_index: nextOrderIndex,
      },
      {
        onSuccess: () => {
          setIsAddingExercise(false);
          setNewExerciseForm({
            name: "",
            muscle_group: "",
            target_sets: 3,
            target_reps: 10,
            target_weight_kg: 0,
            rest_seconds: 60,
            order_index: 1,
          });
        },
      }
    );
  };

  const handleEditExerciseClick = (exercise: Exercise) => {
    setEditingExerciseId(exercise.id);
    setEditingExerciseForm(exercise);
  };

  const handleSaveExercise = (e: React.FormEvent, exerciseId: string) => {
    e.preventDefault();
    if (!editingExerciseForm.name?.trim()) return;

    // Strip out non-updatable properties from input
    const { id: _, workout_plan_id: __, ...input } = editingExerciseForm as Exercise;

    updateExerciseMutation.mutate(
      {
        id: exerciseId,
        input,
      },
      {
        onSuccess: () => {
          setEditingExerciseId(null);
        },
      }
    );
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (confirm("Are you sure you want to remove this exercise?")) {
      deleteExerciseMutation.mutate(exerciseId);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Loading plan..." eyebrow="Workout detail">
        <div className="flex h-64 flex-col items-center justify-center space-y-4">
          <div className="size-8 animate-spin rounded-full border-4 border-lime-300 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-400">Loading your workout routine...</p>
        </div>
      </AppShell>
    );
  }

  if (isError || !plan) {
    return (
      <AppShell title="Error" eyebrow="Workout detail">
        <div className="rounded-[1.5rem] border border-red-950 bg-red-950/20 p-8 text-center">
          <p className="text-base font-bold text-red-400">Workout Plan not found</p>
          <p className="mt-2 text-xs text-slate-500">The workout may have been deleted, or the API server is offline.</p>
          <Link href="/workouts" className="mt-6 inline-flex rounded-xl bg-lime-300 px-5 py-2.5 text-xs font-black text-slate-950">
            Back to plans
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={plan.name} eyebrow="Workout detail">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Workout Plan Details and Controls */}
        <div className="lg:col-span-1 space-y-4">
          {isEditingPlan ? (
            <form onSubmit={handleSavePlan} className="rounded-[1.5rem] border border-lime-200/10 bg-[#0a1710] p-5 space-y-4 shadow-lg">
              <h3 className="text-sm font-black uppercase tracking-wider text-lime-200">Edit Workout Plan</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Plan Name</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. Push Day"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/70"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Description</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="e.g. Chest, shoulders, triceps"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/70 h-20 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Scheduled Day</label>
                <select
                  value={planForm.scheduled_day}
                  onChange={(e) => setPlanForm({ ...planForm, scheduled_day: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/70"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={updatePlanMutation.isPending}
                  className="flex-1 rounded-xl bg-lime-300 py-2.5 text-xs font-black text-slate-950 hover:bg-lime-400 disabled:opacity-50"
                >
                  {updatePlanMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPlan(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-black text-white hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-lg">
              <span className="inline-block rounded-full bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-lime-200 border border-lime-300/20">
                Scheduled: {plan.scheduled_day || "Unscheduled"}
              </span>
              <h2 className="mt-3 text-xl font-black text-white">{plan.name}</h2>
              {plan.description ? (
                <p className="mt-2 text-sm text-slate-400 leading-relaxed italic">{plan.description}</p>
              ) : (
                <p className="mt-2 text-xs text-slate-600">No description provided.</p>
              )}

              <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                {plan.exercises && plan.exercises.length > 0 ? (
                  <Link
                    href={`/workouts/session/${plan.id}`}
                    className="flex w-full justify-center rounded-xl bg-lime-300 py-3 text-xs font-black text-slate-950 shadow-md transition hover:bg-lime-400 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Start Session
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex w-full justify-center rounded-xl bg-slate-800 py-3 text-xs font-black text-slate-500 cursor-not-allowed"
                  >
                    Start Session (Add exercises first)
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleEditPlanClick}
                    className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-black text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    Edit Plan
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-xs font-black text-red-300 hover:bg-red-500/20 hover:text-red-200"
                  >
                    Delete Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Overlay / UI */}
          {showDeleteConfirm && (
            <div className="rounded-[1.5rem] border border-red-500/20 bg-red-950/20 p-5 space-y-3 shadow-lg">
              <h4 className="text-sm font-black text-red-300">Are you absolutely sure?</h4>
              <p className="text-xs text-slate-400">
                This will delete the workout plan and all its scheduled exercises. Historical log data will remain unaffected.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleDeletePlan}
                  disabled={deletePlanMutation.isPending}
                  className="flex-1 rounded-xl bg-red-500 py-2 text-xs font-black text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {deletePlanMutation.isPending ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-black text-white hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Exercises Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-400">
              Exercises ({plan.exercises?.length ?? 0})
            </h3>
            {!isAddingExercise && (
              <button
                onClick={() => setIsAddingExercise(true)}
                className="rounded-lg bg-lime-300/10 border border-lime-300/20 px-3 py-1.5 text-xs font-black text-lime-200 hover:bg-lime-300/20"
              >
                + Add Exercise
              </button>
            )}
          </div>

          {/* Add Exercise Inline Form */}
          {isAddingExercise && (
            <form onSubmit={handleAddExercise} className="rounded-2xl border border-lime-200/10 bg-[#101b15] p-5 space-y-4 shadow-lg">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h4 className="text-sm font-black text-lime-200">New Exercise</h4>
                <button
                  type="button"
                  onClick={() => setIsAddingExercise(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Exercise Name</label>
                  <input
                    type="text"
                    value={newExerciseForm.name}
                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, name: e.target.value })}
                    placeholder="e.g. Bench Press"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-lime-300/70"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Muscle Group</label>
                  <input
                    type="text"
                    value={newExerciseForm.muscle_group}
                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, muscle_group: e.target.value })}
                    placeholder="e.g. Chest"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-lime-300/70"
                  />
                </div>
              </div>

              <div className="grid gap-3 grid-cols-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Sets</label>
                  <input
                    type="number"
                    value={newExerciseForm.target_sets ?? ""}
                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, target_sets: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-lime-300/70"
                    min="1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Reps</label>
                  <input
                    type="number"
                    value={newExerciseForm.target_reps ?? ""}
                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, target_reps: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-lime-300/70"
                    min="1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newExerciseForm.target_weight_kg ?? ""}
                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, target_weight_kg: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-lime-300/70"
                    min="0"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Rest (s)</label>
                  <input
                    type="number"
                    value={newExerciseForm.rest_seconds ?? ""}
                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, rest_seconds: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-lime-300/70"
                    min="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={addExerciseMutation.isPending}
                className="w-full rounded-xl bg-lime-300 py-2.5 text-xs font-black text-slate-950 hover:bg-lime-400 disabled:opacity-50 shadow-md"
              >
                {addExerciseMutation.isPending ? "Adding..." : "Add to Plan"}
              </button>
            </form>
          )}

          {/* Exercises Listing */}
          <div className="grid gap-3">
            {plan.exercises && plan.exercises.length > 0 ? (
              plan.exercises
                .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                .map((exercise) => {
                  const isEditingThis = editingExerciseId === exercise.id;

                  if (isEditingThis) {
                    return (
                      <form
                        key={exercise.id}
                        onSubmit={(e) => handleSaveExercise(e, exercise.id)}
                        className="rounded-2xl border border-lime-300/30 bg-[#0f241a] p-4 space-y-3"
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400">Exercise Name</label>
                            <input
                              type="text"
                              value={editingExerciseForm.name ?? ""}
                              onChange={(e) => setEditingExerciseForm({ ...editingExerciseForm, name: e.target.value })}
                              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-lime-300"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400">Muscle Group</label>
                            <input
                              type="text"
                              value={editingExerciseForm.muscle_group ?? ""}
                              onChange={(e) => setEditingExerciseForm({ ...editingExerciseForm, muscle_group: e.target.value })}
                              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-lime-300"
                            />
                          </div>
                        </div>

                        <div className="grid gap-2 grid-cols-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400">Sets</label>
                            <input
                              type="number"
                              value={editingExerciseForm.target_sets ?? ""}
                              onChange={(e) => setEditingExerciseForm({ ...editingExerciseForm, target_sets: Number(e.target.value) || 0 })}
                              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-lime-300"
                              min="1"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400">Reps</label>
                            <input
                              type="number"
                              value={editingExerciseForm.target_reps ?? ""}
                              onChange={(e) => setEditingExerciseForm({ ...editingExerciseForm, target_reps: Number(e.target.value) || 0 })}
                              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-lime-300"
                              min="1"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400">Weight (kg)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={editingExerciseForm.target_weight_kg ?? ""}
                              onChange={(e) => setEditingExerciseForm({ ...editingExerciseForm, target_weight_kg: Number(e.target.value) || 0 })}
                              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-lime-300"
                              min="0"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400">Rest (s)</label>
                            <input
                              type="number"
                              value={editingExerciseForm.rest_seconds ?? ""}
                              onChange={(e) => setEditingExerciseForm({ ...editingExerciseForm, rest_seconds: Number(e.target.value) || 0 })}
                              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-lime-300"
                              min="0"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={updateExerciseMutation.isPending}
                            className="rounded-lg bg-lime-300 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-lime-400"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingExerciseId(null)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-slate-300 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    );
                  }

                  return (
                    <div
                      key={exercise.id}
                      className="group flex items-center justify-between rounded-2xl border border-white/5 bg-[#101b15]/65 p-4 transition hover:border-lime-200/20 hover:bg-[#101b15]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{exercise.name}</h4>
                          {exercise.muscle_group && (
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {exercise.muscle_group}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs font-bold text-slate-400">
                          <div>
                            <span className="text-slate-500 font-medium">Sets: </span>
                            <span className="text-lime-200">{exercise.target_sets ?? 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Reps: </span>
                            <span className="text-lime-200">{exercise.target_reps ?? 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Weight: </span>
                            <span className="text-lime-200">{exercise.target_weight_kg ?? 0} kg</span>
                          </div>
                          {exercise.rest_seconds ? (
                            <div>
                              <span className="text-slate-500 font-medium">Rest: </span>
                              <span className="text-slate-300">{exercise.rest_seconds}s</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleEditExerciseClick(exercise)}
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-lime-300/10 hover:text-lime-200 hover:border-lime-300/20"
                          title="Edit Exercise"
                        >
                          <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(exercise.id)}
                          className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          title="Delete Exercise"
                        >
                          <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center bg-[#101b15]/10">
                <p className="text-xs font-bold text-slate-400">No exercises added to this plan yet.</p>
                <p className="mt-1 text-[10px] text-slate-600">Click "+ Add Exercise" above to start building this routine.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
