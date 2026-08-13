import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      {...props}
    />
  )
}

// Table row skeleton — N rows of M columns
function TableRowSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <Skeleton className={cn('h-4', j === 0 ? 'w-32' : j === cols - 1 ? 'w-16' : 'w-24')} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Stat card skeleton — for dashboard metric cards
function StatCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24 rounded-md" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Card skeleton — for tour/hotel cards in the web
function CardSkeleton({ height = 'h-96' }: { height?: string }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden bg-white border border-slate-100', height)}>
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Admin table page skeleton — header + search bar + table
function AdminTableSkeleton({ cols = 5, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      {/* Search */}
      <div className="bg-white border border-slate-200/80 p-3 rounded-xl">
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-6 py-3.5">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableRowSkeleton rows={rows} cols={cols} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { Skeleton, TableRowSkeleton, StatCardSkeleton, CardSkeleton, AdminTableSkeleton }
