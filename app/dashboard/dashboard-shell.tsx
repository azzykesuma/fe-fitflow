"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useCurrentUser } from "@/features/auth/hooks";

export function DashboardShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const currentUser = useCurrentUser();
  const rawName = currentUser.data?.name?.trim();
  const firstName = rawName?.split(/\s+/)[0];
  const name = firstName ? `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}` : "Athlete";

  return (
    <AppShell title={`Morning, ${name}`} eyebrow="Welcome back to FitFlow">
      {children}
    </AppShell>
  );
}
