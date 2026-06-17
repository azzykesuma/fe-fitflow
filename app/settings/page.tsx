import { AppShell } from "@/components/layout/app-shell";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" eyebrow="Profile">
      <section className="max-w-2xl rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
        <h2 className="text-2xl font-black">API connection</h2>
        <p className="mt-3 text-slate-300">Set `NEXT_PUBLIC_API_BASE_URL` to point this frontend at the Go backend repository.</p>
        <code className="mt-5 block rounded-2xl bg-slate-950/70 p-4 text-sm text-lime-100">NEXT_PUBLIC_API_BASE_URL=http://localhost:8080</code>
      </section>
    </AppShell>
  );
}
