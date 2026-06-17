import { apiClient } from "@/lib/api-client";
import type { CreateHabitInput, Habit, HabitLog, HabitLogsQuery, UpdateHabitInput } from "./types";

export function getHabits() {
  return apiClient<Habit[]>("/api/habits");
}

export function createHabit(input: CreateHabitInput) {
  return apiClient<Habit>("/api/habits", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getHabit(id: string) {
  return apiClient<Habit>(`/api/habits/${id}`);
}

export function updateHabit(id: string, input: UpdateHabitInput) {
  return apiClient<Habit>(`/api/habits/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteHabit(id: string) {
  return apiClient<void>(`/api/habits/${id}`, { method: "DELETE" });
}

export function completeHabit(id: string) {
  return apiClient<void>(`/api/habits/${id}/complete`, { method: "POST" });
}

export function uncompleteHabit(id: string) {
  return apiClient<void>(`/api/habits/${id}/complete`, { method: "DELETE" });
}

export function getHabitLogs(query: HabitLogsQuery) {
  const params = new URLSearchParams(query);

  return apiClient<HabitLog[]>(`/api/habits/logs?${params.toString()}`);
}
