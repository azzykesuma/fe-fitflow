import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

export default function ProgressPage() {
  return (
    <AppShell title="Transformation Analytics" eyebrow="Momentum and measurements">
      <div className="mb-4 rounded-[1.35rem] border border-lime-200/10 bg-[#0b1710] p-4">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Biometric trends</p>
        <h2 className="mt-2 text-2xl font-black">-3.2% Body Fat</h2>
        <div className="mt-5 flex h-28 items-end gap-2 rounded-2xl bg-lime-300/10 p-3">
          {[28, 38, 54, 58, 72, 84].map((height, index) => (
            <div key={index} className="flex-1 rounded-t-xl bg-lime-300/80" style={{ height: `${height}%` }} />
          ))}
        </div>
        <Link href="/progress/body-measurement" className="mt-4 inline-flex rounded-xl bg-lime-300 px-4 py-3 text-xs font-black text-slate-900 transition hover:bg-lime-400">
          Body measurements
        </Link>
      </div>
      <div className="grid gap-3">
        {['Habit completion', 'Workouts per week', 'Body weight'].map((title) => (
          <section key={title} className="rounded-[1.35rem] border border-lime-200/10 bg-[#101b15] p-4">
            <h2 className="text-base font-black">{title}</h2>
            <div className="mt-4 flex h-32 items-end gap-2 rounded-2xl bg-[#07120c] p-3">
              {[45, 70, 55, 88, 64, 92, 76].map((height, index) => (
                <div key={index} className="flex-1 rounded-t-xl bg-lime-300/80" style={{ height: `${height}%` }} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
