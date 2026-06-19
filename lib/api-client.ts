import { clearAuthTokens, getAuthToken, getRefreshToken, setAuthTokens } from "@/lib/auth-token";

const API_BASE_URL = "";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  token?: string;
  skipAuth?: boolean;
  skipAuthRefresh?: boolean;
};

type TokenRefreshResponse = {
  data?: {
    access_token?: string;
    refresh_token?: string;
  };
  access_token?: string;
  refresh_token?: string;
};

function shouldTryRefresh(path: string, options: RequestOptions) {
  return !options.skipAuthRefresh && !path.startsWith("/api/auth/");
}

function extractTokens(response: TokenRefreshResponse) {
  return {
    access_token: response.data?.access_token ?? response.access_token,
    refresh_token: response.data?.refresh_token ?? response.refresh_token,
  };
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  const headers = new Headers({ Accept: "application/json" });
  const body = refreshToken ? JSON.stringify({ refresh_token: refreshToken }) : undefined;

  if (body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers,
    body,
    credentials: "include",
  });

  if (!response.ok) {
    clearAuthTokens();
    throw new ApiError("Session refresh failed", response.status);
  }

  const tokens = extractTokens((await response.json()) as TokenRefreshResponse);

  if (!tokens.access_token) {
    clearAuthTokens();
    throw new ApiError("Session refresh failed");
  }

  setAuthTokens(tokens);

  return tokens.access_token;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token: explicitToken, skipAuth, skipAuthRefresh, ...requestOptions } = options;
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = skipAuth ? undefined : explicitToken ?? getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers,
      credentials: "include",
    });
  } catch (error) {
    throw new ApiError("Network request failed", undefined, error instanceof Error ? error.message : String(error));
  }

  if (response.status === 401 && shouldTryRefresh(path, { ...requestOptions, skipAuthRefresh })) {
    const refreshedToken = await refreshAccessToken();
    const retryHeaders = new Headers(headers);
    retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);

    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...requestOptions,
        headers: retryHeaders,
        credentials: "include",
      });
    } catch (error) {
      throw new ApiError("Network request failed", undefined, error instanceof Error ? error.message : String(error));
    }
  }

  if (!response.ok) {
    let details: any;

    try {
      details = await response.clone().json();
    } catch {
      try {
        details = await response.clone().text();
      } catch {
        details = undefined;
      }
    }

    let message = "Request failed";
    if (details && typeof details === "object") {
      if (details.error && typeof details.error === "object" && typeof details.error.message === "string") {
        message = details.error.message;
      } else if (typeof details.error === "string") {
        message = details.error;
      } else if (typeof details.message === "string") {
        message = details.message;
      }
    } else if (typeof details === "string" && details.trim().length > 0) {
      message = details;
    }

    throw new ApiError(message, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
