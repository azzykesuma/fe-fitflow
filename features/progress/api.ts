import { apiClient } from "@/lib/api-client";
import type { BodyMeasurement, BodyWeightLog, CreateBodyMeasurementInput, CreateBodyWeightInput, DashboardSummary, DateRangeQuery, ProgressPoint } from "./types";

type ListResponse<T> = T[] | { data?: T[] };

function unwrapList<T>(response: ListResponse<T>) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getDefaultWeekRange(): DateRangeQuery {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 6);

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

export function getDashboardSummary() {
  return apiClient<DashboardSummary>("/api/dashboard");
}

export function getWorkoutProgress() {
  return apiClient<ProgressPoint[]>("/api/progress/workouts");
}

export function getBodyWeightLogs() {
  return apiClient<BodyWeightLog[]>("/api/progress/body-weight");
}

export function createBodyWeight(input: CreateBodyWeightInput) {
  return apiClient<BodyWeightLog>("/api/progress/body-weight", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getBodyMeasurements(range: DateRangeQuery = getDefaultWeekRange()) {
  const params = new URLSearchParams(range);

  return apiClient<ListResponse<BodyMeasurement>>(`/api/progress/body-measurements?${params.toString()}`).then(unwrapList);
}

export function createBodyMeasurement(input: CreateBodyMeasurementInput) {
  return apiClient<BodyMeasurement>("/api/progress/body-measurements", {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify(input),
  });
}
