export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-10 mt-20">
      {/* Stepper skeleton */}
      <div className="mb-10 max-w-3xl mx-auto">
        <div className="h-14 rounded-2xl bg-slate-200/75 animate-pulse" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left column skeleton */}
        <div className="flex-1 space-y-6 w-full">
          <div className="h-10 w-64 rounded-xl bg-slate-200/75 animate-pulse" />
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white border border-slate-200/80 p-5 flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-44 h-32 rounded-2xl bg-slate-200/75 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-28 rounded bg-slate-200/75 animate-pulse" />
                <div className="h-6 w-3/4 rounded bg-slate-200/75 animate-pulse" />
                <div className="h-10 w-full rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
          <div className="h-80 rounded-3xl bg-white border border-slate-200/80 p-6 space-y-4">
            <div className="h-6 w-48 rounded bg-slate-200/75 animate-pulse" />
            <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
            </div>
            <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>

        {/* Right sidebar skeleton */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="h-[460px] rounded-3xl bg-white border border-slate-200/80 p-6 space-y-5">
            <div className="h-6 w-44 rounded bg-slate-200/75 animate-pulse" />
            <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-14 rounded-2xl bg-slate-200/75 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
