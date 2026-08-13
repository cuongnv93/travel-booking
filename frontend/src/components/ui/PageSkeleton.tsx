export function PageBannerSkeleton() {
  return (
    <div className="h-64 md:h-80 rounded-3xl overflow-hidden bg-slate-200 animate-pulse mb-10 mt-20" />
  );
}

export function CardGridSkeleton({ cols = 3, rows = 2 }: { cols?: number; rows?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-6`}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} className="bg-slate-200 rounded-3xl h-72 animate-pulse" />
      ))}
    </div>
  );
}

export function ArticleDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-24 pb-24 space-y-8">
      <div className="h-6 w-64 bg-slate-200 rounded-full animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 bg-white rounded-3xl p-10 space-y-6">
          <div className="h-8 w-1/2 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-slate-200 rounded-full animate-pulse" style={{ width: `${90 - i * 5}%` }} />)}
          </div>
        </div>
        <div className="lg:col-span-3 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 p-2">
              <div className="w-16 h-16 bg-slate-200 rounded-xl animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="space-y-10 pb-20">
      <div className="h-[600px] bg-slate-200 animate-pulse" />
      <div className="container mx-auto px-4 space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded-full animate-pulse mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-72 bg-slate-200 rounded-3xl animate-pulse" />)}
        </div>
      </div>
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 mt-20 space-y-8">
      <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-slate-200 rounded-3xl animate-pulse" />)}
      </div>
    </div>
  );
}
