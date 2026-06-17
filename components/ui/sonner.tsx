"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return <SonnerToaster position="top-right" richColors closeButton toastOptions={{ style: { background: "#0f172a", borderColor: "rgba(255,255,255,0.12)", color: "#f8fafc" } }} />;
}
