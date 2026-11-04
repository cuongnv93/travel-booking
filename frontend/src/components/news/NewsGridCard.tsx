'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { Calendar, Clock, User, ArrowRight, Tag, Bookmark } from 'lucide-react';
import { getI18nText, formatLocalizedDate } from '@/lib/utils';
import { FALLBACK_NEWS_IMG, calculateReadingTime } from './newsConstants';

export interface NewsGridCardProps {
  article: any;
  locale: string;
  categoryLabel: string;
  readMoreText: string;
  editorText: string;
  minReadText: string;
  isBookmarked: boolean;
  onToggleBookmark: (slug: string) => void;
  bookmarkTitle?: string;
}

export const NewsGridCard = memo(function NewsGridCard({
  article,
  locale,
  categoryLabel,
  readMoreText,
  editorText,
  minReadText,
  isBookmarked,
  onToggleBookmark,
  bookmarkTitle,
}: NewsGridCardProps) {
  const title = getI18nText(article.title, locale);
  const excerpt = getI18nText(article.excerpt, locale);
  const thumbnail = article.thumbnail || FALLBACK_NEWS_IMG;

  const formattedDate = useMemo(() => {
    const rawDate = article.publishedAt || article.createdAt;
    return formatLocalizedDate(rawDate, locale);
  }, [article.publishedAt, article.createdAt, locale]);

  const readingTime = useMemo(() => {
    const rawContent = getI18nText(article.content || article.excerpt, locale);
    return calculateReadingTime(rawContent);
  }, [article.content, article.excerpt, locale]);

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      {/* Thumbnail */}
      <div className="h-56 bg-slate-100 overflow-hidden relative">
        <Link href={`/${locale}/news/${article.slug}`} className="block w-full h-full">
          <SmartImage
            src={thumbnail}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallbackSrc={FALLBACK_NEWS_IMG}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Category Pill */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10 pointer-events-none">
          <Tag className="w-3 h-3" />
          {categoryLabel}
        </div>

        {/* Bookmark Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleBookmark(article.slug);
          }}
          className={`absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
            isBookmarked
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
          title={bookmarkTitle || (isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết')}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Body Info */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3 font-medium">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {formattedDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {readingTime} {minReadText}
            </span>
          </div>

          <Link href={`/${locale}/news/${article.slug}`}>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2.5 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>

          <p className="text-slate-500 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-6">
            {excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {article.author || editorText}
          </span>

          <Link
            href={`/${locale}/news/${article.slug}`}
            className="flex items-center gap-1 text-blue-600 font-extrabold text-xs sm:text-sm group-hover:translate-x-1 transition-transform"
          >
            <span>{readMoreText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
});
