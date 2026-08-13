'use client';

import '../globals.css';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin CMS Error Boundary caught error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-100">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30 animate-pulse">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Hệ Thống Admin CMS Có Lỗi Phat Sinh</h2>
          <p className="text-slate-400 text-xs mt-2 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 font-mono break-all text-rose-300">
            {error.message || 'Lỗi không xác định'}
          </p>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" /> Thử Thải Lại (Retry)
          </button>
          <a
            href="/admin"
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" /> Về Trang Tổng Quan
          </a>
        </div>
      </div>
    </div>
  );
}
