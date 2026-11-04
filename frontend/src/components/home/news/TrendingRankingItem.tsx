'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { Clock } from 'lucide-react';
import { getI18nText, formatLocalizedDate } from '@/lib/utils';
import { FALLBACK_NEWS_THUMB, calculateReadingTime } from './newsConstants';

export interface TrendingRankingProps {
  article: any;
  rankIndex: number;
  locale: string;
  categoryLabel: string;
  minReadText: string;
}

export const TrendingRankingItem = memo(function TrendingRankingItem({
  article,
  rankIndex,
  locale,
  categoryLabel,
  minReadText,
}: TrendingRankingProps) {
  const title = getI18nText(article.title, locale);
  const thumb = article.thumbnail || FALLBACK_NEWS_THUMB;
  const href = article.slug ? `/${locale}/news/${article.slug}` : `/${locale}/news`;

  const formattedDate = useMemo(() => {
    return formatLocalizedDate(article.publishedAt || article.createdAt, locale);
  }, [article.publishedAt, article.createdAt, locale]);

  const readingTime = useMemo(() => {
    const rawContent = getI18nText(article.content || article.excerpt, locale);
    return calculateReadingTime(rawContent);
  }, [article.content, article.excerpt, locale]);

  const rankNumber = `#0${rankIndex + 1}`;

  return (
    <Link
      href={href}
      className="group flex items-start gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all duration-300 shadow-2xs hover:shadow-md"
    >
      {/* Ranking Stylized Typography */}
      <span className="text-xl sm:text-2xl font-black text-slate-300 group-hover:text-blue-600 transition-colors shrink-0 w-8 sm:w-10 pt-1 font-mono">
        {rankNumber}
      </span>

      {/* Square Thumbnail */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden relative shrink-0 bg-slate-100 border border-slate-200/60 shadow-2xs">
        <SmartImage
          src={thumb}
          alt={title}
          fill
          sizes="(max-width: 640px) 80px, 96px"
          fallbackSrc={FALLBACK_NEWS_THUMB}
          className="object-cover group-hover:scale-108 transition-transform duration-500"
        />
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {categoryLabel}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {title}
          </h4>
        </div>

        {/* Footer info: Date & Min read */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
          {formattedDate && <span>{formattedDate}</span>}
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3 text-amber-500" />
            {readingTime} {minReadText}
          </span>
        </div>
      </div>
    </Link>
  );
});
