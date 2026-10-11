import React from 'react';

const ShimmerBox = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`relative overflow-hidden bg-slate-200/75 ${className}`} style={style}>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer pointer-events-none" />
  </div>
);

export function PageBannerSkeleton() {
  return (
    <ShimmerBox className="h-64 md:h-80 rounded-3xl mb-10 mt-20" />
  );
}

export function CardGridSkeleton({ cols = 3, rows = 2 }: { cols?: number; rows?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-6`}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <ShimmerBox key={i} className="rounded-3xl h-72" />
      ))}
    </div>
  );
}

export function ArticleDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-24 pb-24 space-y-8">
      <ShimmerBox className="h-6 w-64 rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 bg-white rounded-3xl p-10 space-y-6 border border-slate-100 shadow-sm">
          <ShimmerBox className="h-8 w-1/2 rounded-full" />
          <ShimmerBox className="h-64 rounded-3xl" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <ShimmerBox key={i} className="h-4 rounded-full" style={{ width: `${90 - i * 5}%` }} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-3 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 p-2 bg-white rounded-2xl border border-slate-100">
              <ShimmerBox className="w-16 h-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <ShimmerBox className="h-3 rounded" />
                <ShimmerBox className="h-3 w-3/4 rounded" />
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
      <ShimmerBox className="h-[520px] md:h-[620px]" />
      <div className="container mx-auto px-4 space-y-4">
        <ShimmerBox className="h-8 w-48 rounded-full mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <ShimmerBox key={i} className="h-72 rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <ShimmerBox className="h-64 rounded-3xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ShimmerBox key={i} className="h-72 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
