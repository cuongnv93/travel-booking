import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { I18nText } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getI18nText(
  i18nObj: I18nText | Record<string, string> | string | undefined | null,
  locale: string,
  fallback = ''
): string {
  if (!i18nObj) return fallback;
  if (typeof i18nObj === 'string') return i18nObj || fallback;
  return (
    (i18nObj as Record<string, string>)[locale] ||
    (i18nObj as Record<string, string>).vi ||
    (i18nObj as Record<string, string>).en ||
    fallback
  );
}

export function formatLocalizedDate(
  dateVal: string | number | Date | undefined | null,
  locale = 'vi'
): string {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const dateLocales: Record<string, string> = {
      vi: 'vi-VN',
      en: 'en-US',
      zh: 'zh-CN',
      ko: 'ko-KR',
      ja: 'ja-JP',
    };
    return d.toLocaleDateString(dateLocales[locale] || 'vi-VN');
  } catch {
    return '';
  }
}

