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

export function getI18nText(i18nObj: I18nText | string | undefined | null, locale: string): string {
  if (!i18nObj) return '';
  if (typeof i18nObj === 'string') return i18nObj;
  return i18nObj[locale as keyof I18nText] || i18nObj.vi || i18nObj.en || '';
}
