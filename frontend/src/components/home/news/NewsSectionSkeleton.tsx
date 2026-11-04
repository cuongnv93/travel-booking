import { memo } from 'react';

export const NewsSectionSkeleton = memo(function NewsSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
      {/* Left Spotlight Skeleton */}
      <div className="lg:col-span-7 h-[440px] sm:h-[480px] lg:h-[540px] rounded-3xl bg-slate-200/80 p-8 flex flex-col justify-end space-y-4">
        <div className="h-6 w-28 bg-slate-300 rounded-full" />
        <div className="h-8 w-4/5 bg-slate-300 rounded-lg" />
        <div className="h-4 w-2/3 bg-slate-300 rounded-md" />
        <div className="h-10 w-full bg-slate-300/60 rounded-xl" />
      </div>

      {/* Right List Skeletons */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100">
            <div className="w-8 h-8 rounded bg-slate-200" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3.5 w-16 bg-slate-200 rounded-full" />
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-3 w-28 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
