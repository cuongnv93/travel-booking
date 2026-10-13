import type { Metadata } from 'next';
import { Calendar, User, Tag, ArrowLeft, Share2, Clock, Sparkles, ChevronRight, Star, MapPin, ArrowUpRight } from 'lucide-react';
import { getI18nText, formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prefetchNewsBySlug, prefetchNews, prefetchTours } from '@/lib/serverApi';

async function getRelatedArticles(currentSlug: string) {
  try {
    const list = await prefetchNews();
    return list.filter((item: any) => item.slug !== currentSlug).slice(0, 5);
  } catch {
    return [];
  }
}

async function getFeaturedTours() {
  try {
    return await prefetchTours({ limit: '4' });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const slug = resolved?.slug || '';
  const article = await prefetchNewsBySlug(slug);
  const t = await getTranslations({ locale, namespace: 'newsDetail' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  if (!article) {
    return {
      title: t('notFoundTitle'),
      description: t('notFoundDesc')
    };
  }

  const title = getI18nText(article.title, locale);
  const excerpt = getI18nText(article.excerpt, locale);
  const image = article.thumbnail || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200';

  return {
    title: `${title} | Travel News`,
    description: excerpt.substring(0, 160),
    keywords: [article.category, 'tin tuc du lich', 'cam nang du lich', title],
    alternates: {
      canonical: `${baseUrl}/${locale}/news/${slug}`,
      languages: {
        vi: `${baseUrl}/vi/news/${slug}`,
        en: `${baseUrl}/en/news/${slug}`,
        zh: `${baseUrl}/zh/news/${slug}`,
        ko: `${baseUrl}/ko/news/${slug}`,
        ja: `${baseUrl}/ja/news/${slug}`,
        'x-default': `${baseUrl}/vi/news/${slug}`,
      },
    },
    openGraph: {
      title: `${title} | Travel News`,
      description: excerpt.substring(0, 160),
      url: `${baseUrl}/${locale}/news/${slug}`,
      type: 'article',
      images: [{ url: image, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt.substring(0, 160),
      images: [image],
    }
  };
}

export default async function NewsDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string };
}) {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const slug = resolved?.slug || '';
  const article = await prefetchNewsBySlug(slug);
  const relatedArticles = await getRelatedArticles(slug);
  const featuredTours = await getFeaturedTours();
  const t = await getTranslations({ locale, namespace: 'newsDetail' });

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-28 mt-12 text-center max-w-lg">
        <h1 className="text-2xl font-extrabold mb-3 text-slate-900">
          {t('notFoundTitle')}
        </h1>
        <p className="text-slate-500 mb-8 text-sm">
          {t('notFoundDesc')}
        </p>
        <Link
          href={`/${locale}/news`}
          className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl hover:bg-blue-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> {t('backToNews')}
        </Link>
      </div>
    );
  }

  const title = getI18nText(article.title, locale);
  const content = getI18nText(article.content, locale);
  const excerpt = getI18nText(article.excerpt, locale);
  const thumbnail = article.thumbnail || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200';
  const publishDate = new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString(
    locale === 'vi' ? 'vi-VN' : locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : locale === 'ko' ? 'ko-KR' : 'en-US',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  );

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    image: [thumbnail],
    datePublished: article.createdAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || 'Travel'
    }
  };

  return (
    <div className="bg-slate-50/70 min-h-screen pb-24 pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Top Navigation & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-200/80 pb-4">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">
              {t('home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link href={`/${locale}/news`} className="hover:text-blue-600 transition-colors">
              {t('news')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-900 font-semibold truncate max-w-[280px]">{title}</span>
          </nav>

          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t('allArticles')}
          </Link>
        </div>

        {/* 3/4 & 1/4 Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 3/4 Width Main Article Column (lg:col-span-9) */}
          <main className="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
            
            {/* Article Header Details */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  {article.category || t('news')}
                </span>
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {publishDate}
                </span>
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {t('readTime')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {title}
              </h1>

              {/* Author Meta */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  {(article.author || 'T').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">{article.author || 'Travel'}</h4>
                  <p className="text-[11px] text-slate-500">{t('authorRole')}</p>
                </div>
              </div>
            </div>

            {/* Featured Image Header */}
            <div className="h-[350px] sm:h-[480px] rounded-3xl overflow-hidden shadow-md relative border border-slate-100">
              <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
            </div>

            {/* Excerpt Lead Box */}
            {excerpt && (
              <div className="p-5 bg-blue-50/70 rounded-2xl border-l-4 border-blue-600 text-slate-800 text-base md:text-lg font-medium italic leading-relaxed">
                &ldquo;{excerpt}&rdquo;
              </div>
            )}

            {/* Main Content Render */}
            <div 
              className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base md:text-lg prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-blue-600 prose-img:rounded-2xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ 
                __html: content || `<p className="leading-relaxed">${excerpt}</p>` 
              }} 
            />

            {/* Article Footer & Author Box */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/70">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                  {(article.author || 'T').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{article.author || 'Travel Editor'}</h4>
                  <p className="text-xs text-slate-500">{t('authorBio')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-xs cursor-pointer hover:bg-slate-100 transition-colors">
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>{t('shareArticle')}</span>
              </div>
            </div>
          </main>

          {/* 1/4 Width Sidebar Column (lg:col-span-3) */}
          <aside className="lg:col-span-3 space-y-6 sticky top-24">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {t('relatedTitle')}
                </h3>
              </div>

              <div className="space-y-4">
                {relatedArticles.map((relItem: any) => {
                  const relTitle = getI18nText(relItem.title, locale);
                  const relThumb = relItem.thumbnail || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600';
                  const relDate = new Date(relItem.publishedAt || relItem.createdAt || Date.now()).toLocaleDateString(
                    locale === 'vi' ? 'vi-VN' : locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : locale === 'ko' ? 'ko-KR' : 'en-US'
                  );

                  return (
                    <Link
                      key={relItem._id || relItem.id || relItem.slug}
                      href={`/${locale}/news/${relItem.slug}`}
                      className="group flex gap-3 items-center p-2 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200/80"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative shadow-xs">
                        <img
                          src={relThumb}
                          alt={relTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                          {relTitle}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          {relDate}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <Link
                href={`/${locale}/news`}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl text-center block transition-colors shadow-xs"
              >
                {t('viewAllArticles')}
              </Link>
            </div>
          </aside>

        </div>

        {/* BOTTOM SECTION: Các Tour Du Lịch Nổi Bật */}
        <section className="mt-16 pt-12 border-t border-slate-200/80 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
                {t('recommendedBadge')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('featuredToursTitle')}
              </h2>
            </div>
            <Link
              href={`/${locale}/tours`}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 bg-white border border-slate-200/90 px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all"
            >
              {t('viewAllTours')} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTours.map((tour: any) => {
              const tourId = tour._id || tour.id;
              const tourTitle = getI18nText(tour.title, locale);
              const tourImage = tour.images?.[0] || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';

              return (
                <div 
                  key={tourId}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Tour Image */}
                  <div className="h-48 overflow-hidden relative bg-slate-100">
                    <img 
                      src={tourImage} 
                      alt={tourTitle} 
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" 
                    />
                    <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Tour
                    </div>
                    {tour.destination && (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {tour.destination}
                      </div>
                    )}
                  </div>

                  {/* Tour Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{tour.rating || 5.0}</span>
                        <span className="text-slate-400 font-normal">({tour.reviewCount || 12})</span>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {tourTitle}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {t('priceFrom')}
                        </span>
                        <span className="font-extrabold text-base text-orange-600">{formatPrice(tour.price || 0)}</span>
                      </div>

                      <Link
                        href={`/${locale}/tours/${tour.slug || tourId}`}
                        className="bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shrink-0"
                      >
                        {t('bookNow')}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
