import { apiClient } from "@/lib/api-client";
import { setAuthTokens } from "@/lib/auth-token";
import { encryptPassword } from "@/lib/password-encryption";
import type { AuthResponse, CurrentUserResponse, LoginInput, LoginPayload, RegisterInput, RegisterPayload, UpdateProfileInput, User } from "./types";

export async function login(input: LoginInput) {
  const { password, ...payload } = input;
  const encryptedPassword = await encryptPassword(password);

  return apiClient<AuthResponse>("/api/auth/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ ...payload, ...encryptedPassword } satisfies LoginPayload),
  });
}

export async function register(input: RegisterInput) {
  const { password, ...payload } = input;
  const encryptedPassword = await encryptPassword(password);

  return apiClient<AuthResponse>("/api/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ ...payload, ...encryptedPassword } satisfies RegisterPayload),
  });
}

export function getCurrentUser() {
  return apiClient<CurrentUserResponse>("/api/auth/me").then((response) => ("data" in response ? response.data : response));
}

export function refreshSession() {
  return apiClient<AuthResponse>("/api/auth/refresh", { method: "POST", skipAuth: true, skipAuthRefresh: true }).then((response) => {
    setAuthTokens(response.data);

    return response;
  });
}

export function logout() {
  return apiClient<void>("/api/auth/logout", { method: "POST" });
}

export function getUserProfile() {
  return apiClient<{ data: User }>("/api/users/me").then((response) => response.data);
}

export function updateUserProfile(input: UpdateProfileInput) {
  return apiClient<{ data: User }>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  }).then((response) => response.data);
}

