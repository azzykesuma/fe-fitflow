import { apiClient } from "@/lib/api-client";
import type { CreateExerciseInput, CreateWorkoutPlanInput, CreateWorkoutSetInput, Exercise, FinishWorkoutSessionInput, UpdateExerciseInput, UpdateWorkoutPlanInput, WorkoutPlan, WorkoutSession, WorkoutSetLog } from "./types";

type DataResponse<T> = T | { data: T };
type ListResponse<T> = T[] | { data: T[] };

function unwrapData<T>(response: DataResponse<T>) {
  return typeof response === "object" && response !== null && "data" in response ? response.data : response;
}

function unwrapList<T>(response: ListResponse<T>) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data;
}

export function getWorkoutPlans() {
  return apiClient<ListResponse<WorkoutPlan>>("/api/workout-plans").then(unwrapList);
}

export function getWorkoutPlansToday() {
  return apiClient<ListResponse<WorkoutPlan>>("/api/workout-plans/today").then(unwrapList);
}

export function createWorkoutPlan(input: CreateWorkoutPlanInput) {
  return apiClient<DataResponse<WorkoutPlan>>("/api/workout-plans", {
    method: "POST",
    body: JSON.stringify(input),
  }).then(unwrapData);
}

export function getWorkoutPlan(id: string) {
  return apiClient<DataResponse<WorkoutPlan>>(`/api/workout-plans/${id}`).then(unwrapData);
}

export function updateWorkoutPlan(id: string, input: UpdateWorkoutPlanInput) {
  return apiClient<DataResponse<WorkoutPlan>>(`/api/workout-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }).then(unwrapData);
}

export function deleteWorkoutPlan(id: string) {
  return apiClient<void>(`/api/workout-plans/${id}`, { method: "DELETE" });
}

export function addExercise(workoutPlanId: string, input: CreateExerciseInput) {
  return apiClient<DataResponse<Exercise>>(`/api/workout-plans/${workoutPlanId}/exercises`, {
    method: "POST",
    body: JSON.stringify(input),
  }).then(unwrapData);
}

export function updateExercise(id: string, input: UpdateExerciseInput) {
  return apiClient<DataResponse<Exercise>>(`/api/exercises/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }).then(unwrapData);
}

export function deleteExercise(id: string) {
  return apiClient<void>(`/api/exercises/${id}`, { method: "DELETE" });
}

export function startWorkoutSession(workoutPlanId: string) {
  return apiClient<DataResponse<{ id: string }>>("/api/workout-sessions/start", {
    method: "POST",
    body: JSON.stringify({ workout_plan_id: workoutPlanId }),
  }).then(unwrapData);
}

export function getWorkoutSessions() {
  return apiClient<ListResponse<WorkoutSession>>("/api/workout-sessions").then(unwrapList);
}

export function getWorkoutSession(id: string) {
  return apiClient<DataResponse<WorkoutSession>>(`/api/workout-sessions/${id}`).then(unwrapData);
}

export function addWorkoutSet(sessionId: string, input: CreateWorkoutSetInput) {
  return apiClient<DataResponse<WorkoutSetLog>>(`/api/workout-sessions/${sessionId}/sets`, {
    method: "POST",
    body: JSON.stringify(input),
  }).then(unwrapData);
}

export function finishWorkoutSession(id: string, input: FinishWorkoutSessionInput = {}) {
  return apiClient<DataResponse<WorkoutSession>>(`/api/workout-sessions/${id}/finish`, {
    method: "PUT",
    body: JSON.stringify(input),
  }).then(unwrapData);
}

export function deleteWorkoutSession(id: string) {
  return apiClient<void>(`/api/workout-sessions/${id}`, { method: "DELETE" });
}
