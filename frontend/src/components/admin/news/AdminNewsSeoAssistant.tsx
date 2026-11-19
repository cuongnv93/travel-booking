'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Smartphone,
  Monitor,
  Share2,
  Search,
  ChevronDown,
  ChevronUp,
  FileCheck,
  TrendingUp,
  Sparkles,
  BookOpen,
  Lightbulb,
  Layers,
  Link2,
  Image as ImageIcon,
  Zap,
  Globe,
  Tag,
  Check,
} from 'lucide-react';
import { toSlug } from '@/lib/utils';

export interface AdminNewsSeoAssistantProps {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  onSlugChange?: (newSlug: string) => void;
  thumbnail?: string;
  focusKeyword: string;
  onFocusKeywordChange: (keyword: string) => void;
  seoTitle: string;
  onSeoTitleChange: (val: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (val: string) => void;
  activeLang: string;
}

// Common Vietnamese power words in travel journalism to boost CTR
const TRAVEL_POWER_WORDS = [
  'top',
  'kinh nghiệm',
  'bí kíp',
  'hướng dẫn',
  'chi tiết',
  'mới nhất',
  'review',
  'cẩm nang',
  'lịch trình',
  'khám phá',
  'tuyệt đẹp',
  'check-in',
  'đẹp nhất',
  'tiết kiệm',
  'giá rẻ',
  'đáng đi',
  '2026',
];

export const AdminNewsSeoAssistant: React.FC<AdminNewsSeoAssistantProps> = ({
  title,
  excerpt,
  content,
  slug,
  onSlugChange,
  thumbnail,
  focusKeyword,
  onFocusKeywordChange,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  activeLang,
}) => {
  const [previewMode, setPreviewMode] = useState<'google_mobile' | 'google_desktop' | 'social'>('google_mobile');
  const [activeChecklistTab, setActiveChecklistTab] = useState<'all' | 'basic' | 'additional' | 'title' | 'content'>('all');
  const [isEditorExpanded, setIsEditorExpanded] = useState(true);

  // Strip HTML utility
  const plainText = useMemo(() => {
    return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [content]);

  // Word count & Reading time
  const wordCount = useMemo(() => {
    if (!plainText) return 0;
    return plainText.split(/\s+/).filter(Boolean).length;
  }, [plainText]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  // Keyword analysis
  const normalizedKeyword = focusKeyword.trim().toLowerCase();

  const keywordStats = useMemo(() => {
    if (!normalizedKeyword) {
      return {
        inTitle: false,
        inTitleBeginning: false,
        inMetaDesc: false,
        inSlug: false,
        inFirstParagraph: false,
        inHeadings: false,
        inImageAlt: false,
        occurrences: 0,
        density: 0,
      };
    }

    const effectiveTitle = (seoTitle || title).toLowerCase();
    const effectiveDesc = (seoDescription || excerpt).toLowerCase();
    const lowerSlug = slug.toLowerCase();
    const lowerContent = content.toLowerCase();
    const lowerPlainText = plainText.toLowerCase();

    // Occurrences count
    const escapedKw = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKw, 'gi');
    const matches = lowerPlainText.match(regex);
    const count = matches ? matches.length : 0;
    const density = wordCount > 0 ? (count / wordCount) * 100 : 0;

    // Keyword at the beginning of title (first 50% of title string)
    const titleFirstHalf = effectiveTitle.slice(0, Math.ceil(effectiveTitle.length / 2));
    const inTitleBeginning = titleFirstHalf.includes(normalizedKeyword);

    // First paragraph (first 100 words)
    const first100Words = lowerPlainText.split(/\s+/).slice(0, 100).join(' ');
    const inFirstParagraph = first100Words.includes(normalizedKeyword);

    // Headings check (H2, H3)
    const headingMatches = lowerContent.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi) || [];
    const inHeadings = headingMatches.some((h) => h.includes(normalizedKeyword));

    // Images Alt check
    const altRegex = /alt=["']([^"']*)["']/gi;
    let altMatch;
    let inImageAlt = false;
    while ((altMatch = altRegex.exec(lowerContent)) !== null) {
      if (altMatch[1] && altMatch[1].includes(normalizedKeyword)) {
        inImageAlt = true;
        break;
      }
    }

    // Slug check (replace spaces with hyphens)
    const slugKeyword = normalizedKeyword
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '-');
    const inSlug = lowerSlug.includes(slugKeyword) || lowerSlug.includes(normalizedKeyword.replace(/\s+/g, '-'));

    return {
      inTitle: effectiveTitle.includes(normalizedKeyword),
      inTitleBeginning,
      inMetaDesc: effectiveDesc.includes(normalizedKeyword),
      inSlug,
      inFirstParagraph,
      inHeadings,
      inImageAlt,
      occurrences: count,
      density: parseFloat(density.toFixed(2)),
    };
  }, [normalizedKeyword, title, seoTitle, excerpt, seoDescription, slug, content, plainText, wordCount]);

  // Structural & Readability checks
  const structureStats = useMemo(() => {
    const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
    const h3Matches = content.match(/<h3[^>]*>(.*?)<\/h3>/gi) || [];
    const imgMatches = content.match(/<img[^>]*>/gi) || [];
    const altMatches = content.match(/<img[^>]*alt=["'](?!["'])[^"']+["'][^>]*>/gi) || [];
    const linkMatches = content.match(/<a[^>]*href=["'][^"']+["'][^>]*>/gi) || [];
    const listMatches = content.match(/<(ul|ol)[^>]*>[\s\S]*?<\/(ul|ol)>/gi) || [];

    // Internal vs External links
    const internalLinks = linkMatches.filter(
      (l) => l.includes('travel-booking') || l.includes('timesgreen.net') || l.startsWith('<a href="/"') || l.includes('href="/')
    ).length;
    const externalLinks = linkMatches.length - internalLinks;

    // Paragraph length check (WordPress readability recommends < 150 words per paragraph)
    const rawParagraphs = content.split(/<\/p>|<br\s*\/?>/i);
    const longParagraphs = rawParagraphs.filter((p) => {
      const pText = p.replace(/<[^>]*>/g, '').trim();
      const pWordCount = pText.split(/\s+/).filter(Boolean).length;
      return pWordCount > 150;
    }).length;

    // Title checks
    const effectiveTitle = seoTitle || title;
    const hasNumbersInTitle = /\d+/.test(effectiveTitle);
    const lowerTitle = effectiveTitle.toLowerCase();
    const hasPowerWordInTitle = TRAVEL_POWER_WORDS.some((pw) => lowerTitle.includes(pw));

    return {
      h2Count: h2Matches.length,
      h3Count: h3Matches.length,
      imgCount: imgMatches.length,
      altCount: altMatches.length,
      linkCount: linkMatches.length,
      internalLinks,
      externalLinks,
      listCount: listMatches.length,
      longParagraphs,
      hasNumbersInTitle,
      hasPowerWordInTitle,
    };
  }, [content, seoTitle, title]);

  // Effective display values
  const effectiveSeoTitle = seoTitle || title || 'Tiêu đề bài viết hiển thị trên Google Search...';
  const effectiveSeoDesc =
    seoDescription ||
    excerpt ||
    'Đoạn mô tả ngắn tóm tắt bài viết sẽ xuất hiện ở đây dưới dạng kết quả tìm kiếm Google (Meta Description)...';

  // Audit Checklist items categorized like Rank Math / Yoast SEO
  const auditGroups = useMemo(() => {
    const effectiveTitle = seoTitle || title;
    const effectiveDesc = seoDescription || excerpt;

    return {
      basic: [
        {
          id: 'focus_keyword_set',
          title: 'Đã đặt từ khóa chính (Focus Keyword)',
          passed: Boolean(normalizedKeyword),
          score: 10,
          tip: 'Hãy nhập từ khóa mục tiêu bạn muốn bài viết này lên Top tìm kiếm Google.',
        },
        {
          id: 'keyword_in_title',
          title: 'Từ khóa chính xuất hiện trong Tiêu đề SEO',
          passed: keywordStats.inTitle,
          score: 15,
          tip: 'Đưa từ khóa chính vào tiêu đề bài viết để người dùng và Google nhận biết chủ đề.',
        },
        {
          id: 'keyword_in_meta_desc',
          title: 'Từ khóa chính xuất hiện trong Meta Description',
          passed: keywordStats.inMetaDesc,
          score: 10,
          tip: 'Thêm từ khóa chính vào đoạn mô tả Meta Description để tăng tỷ lệ click (CTR).',
        },
        {
          id: 'keyword_in_slug',
          title: 'Từ khóa chính có trong Đường dẫn URL (Slug)',
          passed: keywordStats.inSlug,
          score: 10,
          tip: 'Đường dẫn URL nên chứa từ khóa không dấu, ngắn gọn (VD: du-lich-da-nang).',
        },
        {
          id: 'keyword_in_first_p',
          title: 'Từ khóa xuất hiện trong 10% đầu bài viết (Đoạn mở bài)',
          passed: keywordStats.inFirstParagraph,
          score: 10,
          tip: 'Google đánh giá cao khi từ khóa xuất hiện ngay trong 100 từ đầu tiên của bài viết.',
        },
        {
          id: 'content_word_count',
          title: `Độ dài bài viết đạt chuẩn (${wordCount} từ)`,
          passed: wordCount >= 600,
          warning: wordCount >= 300 && wordCount < 600,
          score: wordCount >= 600 ? 15 : wordCount >= 300 ? 8 : 0,
          tip:
            wordCount >= 600
              ? 'Độ dài bài viết rất tốt, cung cấp thông tin chuyên sâu cho người đọc.'
              : wordCount >= 300
              ? 'Độ dài trung bình (300-600 từ). Khuyến nghị nâng lên tối thiểu 600-1000 từ để cạnh tranh Top Google.'
              : 'Bài viết dưới 300 từ có nguy cơ bị Google đánh giá là nội dung sơ sài (thin content).',
        },
      ],
      additional: [
        {
          id: 'keyword_in_headings',
          title: 'Từ khóa chính có trong các thẻ tiêu đề phụ (H2 / H3)',
          passed: keywordStats.inHeadings,
          score: 10,
          tip: 'Chèn từ khóa chính hoặc biến thể từ khóa vào ít nhất một thẻ H2 hoặc H3.',
        },
        {
          id: 'keyword_density',
          title: `Mật độ từ khóa đạt chuẩn: ${keywordStats.density}% (${keywordStats.occurrences} lần)`,
          passed: keywordStats.density >= 0.8 && keywordStats.density <= 2.5,
          warning: (keywordStats.density > 0 && keywordStats.density < 0.8) || keywordStats.density > 2.5,
          score: keywordStats.density >= 0.8 && keywordStats.density <= 2.5 ? 10 : 5,
          tip:
            keywordStats.density > 2.5
              ? 'Mật độ từ khóa > 2.5% có nguy cơ bị phạt nhồi nhét từ khóa (keyword stuffing). Hãy giảm bớt.'
              : keywordStats.density >= 0.8
              ? 'Mật độ từ khóa rất lý tưởng (từ 0.8% đến 2.5%).'
              : 'Mật độ từ khóa hơi thấp. Hãy lặp lại từ khóa chính tự nhiên thêm 2-3 lần trong bài.',
        },
        {
          id: 'keyword_in_image_alt',
          title: 'Từ khóa chính có trong thuộc tính ALT của hình ảnh',
          passed: keywordStats.inImageAlt,
          score: 5,
          tip: 'Thêm thuộc tính alt có chứa từ khóa cho ảnh để tối ưu hóa trên Google Image Search.',
        },
        {
          id: 'internal_links',
          title: `Liên kết nội bộ (Internal Links): ${structureStats.linkCount} liên kết`,
          passed: structureStats.linkCount >= 1,
          score: 5,
          tip: 'Chèn ít nhất 1-2 liên kết trỏ đến Tour du lịch, Khách sạn hoặc bài viết liên quan.',
        },
        {
          id: 'slug_length',
          title: `Độ dài đường dẫn URL: ${slug.length} ký tự`,
          passed: slug.length <= 75 && slug.length > 5,
          score: 5,
          tip: 'Đường dẫn URL nên ngắn gọn, súc tích (dưới 75 ký tự) để hiển thị đẹp trên kết quả tìm kiếm.',
        },
      ],
      title: [
        {
          id: 'title_length',
          title: `Độ dài tiêu đề SEO: ${effectiveTitle.length} ký tự`,
          passed: effectiveTitle.length >= 40 && effectiveTitle.length <= 60,
          warning: (effectiveTitle.length >= 30 && effectiveTitle.length < 40) || (effectiveTitle.length > 60 && effectiveTitle.length <= 70),
          score: effectiveTitle.length >= 40 && effectiveTitle.length <= 60 ? 10 : 5,
          tip:
            effectiveTitle.length > 60
              ? 'Tiêu đề quá 60 ký tự có thể bị Google cắt ngắn dấu ba chấm (...) trên kết quả tìm kiếm.'
              : effectiveTitle.length < 40
              ? 'Tiêu đề hơi ngắn. Nên bổ sung thêm tên địa danh hoặc từ khóa phụ (40 - 60 ký tự là tối ưu).'
              : 'Độ dài tiêu đề đạt chuẩn hiển thị hoàn hảo trên Google Desktop & Mobile.',
        },
        {
          id: 'keyword_at_beginning',
          title: 'Từ khóa chính nằm ở nửa đầu tiêu đề',
          passed: keywordStats.inTitleBeginning,
          score: 5,
          tip: 'Đặt từ khóa ở đầu tiêu đề giúp người tìm kiếm chú ý ngay lập tức và tăng CTR.',
        },
        {
          id: 'has_numbers',
          title: 'Tiêu đề có chứa con số (VD: Top 10, 5 địa điểm, 2026)',
          passed: structureStats.hasNumbersInTitle,
          score: 5,
          tip: 'Các bài viết chứa số trong tiêu đề thường đạt tỷ lệ nhấp chuột cao hơn 36%.',
        },
        {
          id: 'has_power_word',
          title: 'Tiêu đề chứa từ ngữ kích thích click (Kinh nghiệm, Bí kíp, Review, Mới nhất...)',
          passed: structureStats.hasPowerWordInTitle,
          score: 5,
          tip: 'Bổ sung các từ lôi cuốn như "Kinh nghiệm", "Review", "Chi tiết", "Cẩm nang", "2026".',
        },
      ],
      content: [
        {
          id: 'headings_distribution',
          title: `Phân cấp đề mục Headings: ${structureStats.h2Count} thẻ H2 &bull; ${structureStats.h3Count} thẻ H3`,
          passed: structureStats.h2Count >= 2,
          warning: structureStats.h2Count === 1,
          score: structureStats.h2Count >= 2 ? 10 : 5,
          tip: 'Sử dụng ít nhất 2-3 thẻ H2 để chia nhỏ các phần chính của bài viết cho người đọc dễ theo dõi.',
        },
        {
          id: 'images_present',
          title: `Hình ảnh minh họa trong bài viết: ${structureStats.imgCount} ảnh`,
          passed: structureStats.imgCount >= 2,
          warning: structureStats.imgCount === 1,
          score: structureStats.imgCount >= 2 ? 5 : 2,
          tip: 'Bài viết du lịch nên có ít nhất 2-3 hình ảnh đẹp chất lượng cao để tăng độ tin cậy và thẩm mỹ.',
        },
        {
          id: 'lists_present',
          title: `Sử dụng danh sách (Lists): ${structureStats.listCount} danh sách`,
          passed: structureStats.listCount >= 1,
          score: 5,
          tip: 'Dùng danh sách gạch đầu dòng hoặc số thứ tự giúp người đọc nắm thông tin nhanh chóng.',
        },
        {
          id: 'paragraph_length',
          title: 'Độ dài các đoạn văn bản vừa phải (< 150 từ/đoạn)',
          passed: structureStats.longParagraphs === 0,
          score: 5,
          tip:
            structureStats.longParagraphs > 0
              ? `Có ${structureStats.longParagraphs} đoạn văn quá dài (> 150 từ). Hãy ngắt thành các đoạn ngắn hơn.`
              : 'Bố cục các đoạn văn ngắn gọn, thoáng đãng, dễ đọc trên thiết bị di động.',
        },
      ],
    };
  }, [normalizedKeyword, keywordStats, structureStats, wordCount, title, seoTitle, excerpt, seoDescription, slug]);

  // Total Score Calculation (Sum of all criteria scaled to 100)
  const seoScore = useMemo(() => {
    let earned = 0;
    let max = 0;

    Object.values(auditGroups).forEach((group) => {
      group.forEach((item) => {
        max += item.score;
        if (item.passed) {
          earned += item.score;
        } else if ((item as any).warning) {
          earned += Math.round(item.score * 0.5);
        }
      });
    });

    return max > 0 ? Math.min(100, Math.round((earned / max) * 100)) : 0;
  }, [auditGroups]);

  // Visual status badge
  const scoreBadge = useMemo(() => {
    if (seoScore >= 80) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        bar: 'bg-emerald-500',
        text: 'text-emerald-700',
        label: 'Tối Ưu SEO Xuất Sắc',
        rankMathColor: '#10b981',
      };
    }
    if (seoScore >= 50) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        bar: 'bg-amber-500',
        text: 'text-amber-700',
        label: 'Khá – Cần Hoàn Thiện Thêm',
        rankMathColor: '#f59e0b',
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      bar: 'bg-rose-500',
      text: 'text-rose-700',
      label: 'Chưa Đạt Chuẩn SEO',
      rankMathColor: '#ef4444',
    };
  }, [seoScore]);

  // Filter checklist by active tab
  const activeItems = useMemo(() => {
    if (activeChecklistTab === 'all') {
      return [
        ...auditGroups.basic.map((item) => ({ ...item, category: 'SEO Cơ Bản' })),
        ...auditGroups.additional.map((item) => ({ ...item, category: 'SEO Bổ Sung' })),
        ...auditGroups.title.map((item) => ({ ...item, category: 'Tiêu Đề' })),
        ...auditGroups.content.map((item) => ({ ...item, category: 'Nội Dung' })),
      ];
    }
    return auditGroups[activeChecklistTab].map((item) => ({
      ...item,
      category:
        activeChecklistTab === 'basic'
          ? 'SEO Cơ Bản'
          : activeChecklistTab === 'additional'
          ? 'SEO Bổ Sung'
          : activeChecklistTab === 'title'
          ? 'Tiêu Đề'
          : 'Nội Dung',
    }));
  }, [auditGroups, activeChecklistTab]);

  // Counts for checklist status
  const checklistStats = useMemo(() => {
    const all = [
      ...auditGroups.basic,
      ...auditGroups.additional,
      ...auditGroups.title,
      ...auditGroups.content,
    ];
    const passed = all.filter((i) => i.passed).length;
    const errors = all.filter((i) => !i.passed && !(i as any).warning).length;
    const warnings = all.filter((i) => !i.passed && (i as any).warning).length;
    return { total: all.length, passed, errors, warnings };
  }, [auditGroups]);

  // Helper to highlight focus keyword in snippet text (like Google SERP bolding)
  const renderHighlightedSnippet = (text: string) => {
    if (!normalizedKeyword) return text;
    const parts = text.split(new RegExp(`(${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === normalizedKeyword ? (
        <strong key={i} className="font-extrabold text-slate-900 bg-amber-100/80 px-0.5 rounded">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-6">
      {/* 1. TOP HEADER: Score Circle & Meta Summary */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                SEO
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  Trợ Lý Tối Ưu SEO & Thẻ Meta Chuẩn WordPress
                  <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {activeLang.toUpperCase()}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân tích thời gian thực theo thuật toán Google Ranking, Yoast SEO & Rank Math
                </p>
              </div>
            </div>
          </div>

          {/* Large Visual Score Card */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs shrink-0">
            {/* Circular Gauge */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  style={{ stroke: scoreBadge.rankMathColor }}
                  strokeDasharray={`${seoScore}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-slate-900 leading-none">{seoScore}</span>
                <span className="text-[9px] font-bold text-slate-400">/100</span>
              </div>
            </div>

            <div className="text-left">
              <div className={`text-xs font-bold ${scoreBadge.text}`}>{scoreBadge.label}</div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> {checklistStats.passed} Đạt
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                  <XCircle className="w-3 h-3" /> {checklistStats.errors} Cần sửa
                </span>
                {checklistStats.warnings > 0 && (
                  <>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {checklistStats.warnings} Chú ý
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick content summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-200/60 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Độ dài nội dung</span>
              <span className="font-bold text-slate-800">{wordCount} từ</span>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Thời gian đọc</span>
              <span className="font-bold text-slate-800">~{readingTime} phút</span>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Phân cấp đề mục</span>
              <span className="font-bold text-slate-800">
                {structureStats.h2Count} H2 &bull; {structureStats.h3Count} H3
              </span>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Hình ảnh & Media</span>
              <span className="font-bold text-slate-800">
                {structureStats.imgCount} ảnh ({structureStats.altCount} có alt)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6 pt-0">
        {/* 2. FOCUS KEYWORD INPUT (YOAST / RANK MATH STYLE) */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              Từ Khóa Trọng Tâm (Focus Keyword):
            </label>
            {normalizedKeyword && (
              <span className="text-[11px] text-slate-600 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Xuất hiện: <strong className="text-blue-600">{keywordStats.occurrences}</strong> lần (
                <strong className={keywordStats.density >= 0.8 && keywordStats.density <= 2.5 ? 'text-emerald-600' : 'text-amber-600'}>
                  {keywordStats.density}%
                </strong>
                )
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => onFocusKeywordChange(e.target.value)}
              placeholder="Nhập từ khóa mục tiêu (VD: du lịch ninh bình, kinh nghiệm đà nẵng, vé máy bay giá rẻ)..."
              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none shadow-2xs"
            />
          </div>

          {/* Keyword quick presence pills */}
          {normalizedKeyword ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-slate-400 font-medium">Vị trí từ khóa:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-semibold inline-flex items-center gap-1 ${
                  keywordStats.inTitle ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {keywordStats.inTitle ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Tiêu đề
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-semibold inline-flex items-center gap-1 ${
                  keywordStats.inMetaDesc ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {keywordStats.inMetaDesc ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Meta Desc
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-semibold inline-flex items-center gap-1 ${
                  keywordStats.inSlug ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {keywordStats.inSlug ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} URL Slug
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-semibold inline-flex items-center gap-1 ${
                  keywordStats.inFirstParagraph ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {keywordStats.inFirstParagraph ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} 100 từ đầu
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-semibold inline-flex items-center gap-1 ${
                  keywordStats.inHeadings ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {keywordStats.inHeadings ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Thẻ H2/H3
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-semibold inline-flex items-center gap-1 ${
                  keywordStats.inImageAlt ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {keywordStats.inImageAlt ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Thẻ Alt ảnh
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              💡 Bạn chưa đặt từ khóa chính. Nhập từ khóa mục tiêu để hệ thống tự động kiểm tra mật độ và phân bổ SEO.
            </p>
          )}
        </div>

        {/* 3. GOOGLE SERP & SOCIAL SNIPPET PREVIEW & METADATA EDITOR */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4.5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                Xem Trước Đoạn Trích Hiển Thị (Snippet Preview)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mô phỏng chính xác giao diện bài viết trên kết quả tìm kiếm Google và khi chia sẻ lên mạng xã hội
              </p>
            </div>

            {/* Mode switch pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setPreviewMode('google_mobile')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  previewMode === 'google_mobile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Google Mobile
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('google_desktop')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  previewMode === 'google_desktop' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Google Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('social')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  previewMode === 'social' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" /> Facebook / Zalo
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          {previewMode !== 'social' ? (
            <div
              className={`bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-1.5 ${
                previewMode === 'google_mobile' ? 'max-w-md' : 'w-full'
              }`}
            >
              {/* Google Breadcrumb */}
              <div className="flex items-center gap-2 text-[11px] text-slate-700">
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                  T
                </div>
                <div className="flex flex-col leading-tight truncate">
                  <span className="font-semibold text-slate-800">Travel Booking</span>
                  <span className="text-[10px] text-slate-500 font-mono truncate">
                    https://travel-booking-ruby.vercel.app/{activeLang}/news/{slug || 'du-lich-viet-nam'}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-blue-700 hover:underline cursor-pointer font-medium text-base sm:text-lg leading-snug pt-1 line-clamp-2">
                {renderHighlightedSnippet(effectiveSeoTitle)}
              </h4>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-0.5">
                <span className="text-slate-400 mr-1.5">{new Date().toLocaleDateString('vi-VN')} —</span>
                {renderHighlightedSnippet(effectiveSeoDesc)}
              </p>
            </div>
          ) : (
            /* Social Card Preview (Facebook / Zalo / OpenGraph) */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-lg">
              <div className="h-48 bg-slate-100 overflow-hidden relative">
                {thumbnail ? (
                  <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
                    Chưa có ảnh thumbnail
                  </div>
                )}
              </div>
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  travel-booking-ruby.vercel.app
                </span>
                <h5 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{effectiveSeoTitle}</h5>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{effectiveSeoDesc}</p>
              </div>
            </div>
          )}

          {/* 4. INLINE METADATA EDITORS (SEO Title, Slug, Meta Description) */}
          <div className="space-y-4 pt-2 border-t border-slate-200/70">
            {/* SEO Title Input */}
            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Tiêu Đề SEO Google (Meta Title):</span>
                  <button
                    type="button"
                    onClick={() => onSeoTitleChange(title)}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                  >
                    ⚡ Lấy theo tiêu đề bài viết
                  </button>
                </label>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    effectiveSeoTitle.length >= 40 && effectiveSeoTitle.length <= 60
                      ? 'text-emerald-600'
                      : effectiveSeoTitle.length > 60
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                >
                  {effectiveSeoTitle.length} / 60 ký tự
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => onSeoTitleChange(e.target.value)}
                placeholder={title || 'Nhập tiêu đề SEO tối ưu (40-60 ký tự)...'}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none shadow-2xs font-medium"
              />
              {/* Length indicator progress */}
              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    effectiveSeoTitle.length >= 40 && effectiveSeoTitle.length <= 60
                      ? 'bg-emerald-500'
                      : effectiveSeoTitle.length > 60
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (effectiveSeoTitle.length / 60) * 100)}%` }}
                />
              </div>
            </div>

            {/* URL / Slug Editor */}
            {onSlugChange && (
              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Đường Dẫn URL (Permalink / Slug):</span>
                    <button
                      type="button"
                      onClick={() => onSlugChange(toSlug(title || ''))}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                    >
                      ⚡ Tạo slug tự động
                    </button>
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">{slug.length} ký tự</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2 text-[11px] text-slate-500 rounded-l-xl font-mono">
                    /{activeLang}/news/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => onSlugChange(e.target.value)}
                    placeholder="duong-dan-bai-viet-chuan-seo"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-r-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none shadow-2xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Meta Description Input */}
            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Mô Tả SEO Google (Meta Description):</span>
                  <button
                    type="button"
                    onClick={() => onSeoDescriptionChange(excerpt)}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                  >
                    ⚡ Lấy theo đoạn tóm tắt bài viết
                  </button>
                </label>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    effectiveSeoDesc.length >= 120 && effectiveSeoDesc.length <= 160
                      ? 'text-emerald-600'
                      : effectiveSeoDesc.length > 160
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                >
                  {effectiveSeoDesc.length} / 160 ký tự
                </span>
              </div>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => onSeoDescriptionChange(e.target.value)}
                placeholder={excerpt || 'Nhập đoạn mô tả tóm tắt lôi cuốn chứa từ khóa chính (120-160 ký tự)...'}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none shadow-2xs leading-relaxed"
              />
              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    effectiveSeoDesc.length >= 120 && effectiveSeoDesc.length <= 160
                      ? 'bg-emerald-500'
                      : effectiveSeoDesc.length > 160
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (effectiveSeoDesc.length / 160) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. WORDPRESS / RANK MATH AUDIT CHECKLIST (4 TABS) */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
          {/* Checklist Tab Headers */}
          <div className="flex border-b border-slate-200 bg-slate-50/90 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveChecklistTab('all')}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeChecklistTab === 'all'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất Cả ({checklistStats.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveChecklistTab('basic')}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeChecklistTab === 'basic'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              SEO Cơ Bản ({auditGroups.basic.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveChecklistTab('additional')}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeChecklistTab === 'additional'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              SEO Bổ Sung ({auditGroups.additional.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveChecklistTab('title')}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeChecklistTab === 'title'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Tiêu Đề ({auditGroups.title.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveChecklistTab('content')}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeChecklistTab === 'content'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Dễ Đọc Nội Dung ({auditGroups.content.length})
            </button>
          </div>

          {/* Checklist Items List */}
          <div className="divide-y divide-slate-100 p-4 space-y-3">
            {activeItems.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (item as any).warning ? (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-bold text-xs ${item.passed ? 'text-slate-800' : 'text-slate-900'}`}>
                      {item.title}
                    </p>
                    {activeChecklistTab === 'all' && (
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsSeoAssistant;
