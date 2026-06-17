import { ApiError } from "@/lib/api-client";

export function getSafeAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status === undefined) {
    return "We could not reach FitFlow. Check your connection and try again.";
  }

  return fallback;
}
