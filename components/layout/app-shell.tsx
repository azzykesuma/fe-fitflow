"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/meals", label: "Meals" },
  { href: "/workouts", label: "Workout" },
  { href: "/progress", label: "Progress" },
];

export function AppShell({ children, title, eyebrow }: Readonly<{ children: React.ReactNode; title: string; eyebrow?: string }>) {
  const pathname = usePathname();

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-3 pb-24 pt-3 sm:px-4 lg:max-w-6xl lg:px-6 lg:pb-10">
      <header className="sticky top-3.5 z-20 mb-6 rounded-2xl border border-t-lime-500/15 border-b-white/3 border-x-white/4 bg-[#050b08]/80 px-4 py-2.5 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="relative flex items-center justify-center size-7.5 rounded-xl bg-linear-to-tr from-lime-400 to-emerald-500 p-px transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <div className="flex items-center justify-center size-full rounded-[11px] bg-[#050b08] text-[9.5px] font-black text-lime-300 tracking-tighter">
                FF
              </div>
              <div className="absolute inset-0 rounded-xl bg-lime-400 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-20 -z-10" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white transition-colors duration-200 group-hover:text-lime-300">
              Fit<span className="text-lime-400 font-medium">Flow</span>
            </span>
          </Link>
          
          <nav className="hidden items-center gap-1 bg-white/2 border border-white/4 p-1 rounded-full lg:flex">
            {navItems.map((item) => {
              const isActive = pathname ? (item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)) : false;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative rounded-full px-4.5 py-1.5 text-xs font-semibold tracking-wide transition duration-200 cursor-pointer"
                >
                  <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-lime-300 font-bold" : "text-slate-400 hover:text-slate-200"}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="activeTabDesktop"
                      className="absolute inset-0 rounded-full bg-lime-500/10 border border-lime-400/20 shadow-[0_0_12px_rgba(163,230,53,0.1)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center gap-2">
            <LogoutButton />
          </div>
        </div>
      </header>
      
      <section className="mb-5 px-1">
        <h1 className="text-[1.35rem] font-black leading-none tracking-[-0.04em] text-white">{title}</h1>
        {eyebrow ? <p className="mt-1 text-xs font-bold text-lime-200/80">{eyebrow}</p> : null}
      </section>
      
      {children}
      
      <nav className="fixed inset-x-0 bottom-4 z-30 mx-auto grid w-[calc(100%-24px)] max-w-sm grid-cols-4 gap-1 rounded-[1.25rem] border border-white/6 bg-[#050b08]/85 p-1.5 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-md lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname ? (item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)) : false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative rounded-xl py-2 text-center text-[11px] font-semibold transition duration-200 flex flex-col items-center justify-center cursor-pointer"
            >
              <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-lime-300 font-bold" : "text-slate-400 hover:text-slate-200"}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.span
                  layoutId="activeTabMobile"
                  className="absolute inset-0 rounded-[10px] bg-lime-500/10 border border-lime-400/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}

