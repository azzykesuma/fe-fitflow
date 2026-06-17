import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dash" },
  { href: "/habits", label: "Habits" },
  { href: "/workouts", label: "Work" },
  { href: "/progress", label: "Progress" },
];

export function AppShell({ children, title, eyebrow }: Readonly<{ children: React.ReactNode; title: string; eyebrow?: string }>) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-3 pb-24 pt-3 sm:px-4 lg:max-w-6xl lg:px-6 lg:pb-10">
      <header className="sticky top-3 z-20 mb-5 rounded-[1.15rem] border border-lime-200/15 bg-[#07120c]/90 px-3 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-black tracking-tight text-white">
            <span className="grid size-6 place-items-center rounded-full border border-lime-300/40 bg-lime-300/10 text-[10px] text-lime-200">FF</span>
            FitFlow
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-slate-400 transition hover:border-lime-300/40 hover:text-lime-200">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LogoutButton />
          </div>
        </div>
      </header>
      <section className="mb-4 px-1">
        <h1 className="text-[1.35rem] font-black leading-none tracking-[-0.04em] text-white">{title}</h1>
        {eyebrow ? <p className="mt-1 text-xs font-bold text-lime-200/80">{eyebrow}</p> : null}
      </section>
      {children}
      <nav className="fixed inset-x-0 bottom-3 z-30 mx-auto grid w-[calc(100%-24px)] max-w-md grid-cols-4 gap-1 rounded-[1.2rem] border border-lime-200/15 bg-[#07120c]/95 p-2 shadow-[0_18px_70px_rgba(0,0,0,0.55)] backdrop-blur lg:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-2xl px-2 py-2 text-center text-[0.65rem] font-black text-slate-400 transition hover:bg-lime-300/10 hover:text-lime-200">
            {item.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
