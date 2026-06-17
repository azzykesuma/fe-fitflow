import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMealLog, deleteMealLog, getMealCalories, getMealLog, getMealLogs, updateMealLog } from "./api";
import type { MealLogInput } from "./types";

export function useMealCalories(date?: string) {
  return useQuery({ queryKey: ["meal-logs", "calories", date], queryFn: () => getMealCalories(date) });
}

export function useMealLogs(date?: string) {
  return useQuery({ queryKey: ["meal-logs", "list", date], queryFn: () => getMealLogs(date) });
}

export function useMealLog(id: string) {
  return useQuery({ queryKey: ["meal-logs", id], queryFn: () => getMealLog(id), enabled: Boolean(id) });
}

export function useCreateMealLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMealLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-logs"] }),
  });
}

export function useUpdateMealLog(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MealLogInput) => updateMealLog(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-logs"] });
      queryClient.invalidateQueries({ queryKey: ["meal-logs", id] });
    },
  });
}

export function useDeleteMealLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMealLog,
    retry: false,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ["meal-logs", id], exact: true });
      queryClient.invalidateQueries({ queryKey: ["meal-logs", "calories"] });
    },
  });
}
