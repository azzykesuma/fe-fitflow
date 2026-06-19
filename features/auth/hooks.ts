import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, getUserProfile, login, logout, refreshSession, register, updateUserProfile } from "./api";

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

export function useUserProfile() {
  return useQuery({ queryKey: ["users", "me"], queryFn: getUserProfile, retry: false });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["users", "me"], data);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

