import { apiClient } from "@/lib/api-client";
import type { CreateExerciseInput, CreateWorkoutPlanInput, CreateWorkoutSetInput, Exercise, FinishWorkoutSessionInput, UpdateExerciseInput, UpdateWorkoutPlanInput, WorkoutPlan, WorkoutSession, WorkoutSetLog } from "./types";

export function getWorkoutPlans() {
  return apiClient<WorkoutPlan[]>("/api/workout-plans");
}

export function createWorkoutPlan(input: CreateWorkoutPlanInput) {
  return apiClient<WorkoutPlan>("/api/workout-plans", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getWorkoutPlan(id: string) {
  return apiClient<WorkoutPlan>(`/api/workout-plans/${id}`);
}

export function updateWorkoutPlan(id: string, input: UpdateWorkoutPlanInput) {
  return apiClient<WorkoutPlan>(`/api/workout-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteWorkoutPlan(id: string) {
  return apiClient<void>(`/api/workout-plans/${id}`, { method: "DELETE" });
}

export function addExercise(workoutPlanId: string, input: CreateExerciseInput) {
  return apiClient<Exercise>(`/api/workout-plans/${workoutPlanId}/exercises`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateExercise(id: string, input: UpdateExerciseInput) {
  return apiClient<Exercise>(`/api/exercises/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteExercise(id: string) {
  return apiClient<void>(`/api/exercises/${id}`, { method: "DELETE" });
}

export function startWorkoutSession(workoutPlanId: string) {
  return apiClient<{ id: string }>("/api/workout-sessions/start", {
    method: "POST",
    body: JSON.stringify({ workout_plan_id: workoutPlanId }),
  });
}

export function getWorkoutSessions() {
  return apiClient<WorkoutSession[]>("/api/workout-sessions");
}

export function getWorkoutSession(id: string) {
  return apiClient<WorkoutSession>(`/api/workout-sessions/${id}`);
}

export function addWorkoutSet(sessionId: string, input: CreateWorkoutSetInput) {
  return apiClient<WorkoutSetLog>(`/api/workout-sessions/${sessionId}/sets`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function finishWorkoutSession(id: string, input: FinishWorkoutSessionInput = {}) {
  return apiClient<WorkoutSession>(`/api/workout-sessions/${id}/finish`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteWorkoutSession(id: string) {
  return apiClient<void>(`/api/workout-sessions/${id}`, { method: "DELETE" });
}
