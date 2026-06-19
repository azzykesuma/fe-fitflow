import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050b08] px-4 py-8">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-lime-200/10 bg-white/[0.03] p-8 text-center backdrop-blur-md">
        {/* Glow effects behind card */}
        <div className="absolute -left-12 -top-12 size-36 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute -right-12 -bottom-12 size-36 rounded-full bg-lime-300/5 blur-3xl" />

        <div className="relative z-10 space-y-6">
          {/* Huge glowing 404 text */}
          <div className="relative inline-block">
            <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-lime-300 to-emerald-500">
              404
            </h1>
            <div className="absolute inset-0 bg-lime-300/10 blur-2xl -z-10 rounded-full" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Lost in training?</h2>
            <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto">
              The page you are looking for doesn't exist or has been moved to a new route.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-300 px-5 py-3.5 text-sm font-black text-slate-950 hover:bg-lime-200 active:scale-[0.98] transition cursor-pointer"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
