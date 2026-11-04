'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react';
import { getI18nText, formatLocalizedDate } from '@/lib/utils';
import { FALLBACK_NEWS_THUMB, calculateReadingTime } from './newsConstants';

export interface HeroSpotlightProps {
  article: any;
  locale: string;
  categoryLabel: string;
  featuredBadge: string;
  readMoreText: string;
  minReadText: string;
}

export const HeroSpotlightCard = memo(function HeroSpotlightCard({
  article,
  locale,
  categoryLabel,
  featuredBadge,
  readMoreText,
  minReadText,
}: HeroSpotlightProps) {
  const title = getI18nText(article.title, locale);
  const rawExcerpt = getI18nText(article.excerpt || article.content, locale);
  const plainExcerpt = rawExcerpt ? rawExcerpt.replace(/<[^>]*>/g, '').trim() : '';
  const thumb = article.thumbnail || FALLBACK_NEWS_THUMB;
  const href = article.slug ? `/${locale}/news/${article.slug}` : `/${locale}/news`;

  const formattedDate = useMemo(() => {
    return formatLocalizedDate(article.publishedAt || article.createdAt, locale);
  }, [article.publishedAt, article.createdAt, locale]);

  const readingTime = useMemo(() => {
    const rawContent = getI18nText(article.content || article.excerpt, locale);
    return calculateReadingTime(rawContent);
  }, [article.content, article.excerpt, locale]);

  const authorName = article.author || 'Travel Editor';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <Link
      href={href}
      className="group block relative w-full h-full min-h-[440px] sm:min-h-[480px] lg:min-h-[540px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-200/80"
    >
      {/* Background Image with Ken Burns Zoom */}
      <SmartImage
        src={thumb}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 60vw"
        fallbackSrc={FALLBACK_NEWS_THUMB}
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        priority
      />

      {/* Multi-layered cinematic gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent" />

      {/* Top Floating Badges */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600/90 hover:bg-blue-600 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors">
            {categoryLabel}
          </span>
          <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {featuredBadge}
          </span>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 z-10 text-white space-y-3.5">
        {/* Meta Row: Date & Reading Time */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-semibold">
          {formattedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {formattedDate}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {readingTime} {minReadText}
          </span>
        </div>

        {/* Big Catchy Title */}
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight group-hover:text-blue-300 transition-colors line-clamp-2 sm:line-clamp-3">
          {title}
        </h3>

        {/* Excerpt Lead */}
        {plainExcerpt && (
          <p className="text-slate-200 text-xs sm:text-sm line-clamp-2 leading-relaxed opacity-90">
            {plainExcerpt}
          </p>
        )}

        {/* Author Footer & CTA Button */}
        <div className="pt-2 flex items-center justify-between border-t border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {authorInitial}
            </div>
            <span className="text-xs font-bold text-slate-200">{authorName}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-300 group-hover:text-white transition-colors">
            <span>{readMoreText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
});
