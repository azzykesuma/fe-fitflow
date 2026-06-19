"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function MealSearchPage() {
  const router = useRouter();
  const [id, setId] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (id.trim()) router.push(`/meals/${id.trim()}`);
  }

  return (
    <AppShell title="Find Meal" eyebrow="Open a meal log by id">
      <form onSubmit={onSubmit} className="space-y-4 rounded-[1.35rem] border border-lime-200/10 bg-[#07120c]/90 p-4">
        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-200">Meal log ID</span>
          <input value={id} onChange={(event) => setId(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-lime-300/70" />
        </label>
        <Button className="w-full rounded-2xl bg-lime-300 px-5 py-3 font-black text-slate-950" type="submit">
          Open meal
        </Button>
      </form>
    </AppShell>
  );
}
