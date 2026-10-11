'use client';

import { memo } from 'react';
import { Globe } from 'lucide-react';

export interface AdminLanguageOption {
  code: string;
  label: string;
  flag: string;
  short: string;
}

export const ADMIN_SUPPORTED_LANGUAGES: readonly AdminLanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', short: 'VI' },
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳', short: 'ZH' },
  { code: 'ko', label: '한국어 (Korean)', flag: '🇰🇷', short: 'KO' },
  { code: 'ja', label: '日本語 (Japanese)', flag: '🇯🇵', short: 'JA' },
] as const;

export type SupportedLangCode = 'vi' | 'en' | 'zh' | 'ko' | 'ja';

export const createEmptyI18nRecord = (defaultVal = ''): Record<string, string> => ({
  vi: defaultVal,
  en: '',
  zh: '',
  ko: '',
  ja: '',
});

export const toI18nRecord = (val: any, defaultVal = ''): Record<string, string> => {
  if (!val) return createEmptyI18nRecord(defaultVal);
  if (typeof val === 'string') return { vi: val, en: '', zh: '', ko: '', ja: '' };
  return {
    vi: val.vi ?? defaultVal,
    en: val.en ?? '',
    zh: val.zh ?? '',
    ko: val.ko ?? '',
    ja: val.ja ?? '',
  };
};

export const sanitizeI18nRecord = (rec: Record<string, string>): Record<string, string> => {
  const vi = rec?.vi || '';
  const en = rec?.en || vi;
  return {
    vi,
    en,
    zh: rec?.zh || en || vi,
    ko: rec?.ko || en || vi,
    ja: rec?.ja || en || vi,
  };
};

interface AdminI18nTabsProps {
  activeLang: string;
  onChange: (code: string) => void;
  hasContent?: Record<string, boolean>;
  label?: string;
  className?: string;
}

export const AdminI18nTabs = memo(function AdminI18nTabs({
  activeLang,
  onChange,
  hasContent,
  label,
  className = '',
}: AdminI18nTabsProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>{label}</span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        {ADMIN_SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = activeLang === lang.code;
          const filled = hasContent ? hasContent[lang.code] : undefined;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onChange(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 ring-1 ring-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {filled !== undefined && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    filled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  title={filled ? 'Đã có nội dung' : 'Chưa có nội dung'}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default AdminI18nTabs;
