'use client';

import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  User,
  ArrowRight,
  Tag,
  Search,
  X,
  LayoutGrid,
  List as ListIcon,
  Bookmark,
  Clock,
  Sparkles,
  Send,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { getI18nText, formatLocalizedDate } from '@/lib/utils';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { VideoBackground } from '@/components/ui/VideoBackground';
import { DEFAULT_NEWS } from '@/lib/defaultNews';
import { toast } from '@/stores/toastStore';

const fetchNews = async () => {
  try {
    const res: any = await api.get('/news?limit=50');
    const list = Array.isArray(res) ? res : (res?.data || []);
    return list.length > 0 ? list : DEFAULT_NEWS;
  } catch {
    return DEFAULT_NEWS;
  }
};

const CATEGORY_ITEMS = [
  { key: '', label: 'Tất cả bài viết', labelEn: 'All Articles', labelZh: '全部文章', labelKo: '전체 글', labelJa: 'すべての記事' },
  { key: 'experience', label: 'Kinh nghiệm', labelEn: 'Experience', labelZh: '旅行经验', labelKo: '여행 팁', labelJa: '旅行体験' },
  { key: 'destination', label: 'Điểm đến', labelEn: 'Destinations', labelZh: '热门目的地', labelKo: '추천 여행지', labelJa: '観光スポット' },
  { key: 'food', label: 'Ẩm thực', labelEn: 'Cuisine', labelZh: '美食天地', labelKo: '미식 탐방', labelJa: 'グルメ' },
  { key: 'international', label: 'Quốc tế', labelEn: 'International', labelZh: '国际旅游', labelKo: '해외 여행', labelJa: '海外旅行' },
];

const HOT_DESTINATIONS = [
  {
    key: '',
    label: 'Tất cả điểm đến',
    labelEn: 'All Destinations',
    labelZh: '全部目的地',
    labelKo: '전체 여행지',
    labelJa: 'すべての目的地',
    image: '',
    keywords: [],
  },
  {
    key: 'da-lat',
    label: 'Đà Lạt',
    labelEn: 'Da Lat',
    labelZh: '大叻',
    labelKo: '달랏',
    labelJa: 'ダラット',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200',
    keywords: ['đà lạt', 'da lat', 'dalat'],
  },
  {
    key: 'phu-quoc',
    label: 'Phú Quốc',
    labelEn: 'Phu Quoc',
    labelZh: '富国岛',
    labelKo: '푸꾸옥',
    labelJa: 'フーコック',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200',
    keywords: ['phú quốc', 'phu quoc', 'phuquoc'],
  },
  {
    key: 'da-nang',
    label: 'Đà Nẵng',
    labelEn: 'Da Nang',
    labelZh: '岘港',
    labelKo: '다낭',
    labelJa: 'ダナン',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200',
    keywords: ['đà nẵng', 'da nang', 'danang', 'bà nà', 'sơn trà'],
  },
  {
    key: 'ha-noi',
    label: 'Hà Nội',
    labelEn: 'Hanoi',
    labelZh: '河内',
    labelKo: '하노이',
    labelJa: 'ハノイ',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=200',
    keywords: ['hà nội', 'ha noi', 'hanoi'],
  },
  {
    key: 'sapa',
    label: 'Sa Pa',
    labelEn: 'Sapa',
    labelZh: '沙坝',
    labelKo: '사파',
    labelJa: 'サパ',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200',
    keywords: ['sa pa', 'sapa', 'fansipan'],
  },
  {
    key: 'ha-long',
    label: 'Hạ Long',
    labelEn: 'Halong Bay',
    labelZh: '下龙湾',
    labelKo: '하롱베이',
    labelJa: 'ハロン湾',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=200',
    keywords: ['hạ long', 'ha long', 'halong'],
  },
];

const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200';

const calculateReadingTime = (text: string): number => {
  if (!text) return 3;
  const plain = text.replace(/<[^>]*>/g, ' ').trim();
  const words = plain.split(/s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 200));
};

interface Props {
  initialNews: any[];
  newsBanner: string;
  newsVideo?: string;
}

// 1. Grid View Card
const NewsGridCard = memo(function NewsGridCard({
  article,
  locale,
  categoryLabel,
  readMoreText,
  editorText,
  minReadText,
  isBookmarked,
  onToggleBookmark,
  bookmarkTitle,
}: {
  article: any;
  locale: string;
  categoryLabel: string;
  readMoreText: string;
  editorText: string;
  minReadText: string;
  isBookmarked: boolean;
  onToggleBookmark: (slug: string) => void;
  bookmarkTitle?: string;
}) {
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

// 2. List View Card (Horizontal Magazine Layout)
const NewsListCard = memo(function NewsListCard({
  article,
  locale,
  categoryLabel,
  readMoreText,
  editorText,
  minReadText,
  isBookmarked,
  onToggleBookmark,
  bookmarkTitle,
  seoGuideBadge,
}: {
  article: any;
  locale: string;
  categoryLabel: string;
  readMoreText: string;
  editorText: string;
  minReadText: string;
  isBookmarked: boolean;
  onToggleBookmark: (slug: string) => void;
  bookmarkTitle?: string;
  seoGuideBadge?: string;
}) {
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
    <div className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row relative">
      {/* Thumbnail */}
      <div className="sm:w-72 md:w-80 h-56 sm:h-auto bg-slate-100 overflow-hidden relative shrink-0">
        <Link href={`/${locale}/news/${article.slug}`} className="block w-full h-full">
          <SmartImage
            src={thumbnail}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            fallbackSrc={FALLBACK_NEWS_IMG}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10 pointer-events-none">
          <Tag className="w-3 h-3" />
          {categoryLabel}
        </div>
      </div>

      {/* Info Column */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
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
              <span className="flex items-center gap-1 text-slate-600 font-semibold">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {article.author || editorText}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onToggleBookmark(article.slug)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
              }`}
              title={bookmarkTitle || (isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết')}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <Link href={`/${locale}/news/${article.slug}`}>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>

          <p className="text-slate-500 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
            {excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
            {seoGuideBadge || 'Cẩm Nang Hữu Ích'}
          </span>

          <Link
            href={`/${locale}/news/${article.slug}`}
            className="flex items-center gap-1.5 text-blue-600 font-extrabold text-xs sm:text-sm group-hover:translate-x-1.5 transition-transform"
          >
            <span>{readMoreText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
});

// 3. Editorial Newsletter Subscription Box
const NewsNewsletterBox = memo(function NewsNewsletterBox({
  title,
  desc,
  placeholder,
  btnText,
  badgeText,
  subscribedSuccessText,
  invalidEmailText,
  subscribeSuccessToast,
}: {
  title: string;
  desc: string;
  placeholder: string;
  btnText: string;
  badgeText?: string;
  subscribedSuccessText?: string;
  invalidEmailText?: string;
  subscribeSuccessToast?: string;
}) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.warning(invalidEmailText || 'Vui lòng nhập đúng định dạng email hợp lệ!');
      return;
    }
    setSubscribed(true);
    toast.success(subscribeSuccessToast || 'Đăng ký nhận cẩm nang du lịch thành công! Chúng tôi đã gửi email xác nhận.');
  };

  return (
    <div className="relative my-14 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-white/10">
      {/* Decorative Blur Circles */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-600/30 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{badgeText || 'Bản Tin Du Lịch VIP'}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
          {title}
        </h3>

        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          {desc}
        </p>

        {subscribed ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl max-w-md mx-auto text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{subscribedSuccessText || 'Cảm ơn bạn! Hãy kiểm tra hộp thư để nhận cẩm nang mới nhất.'}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md hover:shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>{btnText}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
});

function NewsClientComponent({
  initialNews,
  newsBanner,
  newsVideo = 'https://res.cloudinary.com/demo/video/upload/so_0,eo_12,q_auto,w_1280,ac_none/forest_bike.mp4',
}: Props) {
  const locale = useLocale();
  const t = useTranslations('newsSection');
  const tCommon = useTranslations('common');

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([]);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('travel_bookmarked_news');
      if (stored) {
        setBookmarkedSlugs(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleToggleBookmark = useCallback((slug: string) => {
    setBookmarkedSlugs((prev) => {
      let updated: string[];
      if (prev.includes(slug)) {
        updated = prev.filter((s) => s !== slug);
        toast.info(t('bookmarkRemoved') || 'Đã xóa bài viết khỏi danh sách đã lưu.');
      } else {
        updated = [...prev, slug];
        toast.success(t('bookmarkSaved') || 'Đã lưu bài viết vào danh sách yêu thích!');
      }
      try {
        localStorage.setItem('travel_bookmarked_news', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, [t]);

  const { data: newsList = (initialNews.length ? initialNews : DEFAULT_NEWS) } = useQuery({
    queryKey: ['news-all-articles'],
    queryFn: fetchNews,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const getCatLabel = useCallback((key: string) => {
    const item = CATEGORY_ITEMS.find((c) => c.key === key);
    if (!item) return key || 'News';
    if (locale === 'en') return item.labelEn;
    if (locale === 'zh') return item.labelZh;
    if (locale === 'ko') return item.labelKo;
    if (locale === 'ja') return item.labelJa;
    return item.label;
  }, [locale]);

  const getDestLabel = useCallback((key: string) => {
    if (!key) {
      return t('allDestinations') || 'Tất cả điểm đến';
    }
    const item = HOT_DESTINATIONS.find((d) => d.key === key);
    if (!item) return key;
    if (locale === 'en') return item.labelEn;
    if (locale === 'zh') return item.labelZh;
    if (locale === 'ko') return item.labelKo;
    if (locale === 'ja') return item.labelJa;
    return item.label;
  }, [locale, t]);

  // Comprehensive Filtering & Sorting Pipeline
  const filteredArticles = useMemo(() => {
    const baseList = Array.isArray(newsList) && newsList.length > 0 ? newsList : DEFAULT_NEWS;
    let list = [...baseList];

    // 1. Filter by category
    if (selectedCategory) {
      list = list.filter((item: any) => item.category === selectedCategory);
    }

    // 2. Filter by destination
    if (selectedLocation) {
      const destConfig = HOT_DESTINATIONS.find((d) => d.key === selectedLocation);
      if (destConfig && destConfig.keywords && destConfig.keywords.length > 0) {
        list = list.filter((item: any) => {
          const slug = (item.slug || '').toLowerCase();
          const titleLocal = (getI18nText(item.title, locale) || '').toLowerCase();
          const titleVi = (typeof item.title === 'string' ? item.title : item.title?.vi || '').toLowerCase();
          const contentVi = (typeof item.content === 'string' ? item.content : item.content?.vi || '').toLowerCase();
          const contentEn = (typeof item.content === 'object' ? item.content?.en || '' : '').toLowerCase();
          return destConfig.keywords.some((kw) => 
            slug.includes(kw) || 
            titleLocal.includes(kw) || 
            titleVi.includes(kw) || 
            contentVi.includes(kw) ||
            contentEn.includes(kw)
          );
        });
      }
    }

    // 3. Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((item: any) => {
        const titleText = (getI18nText(item.title, locale) || '').toLowerCase();
        const excerptText = (getI18nText(item.excerpt, locale) || '').toLowerCase();
        const authorText = (item.author || '').toLowerCase();
        const slugText = (item.slug || '').toLowerCase();
        return titleText.includes(q) || excerptText.includes(q) || authorText.includes(q) || slugText.includes(q);
      });
    }

    // 4. Sort
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime());
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.category === 'destination' ? 1 : 0) - (a.category === 'destination' ? 1 : 0));
    }

    return list;
  }, [newsList, selectedCategory, selectedLocation, searchQuery, sortBy, locale]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedLocation('');
    setSearchQuery('');
    setSortBy('newest');
  };

  const readMoreText = useMemo(() => {
    try {
      return t('readMore');
    } catch {
      return tCommon('readMore') || 'Đọc tiếp';
    }
  }, [t, tCommon]);

  const editorText = useMemo(() => {
    try {
      return tCommon('editor') || 'Ban Biên Tập';
    } catch {
      return 'Ban Biên Tập';
    }
  }, [tCommon]);

  const minReadText = useMemo(() => {
    try {
      return t('minRead') || 'phút đọc';
    } catch {
      return 'phút đọc';
    }
  }, [t]);

  const searchPlaceholder = useMemo(() => {
    try {
      return t('searchPlaceholder') || 'Tìm kiếm bài viết, cẩm nang du lịch...';
    } catch {
      return 'Tìm kiếm bài viết, cẩm nang du lịch...';
    }
  }, [t]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 mt-20 max-w-7xl">
      {/* Hero Video Banner */}
      <VideoBackground
        videoSrc={newsVideo}
        videoSources={[
          { src: newsVideo, type: 'video/mp4' },
          { src: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/travel.mp4', type: 'video/mp4' }
        ]}
        posterSrc={newsBanner}
        fallbackPosterSrc={FALLBACK_NEWS_IMG}
        overlayGradient="bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-900/30"
        className="h-72 md:h-96 rounded-3xl mb-10 shadow-2xl flex items-end overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="p-8 sm:p-12 max-w-3xl text-white space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className="bg-blue-600/90 backdrop-blur-md text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('heroBadge') || 'Tạp Chí Du Lịch & Cẩm Nang'}</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {t('title')}
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed opacity-90 max-w-2xl">
            {t('subtitle')}
          </p>
        </motion.div>
      </VideoBackground>

      {/* Real-time Search Bar & Controls Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Instant Search Bar */}
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
                title={t('clearSearch') || 'Xóa tìm kiếm'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector & View Mode Switcher */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="newest">{t('sortByNewest') || 'Mới nhất'}</option>
              <option value="popular">{t('sortByPopular') || 'Đọc nhiều nhất'}</option>
            </select>

            {/* Grid / List Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title={t('gridView') || 'Chế độ xem dạng lưới'}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title={t('listView') || 'Chế độ xem dạng danh sách'}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Hot Destinations Tag Pills - Circular Images like Home Page */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
            {t('destinationFilter') || 'Điểm đến:'}
          </span>
          {HOT_DESTINATIONS.map((dest) => {
            const isSelected = selectedLocation === dest.key;
            const label = getDestLabel(dest.key);
            const hasImg = Boolean(dest.image);

            return (
              <button
                key={dest.key || 'all-dest'}
                type="button"
                onClick={() => setSelectedLocation(dest.key)}
                className={`group py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                  hasImg ? 'pl-1.5 pr-3.5' : 'px-3.5'
                } ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 border-slate-200/90 hover:border-blue-300'
                }`}
              >
                {hasImg && (
                  <img
                    src={dest.image}
                    alt={label}
                    loading="lazy"
                    decoding="async"
                    className={`w-5 h-5 rounded-full object-cover ring-2 shrink-0 transition-transform group-hover:scale-110 ${
                      isSelected ? 'ring-white/80' : 'ring-white group-hover:ring-blue-300'
                    }`}
                  />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-slate-200/80 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ITEMS.map((cat) => (
            <motion.button
              key={cat.key}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90'
              }`}
            >
              {getCatLabel(cat.key)}
            </motion.button>
          ))}
        </div>

        {/* Results Counter & Active Filters Reset */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span>{t('foundArticles', { count: filteredArticles.length })}</span>
          {(selectedCategory || selectedLocation || searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('resetFilters') || 'Đặt lại'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {t('noResultsFound') || 'Không tìm thấy bài viết nào phù hợp'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t('noResultsDesc') || 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả bài viết.'}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetFilters') || 'Đặt lại bộ lọc'}</span>
          </button>
        </div>
      ) : (
        <>
          {/* Articles Render: Grid vs List Mode */}
          {viewMode === 'grid' ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredArticles.map((article: any, idx: number) => (
                <motion.div
                  key={article._id || article.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min((idx % 3) * 0.06, 0.2) }}
                >
                  <NewsGridCard
                    article={article}
                    locale={locale}
                    categoryLabel={getCatLabel(article.category)}
                    readMoreText={readMoreText}
                    editorText={editorText}
                    minReadText={minReadText}
                    isBookmarked={bookmarkedSlugs.includes(article.slug)}
                    onToggleBookmark={handleToggleBookmark}
                    bookmarkTitle={bookmarkedSlugs.includes(article.slug) ? (t('unbookmark') || 'Bỏ lưu bài viết') : (t('bookmark') || 'Lưu bài viết')}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div layout className="space-y-6">
              {filteredArticles.map((article: any, idx: number) => (
                <motion.div
                  key={article._id || article.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min((idx % 3) * 0.06, 0.2) }}
                >
                  <NewsListCard
                    article={article}
                    locale={locale}
                    categoryLabel={getCatLabel(article.category)}
                    readMoreText={readMoreText}
                    editorText={editorText}
                    minReadText={minReadText}
                    isBookmarked={bookmarkedSlugs.includes(article.slug)}
                    onToggleBookmark={handleToggleBookmark}
                    bookmarkTitle={bookmarkedSlugs.includes(article.slug) ? (t('unbookmark') || 'Bỏ lưu bài viết') : (t('bookmark') || 'Lưu bài viết')}
                    seoGuideBadge={t('seoGuideBadge') || 'Cẩm Nang Hữu Ích'}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Editorial Newsletter Box */}
          <NewsNewsletterBox
            title={t('newsletterTitle') || 'Đăng Ký Nhận Cẩm Nang Du Lịch & Ưu Đãi Độc Quyền'}
            desc={t('newsletterDesc') || 'Cập nhật cẩm nang du lịch Việt Nam mới nhất, kinh nghiệm vi vu tự túc và voucher tour giảm tới 30% mỗi tuần.'}
            placeholder={t('newsletterPlaceholder') || 'Nhập địa chỉ email của bạn...'}
            btnText={t('subscribeBtn') || 'Đăng Ký Ngay'}
            badgeText={t('newsletterBadge') || 'Bản Tin Du Lịch VIP'}
            subscribedSuccessText={t('newsletterSubscribed') || 'Cảm ơn bạn! Hãy kiểm tra hộp thư để nhận cẩm nang mới nhất.'}
            invalidEmailText={t('invalidEmail') || 'Vui lòng nhập đúng định dạng email hợp lệ!'}
            subscribeSuccessToast={t('subscribeSuccess') || 'Đăng ký nhận cẩm nang du lịch thành công! Chúng tôi đã gửi email xác nhận.'}
          />
        </>
      )}
    </div>
  );
}

export default memo(NewsClientComponent);
