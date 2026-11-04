'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { toast } from '@/stores/toastStore';
import { useTranslations } from 'next-intl';

export interface ShareArticleButtonProps {
  title?: string;
  buttonText?: string;
}

export function ShareArticleButton({ title, buttonText }: ShareArticleButtonProps) {
  const t = useTranslations('newsDetail');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: title || '', url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success(t('shareSuccess') || 'Đã sao chép liên kết bài viết thành công!');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Không thể sao chép liên kết.');
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-xs cursor-pointer hover:bg-slate-100 hover:text-blue-600 transition-colors"
      title={buttonText || t('shareArticle')}
    >
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-blue-600" />}
      <span>{copied ? 'Đã chép link' : (buttonText || t('shareArticle'))}</span>
    </button>
  );
}

export default ShareArticleButton;
