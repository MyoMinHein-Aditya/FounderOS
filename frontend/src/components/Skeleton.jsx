export function SkeletonCard() {
  return (
    <div className="minimal-card p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-2/3 bg-zinc-900/60 rounded"></div>
      <div className="h-4 w-full bg-zinc-900/40 rounded"></div>
      <div className="h-4 w-5/6 bg-zinc-900/40 rounded"></div>
      <div className="h-8 w-1/3 bg-zinc-900/60 rounded mt-2"></div>
    </div>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div className="flex flex-col gap-4 w-full animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-14 bg-zinc-900/40 rounded-xl border border-zinc-800/40"></div>
      ))}
    </div>
  );
}
