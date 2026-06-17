import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addExercise, addWorkoutSet, createWorkoutPlan, deleteExercise, deleteWorkoutPlan, deleteWorkoutSession, finishWorkoutSession, getWorkoutPlan, getWorkoutPlans, getWorkoutSession, getWorkoutSessions, startWorkoutSession, updateExercise, updateWorkoutPlan } from "./api";
import type { CreateExerciseInput, CreateWorkoutSetInput, FinishWorkoutSessionInput, UpdateExerciseInput, UpdateWorkoutPlanInput } from "./types";

export function useWorkoutPlans() {
  return useQuery({ queryKey: ["workout-plans"], queryFn: getWorkoutPlans });
}

export function useWorkoutPlan(id: string) {
  return useQuery({ queryKey: ["workout-plans", id], queryFn: () => getWorkoutPlan(id), enabled: Boolean(id) });
}

export function useWorkoutSessions() {
  return useQuery({ queryKey: ["workout-sessions"], queryFn: getWorkoutSessions });
}

export function useWorkoutSession(id: string) {
  return useQuery({ queryKey: ["workout-sessions", id], queryFn: () => getWorkoutSession(id), enabled: Boolean(id) });
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkoutPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout-plans"] }),
  });
}

export function useStartWorkoutSession() {
  return useMutation({ mutationFn: startWorkoutSession });
}

export function useUpdateWorkoutPlan(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateWorkoutPlanInput) => updateWorkoutPlan(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      queryClient.invalidateQueries({ queryKey: ["workout-plans", id] });
    },
  });
}

export function useDeleteWorkoutPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkoutPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout-plans"] }),
  });
}

export function useAddExercise(workoutPlanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExerciseInput) => addExercise(workoutPlanId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout-plans", workoutPlanId] }),
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExerciseInput }) => updateExercise(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout-plans"] }),
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout-plans"] }),
  });
}

export function useAddWorkoutSet(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkoutSetInput) => addWorkoutSet(sessionId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout-sessions", sessionId] }),
  });
}

export function useFinishWorkoutSession(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: FinishWorkoutSessionInput) => finishWorkoutSession(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["workout-sessions", id] });
    },
  });
}

export function useDeleteWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkoutSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout-sessions"] }),
  });
}
