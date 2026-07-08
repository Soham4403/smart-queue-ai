export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[1.6rem] border border-white/10 bg-white/6 p-6 shadow-[0_18px_54px_rgba(6,9,24,0.34)] backdrop-blur-xl">
      <div className="mb-4 h-40 rounded-[1.2rem] bg-white/10" />
      <div className="mb-3 h-5 w-2/3 rounded bg-white/10" />
      <div className="mb-2 h-4 w-full rounded bg-white/10" />
      <div className="mb-2 h-4 w-5/6 rounded bg-white/10" />
      <div className="mt-5 h-11 rounded-2xl bg-white/10" />
    </div>
  );
}
