import { ApiError } from "@/lib/api-client";

export function getSafeAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status === undefined) {
    return "We could not reach FitFlow. Check your connection and try again.";
  }

  if (error instanceof ApiError && error.status === 500) {
    return "FitFlow could not complete login right now. Please try again shortly.";
  }

  return fallback;
}
