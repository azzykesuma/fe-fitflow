"use client";

import Link from "next/link";
import { useCurrentUser } from "@/features/auth/hooks";

export function HomeNavActions() {
  const currentUser = useCurrentUser();
  const isLoggedIn = currentUser.isSuccess;

  if (currentUser.isLoading) {
    return <div className="h-10 w-32 rounded-full bg-white/5" />;
  }

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link className="rounded-full px-4 py-2 text-white/75 transition hover:text-white" href="/auth/login">
        Login
      </Link>
      <Link className="rounded-full bg-lime-300 px-4 py-2 font-bold text-slate-950" href="/auth/register">
        Start
      </Link>
    </div>
  );
}

export function HomeHeroActions() {
  const currentUser = useCurrentUser();
  const isLoggedIn = currentUser.isSuccess;

  if (currentUser.isLoading) {
    return <div className="h-14 w-full max-w-xs rounded-2xl bg-white/5" />;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link className="rounded-2xl bg-lime-300 px-6 py-4 text-center font-black text-slate-950 shadow-[0_20px_60px_rgba(132,255,96,0.25)]" href="/dashboard">
        Open dashboard
      </Link>
      <Link className="rounded-2xl border border-white/15 px-6 py-4 text-center font-bold text-white/85" href="/meals">
        Log meals
      </Link>
    </div>
  );
}
