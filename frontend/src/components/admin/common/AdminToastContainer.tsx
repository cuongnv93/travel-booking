'use client';

import React from 'react';
import { useToastStore } from '@/stores/toastStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function AdminToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isWarning = t.type === 'warning';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-slate-900/95 text-white border-emerald-500/30'
                : isError
                ? 'bg-rose-950/95 text-rose-50 border-rose-500/40'
                : isWarning
                ? 'bg-amber-950/95 text-amber-50 border-amber-500/40'
                : 'bg-slate-900/95 text-white border-blue-500/30'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-blue-400" />}
            </div>

            <div className="flex-1 space-y-0.5">
              {t.title && <p className="text-xs font-bold leading-tight">{t.title}</p>}
              <p className="text-xs font-medium opacity-90 leading-relaxed">{t.message}</p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
