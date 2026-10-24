'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Compass } from 'lucide-react';
import Link from 'next/link';

export default function LocaleErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service without exposing raw internals to users
    console.error('[Application Runtime Error Boundary Caught]:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center space-y-6 shadow-xl shadow-slate-200/50">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/70 shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Travel Booking</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Đã Xảy Ra Sự Cố Bất Ngờ
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
            Hệ thống tạm thời gặp trục trặc khi tải nội dung trang này. Dữ liệu của bạn hoàn toàn an toàn, vui lòng thử tải lại hoặc quay về trang chủ.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Thử Tải Lại Trang
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-6 py-3 rounded-xl border border-slate-200 transition-all"
          >
            <Home className="w-4 h-4" /> Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
