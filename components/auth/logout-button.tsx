"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSafeAuthErrorMessage } from "@/features/auth/errors";
import { useLogout } from "@/features/auth/hooks";
import { clearAuthTokens } from "@/lib/auth-token";

export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();

  return (
    <button
      type="button"
      disabled={logout.isPending}
      onClick={() => {
        logout.mutate(undefined, {
          onSuccess: () => {
            clearAuthTokens();
            toast.success("You have been logged out.");
            router.push("/auth/login?loggedOut=1");
            router.refresh();
          },
          onError: (error) => {
            toast.error(getSafeAuthErrorMessage(error, "We could not log you out. Please try again."));
          },
        });
      }}
      className="shrink-0 rounded-full border border-red-300/20 px-3 py-2 text-[0.65rem] font-black text-red-100 transition hover:border-red-300/50 disabled:opacity-60"
    >
      {logout.isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
