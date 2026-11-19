'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Smartphone,
  Monitor,
  Share2,
  Search,
  BookOpen,
  TrendingUp,
  Layers,
  Image as ImageIcon,
  Globe,
  Check,
  Trophy,
  Sparkles,
  Wand2,
  ArrowRight,
  Plus,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { toSlug } from '@/lib/utils';
import { toast } from '@/stores/toastStore';

export interface AdminNewsSeoAssistantProps {
  title: string;
  onTitleChange?: (val: string) => void;
  excerpt: string;
  onExcerptChange?: (val: string) => void;
  content: string;
  onContentChange?: (val: string) => void;
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

interface QuickFixAction {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  primary?: boolean;
}

interface AuditItem {
  id: string;
  title: string;
  category: string;
  passed: boolean;
  warning?: boolean;
  score: number;
  priority: 'critical' | 'recommended' | 'optional';
  issue: string;
  tip: string;
  suggestion: string;
  quickFixes?: QuickFixAction[];
}

export const AdminNewsSeoAssistant: React.FC<AdminNewsSeoAssistantProps> = ({
  title,
  onTitleChange,
  excerpt,
  onExcerptChange,
  content,
  onContentChange,
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
  const [activeChecklistTab, setActiveChecklistTab] = useState<'todo' | 'all' | 'basic' | 'additional' | 'title' | 'content'>('todo');

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

  // Keyword suggestions extracted from Title if not set
  const suggestedKeywords = useMemo(() => {
    if (!title.trim()) return [];
    const stopWords = new Set([
      'và', 'các', 'của', 'cho', 'tại', 'ở', 'được', 'với', 'trong', 'về', 'những',
      'là', 'đã', 'sẽ', 'ngày', 'đêm', 'tự', 'túc', 'từ', 'a', 'z', '2025', '2026',
    ]);
    const words = title
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>+@\\|[\]]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.has(w));

    const suggestions: string[] = [];

    // Extract 2-word and 3-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      suggestions.push(`${words[i]} ${words[i + 1]}`);
      if (i < words.length - 2) {
        suggestions.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }

    // Common prefixes
    if (words.length >= 2) {
      suggestions.unshift(`du lịch ${words.slice(0, 2).join(' ')}`);
    }

    // Unique & filter
    return Array.from(new Set(suggestions)).slice(0, 5);
  }, [title]);

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

    // Keyword at beginning of title (first 50% of string)
    const titleFirstHalf = effectiveTitle.slice(0, Math.ceil(effectiveTitle.length / 2));
    const inTitleBeginning = titleFirstHalf.includes(normalizedKeyword);

    // First paragraph (first 100 words)
    const first100Words = lowerPlainText.split(/\s+/).slice(0, 100).join(' ');
    const inFirstParagraph = first100Words.includes(normalizedKeyword);

    // Headings check (H2, H3)
    const headingMatches = lowerContent.match(/<h[2-4][^>]*>[\s\S]*?<\/h[2-4]>/gi) || [];
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
    const h2Matches = content.match(/<h2[^>]*>[\s\S]*?<\/h2>/gi) || [];
    const h3Matches = content.match(/<h3[^>]*>[\s\S]*?<\/h3>/gi) || [];
    const imgMatches = content.match(/<img[^>]*>/gi) || [];
    const altMatches = content.match(/<img[^>]*alt=["'](?!["'])[^"']+["'][^>]*>/gi) || [];
    const linkMatches = content.match(/<a[^>]*href=["'][^"']+["'][^>]*>/gi) || [];
    const listMatches = content.match(/<(ul|ol)[^>]*>[\s\S]*?<\/(ul|ol)>/gi) || [];

    // Internal vs External links
    const internalLinks = linkMatches.filter(
      (l) => l.includes('travel-booking') || l.includes('timesgreen.net') || l.startsWith('<a href="/"') || l.includes('href="/')
    ).length;
    const externalLinks = linkMatches.length - internalLinks;

    // Paragraph length check (< 150 words per paragraph)
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

  // Audit Checklist items categorized with actionable quick fixes
  const auditGroups = useMemo(() => {
    const effectiveTitle = seoTitle || title;
    const effectiveDesc = seoDescription || excerpt;

    const basic: AuditItem[] = [
      {
        id: 'focus_keyword_set',
        title: 'Đã đặt từ khóa chính (Focus Keyword)',
        category: 'SEO Cơ Bản',
        passed: Boolean(normalizedKeyword),
        score: 10,
        priority: 'critical',
        issue: 'Chưa nhập từ khóa trọng tâm để đo lường mật độ và vị trí xuất hiện.',
        tip: 'Hãy nhập từ khóa mục tiêu bạn muốn bài viết này lên Top tìm kiếm Google.',
        suggestion: suggestedKeywords.length > 0
          ? `Gợi ý từ khóa từ tiêu đề: "${suggestedKeywords[0]}". Hãy chọn từ khóa bên dưới hoặc tự nhập.`
          : 'Nhập từ khóa mục tiêu có chứa địa danh, dịch vụ hoặc trải nghiệm (VD: "du lịch đà nẵng", "vé máy bay phú quốc").',
        quickFixes: suggestedKeywords.map((kw) => ({
          label: `Chọn: "${kw}"`,
          icon: <Sparkles className="w-3 h-3 text-amber-500" />,
          action: () => {
            onFocusKeywordChange(kw);
            toast.success(`Đã chọn từ khóa chính: "${kw}"`);
          },
        })),
      },
      {
        id: 'keyword_in_title',
        title: 'Từ khóa chính xuất hiện trong Tiêu đề SEO',
        category: 'SEO Cơ Bản',
        passed: keywordStats.inTitle,
        score: 15,
        priority: 'critical',
        issue: normalizedKeyword
          ? `Tiêu đề SEO hiện tại chưa chứa từ khóa "${focusKeyword}".`
          : 'Cần đặt từ khóa chính trước khi kiểm tra tiêu đề.',
        tip: 'Đưa từ khóa chính vào tiêu đề bài viết để người dùng và Google nhận biết chủ đề.',
        suggestion: normalizedKeyword
          ? `Chèn cụm từ "${focusKeyword}" vào tiêu đề SEO để Google xếp hạng cao.`
          : 'Vui lòng đặt từ khóa chính trước.',
        quickFixes: normalizedKeyword
          ? [
              {
                label: `Thêm "${focusKeyword}" vào tiêu đề SEO`,
                icon: <Wand2 className="w-3 h-3" />,
                primary: true,
                action: () => {
                  const base = effectiveTitle && effectiveTitle !== 'Tiêu đề bài viết hiển thị trên Google Search...' ? effectiveTitle : title;
                  const capitalizedKw = focusKeyword.charAt(0).toUpperCase() + focusKeyword.slice(1);
                  const newTitle = base ? `${capitalizedKw}: ${base}` : `${capitalizedKw} Mới Nhất 2026`;
                  onSeoTitleChange(newTitle);
                  toast.success('Đã thêm từ khóa chính vào Tiêu đề SEO!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'keyword_in_meta_desc',
        title: 'Từ khóa chính xuất hiện trong Meta Description',
        category: 'SEO Cơ Bản',
        passed: keywordStats.inMetaDesc,
        score: 10,
        priority: 'critical',
        issue: normalizedKeyword
          ? `Đoạn Meta Description chưa chứa từ khóa "${focusKeyword}".`
          : 'Cần đặt từ khóa chính để kiểm tra.',
        tip: 'Thêm từ khóa chính vào đoạn mô tả Meta Description để tăng tỷ lệ click (CTR).',
        suggestion: normalizedKeyword
          ? `Đưa từ khóa "${focusKeyword}" vào ngay câu đầu tiên của Meta Description.`
          : 'Vui lòng đặt từ khóa chính trước.',
        quickFixes: normalizedKeyword
          ? [
              {
                label: 'Tự động chèn từ khóa vào Meta Description',
                icon: <Wand2 className="w-3 h-3" />,
                primary: true,
                action: () => {
                  const baseDesc = effectiveDesc && !effectiveDesc.startsWith('Đoạn mô tả ngắn') ? effectiveDesc : excerpt;
                  const capitalizedKw = focusKeyword.charAt(0).toUpperCase() + focusKeyword.slice(1);
                  let newDesc = '';
                  if (baseDesc && baseDesc.length > 20) {
                    newDesc = `Khám phá ${focusKeyword}: ${baseDesc}`;
                  } else {
                    newDesc = `Cẩm nang ${focusKeyword} trọn vẹn và chi tiết nhất: kinh nghiệm di chuyển, địa điểm vui chơi đẹp, ẩm thực đặc sắc và lịch trình tiết kiệm chi phí 2026.`;
                  }
                  if (newDesc.length > 160) {
                    newDesc = newDesc.slice(0, 157) + '...';
                  }
                  onSeoDescriptionChange(newDesc);
                  toast.success('Đã tối ưu Meta Description chứa từ khóa chính!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'keyword_in_slug',
        title: 'Từ khóa chính có trong Đường dẫn URL (Slug)',
        category: 'SEO Cơ Bản',
        passed: keywordStats.inSlug,
        score: 10,
        priority: 'critical',
        issue: normalizedKeyword
          ? `Đường dẫn URL "${slug}" chưa chứa từ khóa "${focusKeyword}".`
          : 'Cần đặt từ khóa chính.',
        tip: 'Đường dẫn URL nên chứa từ khóa không dấu, ngắn gọn (VD: du-lich-da-nang).',
        suggestion: normalizedKeyword
          ? `Chuyển đường dẫn URL sang dạng chứa từ khóa không dấu: "${toSlug(focusKeyword)}".`
          : 'Vui lòng đặt từ khóa chính trước.',
        quickFixes: onSlugChange && normalizedKeyword
          ? [
              {
                label: 'Tối ưu URL Slug theo từ khóa',
                icon: <RefreshCw className="w-3 h-3" />,
                primary: true,
                action: () => {
                  const kwSlug = toSlug(focusKeyword);
                  const titleSlug = toSlug(title).slice(0, 35);
                  const finalSlug = titleSlug.includes(kwSlug) ? titleSlug : `${kwSlug}-${titleSlug}`.slice(0, 60).replace(/-+$/, '');
                  onSlugChange(finalSlug);
                  toast.success('Đã cập nhật đường dẫn URL chứa từ khóa!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'keyword_in_first_p',
        title: 'Từ khóa xuất hiện trong 100 từ đầu bài viết (Mở bài)',
        category: 'SEO Cơ Bản',
        passed: keywordStats.inFirstParagraph,
        score: 10,
        priority: 'recommended',
        issue: normalizedKeyword
          ? `Đoạn mở đầu (100 từ đầu tiên) chưa nhắc đến từ khóa "${focusKeyword}".`
          : 'Cần đặt từ khóa chính.',
        tip: 'Google đánh giá cao khi từ khóa xuất hiện ngay trong 100 từ đầu tiên của bài viết.',
        suggestion: normalizedKeyword
          ? `Bổ sung 1 câu mở đầu giới thiệu trực tiếp chứa cụm từ "${focusKeyword}".`
          : 'Vui lòng đặt từ khóa chính.',
        quickFixes: onContentChange && normalizedKeyword
          ? [
              {
                label: 'Chèn đoạn mở đầu chuẩn SEO vào bài viết',
                icon: <Plus className="w-3 h-3" />,
                action: () => {
                  const capitalizedKw = focusKeyword.charAt(0).toUpperCase() + focusKeyword.slice(1);
                  const leadParagraph = `<p>Chào mừng bạn đến với cẩm nang <strong>${capitalizedKw}</strong> chi tiết và mới nhất năm 2026. Bài viết này tổng hợp toàn bộ lịch trình, kinh nghiệm thực tế và các mẹo hữu ích giúp bạn có một chuyến đi đáng nhớ nhất.</p>\n`;
                  onContentChange(leadParagraph + content);
                  toast.success('Đã chèn đoạn mở đầu chứa từ khóa chính!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'content_word_count',
        title: `Độ dài bài viết đạt chuẩn (${wordCount} từ)`,
        category: 'SEO Cơ Bản',
        passed: wordCount >= 600,
        warning: wordCount >= 300 && wordCount < 600,
        score: wordCount >= 600 ? 15 : wordCount >= 300 ? 8 : 0,
        priority: wordCount < 300 ? 'critical' : 'recommended',
        issue: wordCount < 600
          ? `Bài viết đang có ${wordCount} từ (cần tối thiểu 600 từ, còn thiếu ${600 - wordCount} từ).`
          : '',
        tip: wordCount >= 600
          ? 'Độ dài bài viết rất tốt, cung cấp thông tin chuyên sâu cho người đọc.'
          : wordCount >= 300
          ? 'Độ dài trung bình (300-600 từ). Khuyến nghị nâng lên tối thiểu 600-1000 từ để cạnh tranh Top Google.'
          : 'Bài viết dưới 300 từ có nguy cơ bị Google đánh giá là nội dung sơ sài (thin content).',
        suggestion: wordCount < 600
          ? `Hãy viết thêm khoảng ${600 - wordCount} từ: bổ sung mục lịch trình từng ngày, danh sách món ăn ngon, chi phí dự tính và lưu ý trang phục/thời tiết.`
          : 'Nội dung đã đủ độ sâu và chi tiết!',
      },
    ];

    const additional: AuditItem[] = [
      {
        id: 'keyword_in_headings',
        title: 'Từ khóa chính có trong các thẻ tiêu đề phụ (H2 / H3)',
        category: 'SEO Bổ Sung',
        passed: keywordStats.inHeadings,
        score: 10,
        priority: 'recommended',
        issue: normalizedKeyword
          ? `Chưa có thẻ H2 hoặc H3 nào chứa từ khóa "${focusKeyword}".`
          : 'Cần đặt từ khóa chính.',
        tip: 'Chèn từ khóa chính hoặc biến thể từ khóa vào ít nhất một thẻ H2 hoặc H3.',
        suggestion: normalizedKeyword
          ? `Thêm một tiêu đề phụ H2 như: "Kinh nghiệm ${focusKeyword} từ A đến Z" hoặc "Lịch trình ${focusKeyword} gợi ý".`
          : 'Vui lòng đặt từ khóa chính trước.',
        quickFixes: onContentChange && normalizedKeyword
          ? [
              {
                label: 'Chèn đề mục H2 chứa từ khóa vào nội dung',
                icon: <Plus className="w-3 h-3" />,
                action: () => {
                  const capitalizedKw = focusKeyword.charAt(0).toUpperCase() + focusKeyword.slice(1);
                  const headingBlock = `\n<h2>Kinh nghiệm ${capitalizedKw} và những lưu ý quan trọng</h2>\n<p>Để chuyến đi diễn ra suôn sẻ, bạn hãy lưu ý chuẩn bị lịch trình hợp lý, đặt phòng khách sạn sớm và theo dõi tình hình thời tiết.</p>\n`;
                  onContentChange(content + headingBlock);
                  toast.success('Đã thêm thẻ H2 chứa từ khóa chính!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'keyword_density',
        title: `Mật độ từ khóa đạt chuẩn: ${keywordStats.density}% (${keywordStats.occurrences} lần)`,
        category: 'SEO Bổ Sung',
        passed: keywordStats.density >= 0.8 && keywordStats.density <= 2.5,
        warning: (keywordStats.density > 0 && keywordStats.density < 0.8) || keywordStats.density > 2.5,
        score: keywordStats.density >= 0.8 && keywordStats.density <= 2.5 ? 10 : 5,
        priority: 'recommended',
        issue: keywordStats.density > 2.5
          ? `Mật độ từ khóa đang là ${keywordStats.density}% (quá cao > 2.5%), nguy cơ bị phạt nhồi nhét từ khóa.`
          : keywordStats.density < 0.8 && keywordStats.density > 0
          ? `Mật độ từ khóa đang là ${keywordStats.density}% (hơi thấp < 0.8%).`
          : `Từ khóa "${focusKeyword}" chưa xuất hiện lần nào trong nội dung.`,
        tip: 'Mật độ từ khóa tối ưu nhất dao động từ 0.8% đến 2.5% tổng số từ trong bài.',
        suggestion: keywordStats.density > 2.5
          ? 'Thay thế bớt một số từ khóa chính bằng các đại từ hoặc từ đồng nghĩa để câu văn tự nhiên hơn.'
          : `Lặp lại cụm từ "${focusKeyword}" tự nhiên thêm 2-3 lần ở các phần thân bài hoặc kết luận.`,
      },
      {
        id: 'keyword_in_image_alt',
        title: 'Từ khóa chính có trong thuộc tính ALT của hình ảnh',
        category: 'SEO Bổ Sung',
        passed: keywordStats.inImageAlt,
        score: 5,
        priority: 'recommended',
        issue: structureStats.imgCount === 0
          ? 'Bài viết chưa có hình ảnh nào.'
          : `Chưa có hình ảnh nào có thuộc tính alt chứa từ khóa "${focusKeyword}".`,
        tip: 'Thêm thuộc tính alt có chứa từ khóa cho ảnh để tối ưu hóa trên Google Image Search.',
        suggestion: structureStats.imgCount === 0
          ? 'Chèn ít nhất 2 hình ảnh minh họa chất lượng cao vào bài viết.'
          : `Cập nhật thẻ alt cho ảnh dạng: alt="${focusKeyword} - cẩm nang du lịch".`,
        quickFixes: onContentChange && normalizedKeyword && structureStats.imgCount > 0
          ? [
              {
                label: 'Tự động gán Alt ảnh theo từ khóa',
                icon: <Wand2 className="w-3 h-3" />,
                action: () => {
                  let updated = content;
                  const altText = `${focusKeyword} - Travel Booking cẩm nang du lịch`;
                  // Replace img tags with no alt or empty alt
                  updated = updated.replace(/<img\s+(?!.*?alt=["'])([^>]+)>/gi, `<img alt="${altText}" $1>`);
                  updated = updated.replace(/<img([^>]*?)alt=["']\s*["']([^>]*?)>/gi, `<img$1alt="${altText}"$2>`);
                  onContentChange(updated);
                  toast.success('Đã tự động cập nhật thuộc tính Alt cho ảnh!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'internal_links',
        title: `Liên kết nội bộ (Internal Links): ${structureStats.linkCount} liên kết`,
        category: 'SEO Bổ Sung',
        passed: structureStats.linkCount >= 1,
        score: 5,
        priority: 'recommended',
        issue: structureStats.linkCount === 0
          ? 'Bài viết chưa có liên kết nội bộ trỏ đến các trang dịch vụ khác.'
          : '',
        tip: 'Chèn ít nhất 1-2 liên kết trỏ đến Tour du lịch, Khách sạn hoặc bài viết liên quan.',
        suggestion: 'Chèn liên kết nội bộ dẫn người đọc sang trang đặt Tour du lịch hoặc Khách sạn liên quan.',
        quickFixes: onContentChange
          ? [
              {
                label: 'Chèn liên kết nội bộ mẫu (Tour & Khách sạn)',
                icon: <Plus className="w-3 h-3" />,
                action: () => {
                  const linksBlock = `\n<p>Xem thêm các <a href="/vi/tours" class="text-blue-600 font-semibold underline">tour du lịch trọn gói giá tốt</a> và danh sách <a href="/vi/hotels" class="text-blue-600 font-semibold underline">khách sạn ưu đãi hấp dẫn</a> tại Travel Booking.</p>\n`;
                  onContentChange(content + linksBlock);
                  toast.success('Đã chèn liên kết nội bộ chuẩn SEO vào bài viết!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'slug_length',
        title: `Độ dài đường dẫn URL: ${slug.length} ký tự`,
        category: 'SEO Bổ Sung',
        passed: slug.length <= 75 && slug.length >= 5,
        score: 5,
        priority: 'optional',
        issue: slug.length > 75
          ? `Đường dẫn URL đang quá dài (${slug.length} ký tự, khuyến nghị <= 75 ký tự).`
          : slug.length < 5
          ? 'Đường dẫn URL quá ngắn hoặc đang để trống.'
          : '',
        tip: 'Đường dẫn URL nên ngắn gọn, súc tích (dưới 75 ký tự) để hiển thị đẹp trên kết quả tìm kiếm.',
        suggestion: slug.length > 75
          ? 'Hãy cắt ngắn bớt các từ phụ trong đường dẫn URL, chỉ giữ lại từ khóa và địa danh chính.'
          : 'Tạo đường dẫn URL ngắn gọn không dấu.',
        quickFixes: onSlugChange && slug.length > 75
          ? [
              {
                label: 'Rút ngắn đường dẫn URL tự động',
                icon: <RefreshCw className="w-3 h-3" />,
                action: () => {
                  const shortened = slug.slice(0, 60).replace(/-[^-]*$/, '');
                  onSlugChange(shortened);
                  toast.success('Đã rút ngắn URL slug đạt chuẩn SEO!');
                },
              },
            ]
          : undefined,
      },
    ];

    const titleGroup: AuditItem[] = [
      {
        id: 'title_length',
        title: `Độ dài tiêu đề SEO: ${effectiveTitle.length} ký tự`,
        category: 'Tiêu Đề',
        passed: effectiveTitle.length >= 40 && effectiveTitle.length <= 60,
        warning: (effectiveTitle.length >= 30 && effectiveTitle.length < 40) || (effectiveTitle.length > 60 && effectiveTitle.length <= 70),
        score: effectiveTitle.length >= 40 && effectiveTitle.length <= 60 ? 10 : 5,
        priority: 'critical',
        issue: effectiveTitle.length < 40
          ? `Tiêu đề đang quá ngắn (${effectiveTitle.length} ký tự, thiếu ${40 - effectiveTitle.length} ký tự để đạt mức tối thiểu 40 ký tự).`
          : effectiveTitle.length > 60
          ? `Tiêu đề quá dài (${effectiveTitle.length} ký tự, vượt quá 60 ký tự), sẽ bị Google cắt ngắn (...) trên SERP.`
          : '',
        tip: effectiveTitle.length > 60
          ? 'Tiêu đề quá 60 ký tự có thể bị Google cắt ngắn dấu ba chấm (...) trên kết quả tìm kiếm.'
          : effectiveTitle.length < 40
          ? 'Tiêu đề hơi ngắn. Nên bổ sung thêm tên địa danh hoặc từ khóa phụ (40 - 60 ký tự là tối ưu).'
          : 'Độ dài tiêu đề đạt chuẩn hiển thị hoàn hảo trên Google Desktop & Mobile.',
        suggestion: effectiveTitle.length < 40
          ? `Thêm hậu tố như "Chi Tiết Từ A-Z", "Cẩm Nang Mới Nhất 2026" để đạt khoảng 45-55 ký tự.`
          : `Rút bớt từ ngữ rườm rà ở cuối tiêu đề để độ dài dưới 60 ký tự.`,
        quickFixes: effectiveTitle.length < 40
          ? [
              {
                label: 'Thêm "Chi Tiết Từ A-Z 2026" vào tiêu đề',
                icon: <Plus className="w-3 h-3" />,
                primary: true,
                action: () => {
                  const newTitle = `${effectiveTitle} Chi Tiết Từ A-Z 2026`.slice(0, 60);
                  onSeoTitleChange(newTitle);
                  toast.success('Đã mở rộng tiêu đề đạt độ dài chuẩn!');
                },
              },
            ]
          : effectiveTitle.length > 60
          ? [
              {
                label: 'Cắt gọn tiêu đề về mức 60 ký tự',
                icon: <Wand2 className="w-3 h-3" />,
                primary: true,
                action: () => {
                  const cut = effectiveTitle.slice(0, 58).replace(/\s+[^\s]*$/, '');
                  onSeoTitleChange(cut);
                  toast.success('Đã cắt gọn tiêu đề về độ dài tối ưu!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'keyword_at_beginning',
        title: 'Từ khóa chính nằm ở nửa đầu tiêu đề',
        category: 'Tiêu Đề',
        passed: keywordStats.inTitleBeginning,
        score: 5,
        priority: 'recommended',
        issue: normalizedKeyword && keywordStats.inTitle && !keywordStats.inTitleBeginning
          ? `Từ khóa "${focusKeyword}" đang nằm ở nửa sau của tiêu đề.`
          : !keywordStats.inTitle
          ? 'Từ khóa chưa có trong tiêu đề.'
          : '',
        tip: 'Đặt từ khóa ở đầu tiêu đề giúp người tìm kiếm chú ý ngay lập tức và tăng CTR.',
        suggestion: normalizedKeyword
          ? `Đảo vị trí đưa cụm từ "${focusKeyword}" lên đầu câu tiêu đề.`
          : 'Đưa từ khóa chính lên phần đầu tiêu đề.',
        quickFixes: normalizedKeyword && effectiveTitle
          ? [
              {
                label: `Đưa "${focusKeyword}" lên đầu tiêu đề`,
                icon: <ArrowRight className="w-3 h-3" />,
                action: () => {
                  const cleaned = effectiveTitle.replace(new RegExp(focusKeyword, 'gi'), '').trim().replace(/^[-:—\s]+|[-:—\s]+$/g, '');
                  const capitalizedKw = focusKeyword.charAt(0).toUpperCase() + focusKeyword.slice(1);
                  const newTitle = `${capitalizedKw}: ${cleaned}`.slice(0, 60);
                  onSeoTitleChange(newTitle);
                  toast.success('Đã đưa từ khóa lên đầu tiêu đề SEO!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'has_numbers',
        title: 'Tiêu đề có chứa con số (VD: Top 10, 5 địa điểm, 2026)',
        category: 'Tiêu Đề',
        passed: structureStats.hasNumbersInTitle,
        score: 5,
        priority: 'recommended',
        issue: 'Tiêu đề chưa chứa con số nào để tăng tỷ lệ nhấp chuột (CTR).',
        tip: 'Các bài viết chứa số trong tiêu đề thường đạt tỷ lệ nhấp chuột cao hơn 36%.',
        suggestion: 'Thêm năm hiện tại "2026" hoặc các con số như "Top 5", "3 ngày 2 đêm" vào tiêu đề.',
        quickFixes: [
          {
            label: 'Thêm năm "2026" vào tiêu đề',
            icon: <Plus className="w-3 h-3" />,
            action: () => {
              const base = effectiveTitle.replace(/\b202\d\b/g, '').trim();
              const newTitle = `${base} 2026`.slice(0, 60);
              onSeoTitleChange(newTitle);
              toast.success('Đã bổ sung năm 2026 vào tiêu đề!');
            },
          },
        ],
      },
      {
        id: 'has_power_word',
        title: 'Tiêu đề chứa từ ngữ kích thích click (Kinh nghiệm, Bí kíp, Review, Mới nhất...)',
        category: 'Tiêu Đề',
        passed: structureStats.hasPowerWordInTitle,
        score: 5,
        priority: 'recommended',
        issue: 'Tiêu đề chưa có từ ngữ thôi miên tạo cảm giác hấp dẫn và hữu ích.',
        tip: 'Bổ sung các từ lôi cuốn như "Kinh nghiệm", "Review", "Chi tiết", "Cẩm nang", "2026".',
        suggestion: 'Thêm một trong các từ: "Kinh nghiệm", "Bí kíp", "Review chi tiết", "Mới nhất".',
        quickFixes: [
          {
            label: 'Thêm "Kinh Nghiệm" vào tiêu đề',
            icon: <Sparkles className="w-3 h-3" />,
            action: () => {
              const newTitle = `Kinh Nghiệm ${effectiveTitle}`.slice(0, 60);
              onSeoTitleChange(newTitle);
              toast.success('Đã thêm từ ngữ kích thích click vào tiêu đề!');
            },
          },
        ],
      },
    ];

    const contentGroup: AuditItem[] = [
      {
        id: 'headings_distribution',
        title: `Phân cấp đề mục Headings: ${structureStats.h2Count} thẻ H2 &bull; ${structureStats.h3Count} thẻ H3`,
        category: 'Nội Dung',
        passed: structureStats.h2Count >= 2,
        warning: structureStats.h2Count === 1,
        score: structureStats.h2Count >= 2 ? 10 : 5,
        priority: 'recommended',
        issue: structureStats.h2Count < 2
          ? `Bài viết đang có ${structureStats.h2Count} thẻ H2 (khuyến nghị có ít nhất 2-3 thẻ H2 để cấu trúc rõ ràng).`
          : '',
        tip: 'Sử dụng ít nhất 2-3 thẻ H2 để chia nhỏ các phần chính của bài viết cho người đọc dễ theo dõi.',
        suggestion: 'Thêm các tiêu đề phụ H2 để phân tách các mục: Phương tiện, Khách sạn, Lịch trình, Ăn uống.',
        quickFixes: onContentChange && structureStats.h2Count < 2
          ? [
              {
                label: 'Chèn 2 đề mục H2 mẫu vào bài viết',
                icon: <Plus className="w-3 h-3" />,
                action: () => {
                  const kw = focusKeyword || 'du lịch';
                  const extraHeadings = `\n<h2>1. Thời điểm lý tưởng nhất để khám phá ${kw}</h2>\n<p>Thời tiết đẹp, khí hậu ôn hòa sẽ giúp chuyến trải nghiệm của bạn trở nên trọn vẹn và chụp được nhiều bức ảnh đẹp.</p>\n<h2>2. Những trải nghiệm đặc sắc không thể bỏ qua</h2>\n<p>Hãy dành thời gian khám phá các điểm đến nổi tiếng và thưởng thức ẩm thực bản địa độc đáo.</p>\n`;
                  onContentChange(content + extraHeadings);
                  toast.success('Đã bổ sung 2 thẻ H2 vào nội dung bài viết!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'images_present',
        title: `Hình ảnh minh họa trong bài viết: ${structureStats.imgCount} ảnh`,
        category: 'Nội Dung',
        passed: structureStats.imgCount >= 2,
        warning: structureStats.imgCount === 1,
        score: structureStats.imgCount >= 2 ? 5 : 2,
        priority: 'recommended',
        issue: structureStats.imgCount < 2
          ? `Bài viết mới có ${structureStats.imgCount} hình ảnh (khuyến nghị có ít nhất 2-3 ảnh minh họa).`
          : '',
        tip: 'Bài viết du lịch nên có ít nhất 2-3 hình ảnh đẹp chất lượng cao để tăng độ tin cậy và thẩm mỹ.',
        suggestion: 'Chèn thêm hình ảnh minh họa về địa danh, món ăn hoặc không gian trải nghiệm trong bài viết.',
      },
      {
        id: 'lists_present',
        title: `Sử dụng danh sách (Lists): ${structureStats.listCount} danh sách`,
        category: 'Nội Dung',
        passed: structureStats.listCount >= 1,
        score: 5,
        priority: 'optional',
        issue: structureStats.listCount === 0
          ? 'Nội dung chưa sử dụng danh sách gạch đầu dòng (<ul> hoặc <ol>).'
          : '',
        tip: 'Dùng danh sách gạch đầu dòng hoặc số thứ tự giúp người đọc nắm thông tin nhanh chóng.',
        suggestion: 'Đưa các ý như vật dụng cần chuẩn bị hoặc danh sách món ăn vào dạng danh sách gạch đầu dòng.',
        quickFixes: onContentChange && structureStats.listCount === 0
          ? [
              {
                label: 'Chèn danh sách chuẩn bị mẫu (<ul>)',
                icon: <Plus className="w-3 h-3" />,
                action: () => {
                  const listBlock = `\n<h3>Những vật dụng cần chuẩn bị:</h3>\n<ul>\n  <li>Giấy tờ tùy thân và vé máy bay/tàu xe</li>\n  <li>Trang phục phù hợp thời tiết và đồ bơi</li>\n  <li>Kem chống nắng và thuốc men cơ bản</li>\n</ul>\n`;
                  onContentChange(content + listBlock);
                  toast.success('Đã chèn danh sách gạch đầu dòng vào nội dung!');
                },
              },
            ]
          : undefined,
      },
      {
        id: 'paragraph_length',
        title: 'Độ dài các đoạn văn bản vừa phải (< 150 từ/đoạn)',
        category: 'Nội Dung',
        passed: structureStats.longParagraphs === 0,
        score: 5,
        priority: 'optional',
        issue: structureStats.longParagraphs > 0
          ? `Có ${structureStats.longParagraphs} đoạn văn quá dài (> 150 từ).`
          : '',
        tip: structureStats.longParagraphs > 0
          ? `Có ${structureStats.longParagraphs} đoạn văn quá dài (> 150 từ). Hãy ngắt thành các đoạn ngắn hơn.`
          : 'Bố cục các đoạn văn ngắn gọn, thoáng đãng, dễ đọc trên thiết bị di động.',
        suggestion: 'Ngắt các đoạn văn dài thành 2-3 câu mỗi đoạn để người đọc di động không bị mỏi mắt.',
      },
    ];

    return { basic, additional, title: titleGroup, content: contentGroup };
  }, [
    normalizedKeyword,
    focusKeyword,
    keywordStats,
    structureStats,
    wordCount,
    title,
    seoTitle,
    excerpt,
    seoDescription,
    slug,
    content,
    suggestedKeywords,
    onFocusKeywordChange,
    onSeoTitleChange,
    onSeoDescriptionChange,
    onSlugChange,
    onContentChange,
  ]);

  // All audit items flattened
  const allAuditItems = useMemo(() => {
    return [
      ...auditGroups.basic,
      ...auditGroups.additional,
      ...auditGroups.title,
      ...auditGroups.content,
    ];
  }, [auditGroups]);

  // Items that need fixing (Not passed)
  const todoItems = useMemo(() => {
    return allAuditItems.filter((i) => !i.passed);
  }, [allAuditItems]);

  // Total Score Calculation (Sum of all criteria scaled to 100)
  const seoScore = useMemo(() => {
    let earned = 0;
    let max = 0;

    allAuditItems.forEach((item) => {
      max += item.score;
      if (item.passed) {
        earned += item.score;
      } else if (item.warning) {
        earned += Math.round(item.score * 0.5);
      }
    });

    return max > 0 ? Math.min(100, Math.round((earned / max) * 100)) : 0;
  }, [allAuditItems]);

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

  // Counts for checklist status
  const checklistStats = useMemo(() => {
    const passed = allAuditItems.filter((i) => i.passed).length;
    const errors = allAuditItems.filter((i) => !i.passed && !i.warning).length;
    const warnings = allAuditItems.filter((i) => !i.passed && i.warning).length;
    return { total: allAuditItems.length, passed, errors, warnings };
  }, [allAuditItems]);

  // Filter checklist by active tab
  const displayedItems = useMemo(() => {
    if (activeChecklistTab === 'todo') {
      return todoItems;
    }
    if (activeChecklistTab === 'all') {
      return allAuditItems;
    }
    return auditGroups[activeChecklistTab];
  }, [activeChecklistTab, todoItems, allAuditItems, auditGroups]);

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
                  Gợi ý sửa đổi chi tiết theo thời gian thực — Thực hiện đến khi đạt 100/100 điểm
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
        {/* 2. DYNAMIC ROADMAP & ACTION SUGGESTION BANNER */}
        {todoItems.length > 0 ? (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    Lộ Trình Cần Sửa Để Đạt 100/100 Điểm SEO Tuyệt Đối
                    <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-300">
                      Còn {todoItems.length} mục
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Hệ thống đã phân tích các tiêu chí chưa đạt. Hãy thực hiện theo các gợi ý bên dưới hoặc dùng nút{' '}
                    <strong className="text-blue-600">⚡ Sửa nhanh</strong> để hoàn thành từng tiêu chí.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveChecklistTab('todo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
                  activeChecklistTab === 'todo'
                    ? 'bg-amber-600 text-white shadow-amber-200'
                    : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
                }`}
              >
                {activeChecklistTab === 'todo' ? 'Đang lọc mục cần sửa' : `Xem ${todoItems.length} mục cần sửa`}
              </button>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Tiến độ hoàn thành:</span>
                <span className="font-bold text-blue-600">
                  {checklistStats.passed} / {checklistStats.total} tiêu chí ({seoScore}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${(checklistStats.passed / checklistStats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/5 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="font-extrabold text-emerald-950 text-base flex items-center gap-2">
                🎉 Tuyệt Vời! Đã Đạt 100/100 Điểm Chuẩn SEO Hoàn Hảo!
              </h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Tất cả các tiêu chí xếp hạng của Google Search, Yoast SEO và Rank Math đều đã được tối ưu hóa trọn vẹn. Bài viết sẵn sàng xuất bản lên Top Google!
              </p>
            </div>
          </div>
        )}

        {/* 3. FOCUS KEYWORD INPUT (YOAST / RANK MATH STYLE) */}
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
            <div className="space-y-2 pt-1">
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Bạn chưa đặt từ khóa chính. Hãy nhập hoặc nhấp vào một từ khóa gợi ý bên dưới:</span>
              </p>
              {suggestedKeywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Gợi ý từ tiêu đề:</span>
                  {suggestedKeywords.map((kw, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        onFocusKeywordChange(kw);
                        toast.success(`Đã chọn từ khóa chính: "${kw}"`);
                      }}
                      className="bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {kw}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. GOOGLE SERP & SOCIAL SNIPPET PREVIEW & METADATA EDITOR */}
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

          {/* 5. INLINE METADATA EDITORS (SEO Title, Slug, Meta Description) */}
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
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
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
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
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

        {/* 6. WORDPRESS / RANK MATH AUDIT CHECKLIST WITH SUGGESTIONS & 1-CLICK FIXES */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
          {/* Checklist Tab Headers */}
          <div className="flex border-b border-slate-200 bg-slate-50/90 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveChecklistTab('todo')}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeChecklistTab === 'todo'
                  ? 'border-amber-500 text-amber-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              ⚡ Cần Sửa Ngay ({todoItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveChecklistTab('all')}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeChecklistTab === 'all'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất Cả Tiêu Chí ({checklistStats.total})
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
            {displayedItems.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-slate-800 text-sm">Không còn mục nào cần sửa!</h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tất cả các tiêu chí đã được khắc phục hoàn hảo. Chúc mừng bạn đã hoàn thiện bài viết chuẩn SEO!
                </p>
              </div>
            ) : (
              displayedItems.map((item) => (
                <div
                  key={item.id}
                  className={`pt-3.5 first:pt-0 p-3 rounded-xl transition-colors ${
                    !item.passed ? (item.priority === 'critical' ? 'bg-rose-50/30' : 'bg-amber-50/20') : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : item.warning ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-bold text-xs ${item.passed ? 'text-slate-800' : 'text-slate-900'}`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!item.passed && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                item.priority === 'critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.priority === 'critical' ? 'Cần sửa ngay' : 'Khuyến nghị'}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Current Issue (if not passed) */}
                      {!item.passed && item.issue && (
                        <p className="text-[11px] font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100">
                          ⚠️ Vấn đề: {item.issue}
                        </p>
                      )}

                      {/* Actionable Suggestion */}
                      {!item.passed && item.suggestion && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/80 leading-relaxed">
                          👉 <strong className="text-slate-800">Gợi ý cách khắc phục:</strong> {item.suggestion}
                        </p>
                      )}

                      {/* Default Tip when passed */}
                      {item.passed && (
                        <p className="text-[11px] text-slate-500 leading-relaxed">{item.tip}</p>
                      )}

                      {/* Quick 1-Click Fix Actions */}
                      {!item.passed && item.quickFixes && item.quickFixes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Sửa Nhanh 1-Chạm:
                          </span>
                          {item.quickFixes.map((qf, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={qf.action}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${
                                qf.primary
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {qf.icon}
                              <span>{qf.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsSeoAssistant;
