import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeHabit, createHabit, deleteHabit, getHabit, getHabitLogs, getHabits, uncompleteHabit, updateHabit } from "./api";
import type { HabitLogsQuery, UpdateHabitInput } from "./types";

export function useHabits() {
  return useQuery({ queryKey: ["habits"], queryFn: getHabits });
}

export function useHabit(id: string) {
  return useQuery({ queryKey: ["habits", id], queryFn: () => getHabit(id), enabled: Boolean(id) });
}

export function useHabitLogs(query: HabitLogsQuery) {
  return useQuery({ queryKey: ["habits", "logs", query], queryFn: () => getHabitLogs(query), enabled: Boolean(query.from && query.to) });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useCompleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeHabit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useUpdateHabit(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateHabitInput) => updateHabit(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["habits", id] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useUncompleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uncompleteHabit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["habits"] }),
  });
}
