'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Save, AlertTriangle, Loader2 } from 'lucide-react';

export interface AdminStepItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badgeCount?: number;
}

interface AdminStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'blue' | 'amber' | 'emerald' | 'rose';
  };
  steps: AdminStepItem[];
  activeStep: string;
  onStepChange: (stepId: string) => void;
  isDirty?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSave: (e?: React.FormEvent) => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function AdminStepperModal({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  steps,
  activeStep,
  onStepChange,
  isDirty = false,
  isSubmitting = false,
  submitLabel = 'Lưu Thay Đổi',
  onSave,
  children,
  maxWidth = 'max-w-4xl',
}: AdminStepperModalProps) {
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  // Reset confirmation state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowConfirmDiscard(false);
    }
  }, [isOpen]);

  const handleSafeClose = useCallback(() => {
    if (isDirty) {
      setShowConfirmDiscard(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Handle keyboard events (ESC key)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showConfirmDiscard) {
          setShowConfirmDiscard(false);
        } else {
          handleSafeClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showConfirmDiscard, handleSafeClose]);

  if (!isOpen) return null;

  const currentStepIndex = Math.max(0, steps.findIndex((s) => s.id === activeStep));
  const hasPrev = currentStepIndex > 0;
  const hasNext = currentStepIndex < steps.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      onStepChange(steps[currentStepIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onStepChange(steps[currentStepIndex + 1].id);
    }
  };

  const getBadgeClass = (variant = 'blue') => {
    switch (variant) {
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className={`bg-white border border-slate-200/90 w-full ${maxWidth} rounded-2xl flex flex-col shadow-2xl max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
              {badge && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getBadgeClass(badge.variant)}`}>
                  {badge.text}
                </span>
              )}
              {isDirty && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Chưa lưu
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={handleSafeClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Đóng biểu mẫu (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigation Bar */}
        <div className="px-6 py-2.5 border-b border-slate-100 bg-white shrink-0 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1 sm:gap-2 min-w-max">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = step.id === activeStep;
              const isPast = idx < currentStepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepChange(step.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isPast
                      ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isPast
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}

                  <span>{step.label}</span>

                  {typeof step.badgeCount === 'number' && step.badgeCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {step.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">{children}</div>

        {/* Sticky Action Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSafeClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Hủy / Đóng
          </button>

          <div className="flex items-center gap-2">
            {hasPrev && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </button>
            )}

            {hasNext && (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Tiếp theo
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onSave}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Unsaved Changes Confirmation Dialog */}
        {showConfirmDiscard && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Rời khỏi mà chưa lưu?</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Bạn có những thay đổi chưa được lưu trên biểu mẫu này. Nếu thoát bây giờ, tất cả thông tin vừa chỉnh sửa sẽ bị mất.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmDiscard(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tiếp tục chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmDiscard(false);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Xác nhận bỏ thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
