export default function RootLoading() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-[#050b08] z-50">
      <div className="flex flex-col items-center gap-5">
        {/* Glowing Spinner */}
        <div className="relative size-12">
          <div className="absolute inset-0 rounded-full border-4 border-lime-300/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-lime-300 border-r-lime-300/80 animate-spin" />
          <div className="absolute inset-0 rounded-full bg-lime-300/10 blur-xl animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-lime-300">FitFlow</h2>
          <p className="mt-1.5 text-[0.62rem] font-bold text-slate-500 uppercase tracking-widest animate-pulse">Syncing data...</p>
        </div>
      </div>
    </div>
  );
}
