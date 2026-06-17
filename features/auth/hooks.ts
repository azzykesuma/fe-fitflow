import { useMutation, useQuery } from "@tanstack/react-query";
import { getCurrentUser, login, logout, refreshSession, register } from "./api";

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useRegister() {
  return useMutation({ mutationFn: register });
}

export function useCurrentUser() {
  return useQuery({ queryKey: ["auth", "me"], queryFn: getCurrentUser, retry: false });
}

export function useLogout() {
  return useMutation({ mutationFn: logout });
}

export function useRefreshSession() {
  return useMutation({ mutationFn: refreshSession });
}
