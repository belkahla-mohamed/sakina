export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-6 py-12">
      <div className="h-9 w-64 rounded-full bg-line/50 animate-pulse" />
      <div className="h-12 w-full rounded-[14px] bg-line/40 animate-pulse mt-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[4/3] bg-line/40 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded-full bg-line/40 animate-pulse" />
              <div className="h-4 w-1/2 rounded-full bg-line/40 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
