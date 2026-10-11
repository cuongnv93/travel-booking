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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center space-y-6 shadow-xl">
        <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-lg flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Hệ Thống Admin CMS Có Lỗi Phát Sinh</h2>
          <p className="text-slate-400 text-xs mt-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono break-all text-rose-300">
            {error.message || 'Lỗi không xác định'}
          </p>
        </div>

        <div className="flex gap-2.5 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử Tải Lại
          </button>
          <a
            href="/admin"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Trang Tổng Quan
          </a>
        </div>
      </div>
    </div>
  );
}
