import { Suspense } from "react";

/**
 * Boundary for admin pages that read fresh rows on every request.
 *
 * The `dbAdmin*` helpers are deliberately uncached ("always fresh"), and
 * Next 16 with cacheComponents refuses to prerender — or navigate instantly —
 * when uncached data is read outside a `<Suspense>` boundary. Wrapping the
 * content component here keeps the route instant: the shell paints right
 * away and the data streams in behind a skeleton.
 *
 * Usage:
 *   export default function Page() {
 *     return <AdminSection><PageContent /></AdminSection>;
 *   }
 *   async function PageContent() { const rows = await dbAdminX(); ... }
 */
export function AdminSection({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<AdminSkeleton />}>{children}</Suspense>;
}

const bar = "rounded-[9px] bg-line/40 anim-pulse";

export function AdminSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className={`h-8 w-48 ${bar}`} />
          <div className={`h-3.5 w-64 ${bar}`} />
        </div>
        <div className={`h-10 w-40 ${bar}`} />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`h-16 w-full ${bar}`} />
        ))}
      </div>
    </div>
  );
}
