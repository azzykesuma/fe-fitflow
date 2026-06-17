import { ApiError } from "@/lib/api-client";

function isDebugAuthErrorsEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEBUG_AUTH_ERRORS === "true";
}

function formatDebugDetails(error: ApiError) {
  const details = typeof error.details === "string" ? error.details : JSON.stringify(error.details, null, 2);

  return details ? `Auth request failed (${error.status ?? "network/CORS"}): ${details}` : `Auth request failed (${error.status ?? "network/CORS"})`;
}

export function getSafeAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && isDebugAuthErrorsEnabled()) {
    return formatDebugDetails(error);
  }

  if (error instanceof ApiError && error.status === undefined) {
    return "We could not reach FitFlow. Check your connection and try again.";
  }

  if (error instanceof ApiError && error.status === 500) {
    return "FitFlow could not complete login right now. Please try again shortly.";
  }

  return fallback;
}
