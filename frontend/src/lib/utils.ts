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
  const obj = i18nObj as Record<string, string>;

  // 1. Direct match for requested locale
  const direct = obj[locale]?.trim();
  if (direct) return direct;

  // 2. International fallback: if viewing non-VI locale (en, zh, ko, ja), prefer English before Vietnamese
  if (locale !== 'vi') {
    const enVal = obj.en?.trim();
    if (enVal) return enVal;
  }

  // 3. Fallback to Vietnamese (primary platform language)
  const viVal = obj.vi?.trim();
  if (viVal) return viVal;

  // 4. Any other language present
  for (const key of ['en', 'zh', 'ko', 'ja']) {
    const val = obj[key]?.trim();
    if (val) return val;
  }

  return fallback;
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

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}

export function toSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}


