'use client';

import React from 'react';
import { useToastStore } from '@/stores/toastStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ClientToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isWarning = t.type === 'warning';

        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-250 ${
              isSuccess
                ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-950/20'
                : isError
                ? 'bg-rose-950/95 text-rose-50 border-rose-500/40 shadow-rose-950/20'
                : isWarning
                ? 'bg-amber-950/95 text-amber-50 border-amber-500/40 shadow-amber-950/20'
                : 'bg-slate-900/95 text-white border-blue-500/40 shadow-blue-950/20'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              {t.title && <p className="text-xs font-bold leading-tight">{t.title}</p>}
              <p className="text-xs sm:text-sm font-medium opacity-90 leading-relaxed break-words">{t.message}</p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              aria-label="Close notification"
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ClientToastContainer;
