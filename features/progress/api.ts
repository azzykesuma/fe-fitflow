import { apiClient } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-token";
import type { BodyMeasurement, BodyWeightLog, CreateBodyMeasurementInput, CreateBodyWeightInput, DashboardSummary, DateRangeQuery, ProgressPoint, ProgressPhotoPoint } from "./types";

/**
 * Uploads a progress photo directly to Supabase Storage using a presigned URL.
 *
 * Flow:
 *   1. POST metadata to our API route → server mints a signed upload URL
 *      using the service-role key (key never leaves the server).
 *   2. Browser PUTs the file directly to Supabase — no server double-hop.
 *   3. Returns the pre-generated signed download URL for storage in the DB.
 */
export async function uploadProgressPhoto(userId: string, file: File): Promise<string> {
  const token = getAuthToken();

  // Step 1 — get presigned upload URL from our server (sends only metadata, not the file)
  const metaRes = await fetch("/api/upload/progress-photo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ filename: file.name, contentType: file.type, userId }),
  });

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Could not get upload URL (${metaRes.status})`);
  }

  const { uploadUrl, filePath } = await metaRes.json() as {
    uploadUrl: string;
    filePath: string;
  };

  // Step 2 — PUT the file DIRECTLY to Supabase (no server in the middle)
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`Direct storage upload failed (${uploadRes.status})`);
  }

  // Step 3 — Get signed download URL now that the file actually exists
  const signRes = await fetch(`/api/upload/progress-photo?path=${encodeURIComponent(filePath)}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Could not generate download URL (${signRes.status})`);
  }

  const { downloadUrl } = await signRes.json() as { downloadUrl: string };

  // Step 4 — return the generated signed download URL
  return downloadUrl;
}


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

export function getProgressPhotos() {
  return apiClient<ListResponse<ProgressPhotoPoint>>("/api/progress/photos").then(unwrapList);
}
