import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBodyMeasurement, createBodyWeight, getBodyMeasurements, getBodyWeightLogs, getDashboardSummary, getHabitProgress, getWorkoutProgress } from "./api";
import type { DateRangeQuery } from "./types";

export function useDashboardSummary() {
  return useQuery({ queryKey: ["dashboard"], queryFn: getDashboardSummary });
}

export function useHabitProgress() {
  return useQuery({ queryKey: ["progress", "habits"], queryFn: getHabitProgress });
}

export function useWorkoutProgress() {
  return useQuery({ queryKey: ["progress", "workouts"], queryFn: getWorkoutProgress });
}

export function useBodyWeightLogs() {
  return useQuery({ queryKey: ["progress", "body-weight"], queryFn: getBodyWeightLogs });
}

export function useCreateBodyWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBodyWeight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", "body-weight"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useBodyMeasurements(range?: DateRangeQuery) {
  return useQuery({ queryKey: ["progress", "body-measurements", range], queryFn: () => getBodyMeasurements(range) });
}

export function useCreateBodyMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBodyMeasurement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", "body-measurements"] });
      queryClient.invalidateQueries({ queryKey: ["progress", "body-weight"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
