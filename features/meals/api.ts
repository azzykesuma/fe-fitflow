import { apiClient } from "@/lib/api-client";
import type { MealCaloriesSummary, MealLog, MealLogInput } from "./types";

type DataResponse<T> = T | { data: T };

function unwrapData<T>(response: DataResponse<T>) {
  return typeof response === "object" && response !== null && "data" in response ? response.data : response;
}

export function createMealLog(input: MealLogInput) {
  return apiClient<DataResponse<MealLog>>("/api/meal-logs", {
    method: "POST",
    body: JSON.stringify(input),
  }).then(unwrapData);
}

export function getMealLogs(date?: string) {
  const params = date ? `?${new URLSearchParams({ date }).toString()}` : "";

  return apiClient<DataResponse<MealLog[]>>(`/api/meal-logs${params}`).then(unwrapData);
}

export function getMealCalories(date?: string) {
  const params = date ? `?${new URLSearchParams({ date }).toString()}` : "";

  return apiClient<DataResponse<MealCaloriesSummary>>(`/api/meal-logs/calories${params}`).then(unwrapData);
}

export function getMealLog(id: string) {
  return apiClient<DataResponse<MealLog>>(`/api/meal-logs/${id}`).then(unwrapData);
}

export function updateMealLog(id: string, input: MealLogInput) {
  return apiClient<DataResponse<MealLog>>(`/api/meal-logs/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }).then(unwrapData);
}

export function deleteMealLog(id: string) {
  return apiClient<void>(`/api/meal-logs/${id}`, { method: "DELETE" });
}
