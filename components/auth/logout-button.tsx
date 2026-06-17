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
      className="shrink-0 rounded-full border border-red-500/20 bg-red-950/10 px-3.5 py-1.5 text-xs font-semibold text-red-300 transition-all duration-300 hover:border-red-500/45 hover:bg-red-500/10 hover:text-red-200 hover:shadow-[0_0_12px_rgba(239,68,68,0.15)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    >
      {logout.isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
