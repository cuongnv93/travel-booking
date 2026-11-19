'use client';

import React from 'react';
import { AlertTriangle, Trash2, HelpCircle, Info, X, Loader2 } from 'lucide-react';

export interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'info';
  isLoading?: boolean;
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-100 text-rose-600 border border-rose-200',
          btn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
          Icon: Trash2,
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100 text-amber-600 border border-amber-200',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
          Icon: AlertTriangle,
        };
      case 'info':
        return {
          iconBg: 'bg-sky-100 text-sky-600 border border-sky-200',
          btn: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500',
          Icon: Info,
        };
      case 'primary':
      default:
        return {
          iconBg: 'bg-blue-100 text-blue-600 border border-blue-200',
          btn: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
          Icon: HelpCircle,
        };
    }
  };

  const { iconBg, btn, Icon } = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {title || (isDanger ? 'Xác nhận xóa' : isWarning ? 'Cảnh báo' : 'Xác nhận thao tác')}
              </h3>
              <div className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
                {message}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={async () => {
                await onConfirm();
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 ${btn}`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmModal;
