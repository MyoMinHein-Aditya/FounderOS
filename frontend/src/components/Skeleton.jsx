export function SkeletonCard() {
  return (
    <div className="minimal-card p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-2/3 bg-muted rounded-md"></div>
      <div className="h-4 w-full bg-muted/60 rounded-md"></div>
      <div className="h-4 w-5/6 bg-muted/60 rounded-md"></div>
      <div className="h-8 w-1/3 bg-muted rounded-md mt-2"></div>
    </div>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div className="flex flex-col gap-4 w-full animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-14 bg-muted rounded-xl border border-border"></div>
      ))}
    </div>
  );
}
