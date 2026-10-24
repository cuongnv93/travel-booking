'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Smartphone,
  Monitor,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  FileCheck,
  TrendingUp,
} from 'lucide-react';

interface AdminNewsSeoAssistantProps {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  focusKeyword: string;
  onFocusKeywordChange: (keyword: string) => void;
  seoTitle: string;
  onSeoTitleChange: (val: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (val: string) => void;
  activeLang: string;
}

export const AdminNewsSeoAssistant: React.FC<AdminNewsSeoAssistantProps> = ({
  title,
  excerpt,
  content,
  slug,
  focusKeyword,
  onFocusKeywordChange,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  activeLang,
}) => {
  const [devicePreview, setDevicePreview] = useState<'mobile' | 'desktop'>('mobile');
  const [isAuditExpanded, setIsAuditExpanded] = useState(true);
  const [isMetaExpanded, setIsMetaExpanded] = useState(false);

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
        inExcerpt: false,
        inSlug: false,
        inFirstParagraph: false,
        inHeadings: false,
        occurrences: 0,
        density: 0,
      };
    }

    const lowerTitle = title.toLowerCase();
    const lowerExcerpt = excerpt.toLowerCase();
    const lowerSlug = slug.toLowerCase();
    const lowerContent = content.toLowerCase();
    const lowerPlainText = plainText.toLowerCase();

    // Occurrences count
    const regex = new RegExp(normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lowerPlainText.match(regex);
    const count = matches ? matches.length : 0;
    const density = wordCount > 0 ? (count / wordCount) * 100 : 0;

    // First paragraph (first 100 words)
    const first100Words = lowerPlainText.split(/\s+/).slice(0, 100).join(' ');
    const inFirstParagraph = first100Words.includes(normalizedKeyword);

    // Headings check
    const headingMatches = lowerContent.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/gi) || [];
    const inHeadings = headingMatches.some((h) => h.includes(normalizedKeyword));

    return {
      inTitle: lowerTitle.includes(normalizedKeyword),
      inExcerpt: lowerExcerpt.includes(normalizedKeyword),
      inSlug: lowerSlug.includes(normalizedKeyword.replace(/\s+/g, '-')),
      inFirstParagraph,
      inHeadings,
      occurrences: count,
      density: parseFloat(density.toFixed(2)),
    };
  }, [normalizedKeyword, title, excerpt, slug, content, plainText, wordCount]);

  // Structural checks
  const structureStats = useMemo(() => {
    const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
    const h3Matches = content.match(/<h3[^>]*>(.*?)<\/h3>/gi) || [];
    const imgMatches = content.match(/<img[^>]*>/gi) || [];
    const altMatches = content.match(/<img[^>]*alt=["'](?!["'])[^"']+["'][^>]*>/gi) || [];
    const figcaptionMatches = content.match(/<figcaption[^>]*>(.*?)<\/figcaption>/gi) || [];
    const linkMatches = content.match(/<a[^>]*href=["'][^"']+["'][^>]*>/gi) || [];

    return {
      h2Count: h2Matches.length,
      h3Count: h3Matches.length,
      imgCount: imgMatches.length,
      altCount: altMatches.length,
      figcaptionCount: figcaptionMatches.length,
      linkCount: linkMatches.length,
    };
  }, [content]);

  // Overall Score Calculation (0 - 100)
  const seoScore = useMemo(() => {
    let score = 0;

    // 1. Focus keyword set (10 pts)
    if (normalizedKeyword) score += 10;

    // 2. Keyword in title (15 pts)
    if (keywordStats.inTitle) score += 15;

    // 3. Keyword in excerpt (10 pts)
    if (keywordStats.inExcerpt) score += 10;

    // 4. Keyword in slug (5 pts)
    if (keywordStats.inSlug) score += 5;

    // 5. Title length optimal 40-65 chars (10 pts)
    const effectiveTitle = seoTitle || title;
    if (effectiveTitle.length >= 40 && effectiveTitle.length <= 65) {
      score += 10;
    } else if (effectiveTitle.length > 25 && effectiveTitle.length <= 80) {
      score += 5;
    }

    // 6. Excerpt / Meta description length optimal 120-160 chars (10 pts)
    const effectiveDesc = seoDescription || excerpt;
    if (effectiveDesc.length >= 120 && effectiveDesc.length <= 165) {
      score += 10;
    } else if (effectiveDesc.length >= 80) {
      score += 5;
    }

    // 7. Word count length (15 pts)
    if (wordCount >= 800) score += 15;
    else if (wordCount >= 400) score += 10;
    else if (wordCount >= 200) score += 5;

    // 8. Keyword density (1.0% - 2.5% is ideal) (10 pts)
    if (keywordStats.density >= 0.8 && keywordStats.density <= 3.0) {
      score += 10;
    } else if (keywordStats.occurrences > 0) {
      score += 5;
    }

    // 9. Headings structure (10 pts)
    if (structureStats.h2Count >= 2 && structureStats.h3Count >= 1) score += 10;
    else if (structureStats.h2Count >= 1) score += 5;

    // 10. Images & Alt attributes (5 pts)
    if (structureStats.imgCount >= 1 && structureStats.altCount === structureStats.imgCount) {
      score += 5;
    } else if (structureStats.imgCount >= 1) {
      score += 3;
    }

    return Math.min(100, Math.max(0, score));
  }, [
    normalizedKeyword,
    keywordStats,
    title,
    seoTitle,
    excerpt,
    seoDescription,
    wordCount,
    structureStats,
  ]);

  // Score visual tier
  const scoreBadge = useMemo(() => {
    if (seoScore >= 80) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'bg-emerald-500',
        label: 'Tối ưu SEO Xuất Sắc',
        icon: CheckCircle2,
      };
    }
    if (seoScore >= 50) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'bg-amber-500',
        label: 'Khá – Cần Hoàn Thiện Thêm',
        icon: AlertCircle,
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      bar: 'bg-rose-500',
      label: 'Chưa Đạt Chuẩn SEO',
      icon: XCircle,
    };
  }, [seoScore]);

  const ScoreIcon = scoreBadge.icon;

  const displayTitle = seoTitle || title || 'Tiêu đề bài viết hiển thị trên Google Search...';
  const displayDesc =
    seoDescription ||
    excerpt ||
    'Đoạn trích dẫn mô tả bài viết sẽ xuất hiện tại đây dưới dạng kết quả tìm kiếm Google (Meta Description)...';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-5">
      {/* Header & Score Gauge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Trợ Lý SEO & Phân Tích Chuẩn Google
            </h3>
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {activeLang.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Đánh giá theo thời gian thực các tiêu chuẩn On-Page SEO của Google và Rank Math
          </p>
        </div>

        {/* Score Pill */}
        <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border ${scoreBadge.bg}`}>
          <ScoreIcon className="w-4 h-4 shrink-0" />
          <div className="text-right">
            <span className="text-base font-black tracking-tight">{seoScore}</span>
            <span className="text-[11px] font-bold opacity-80">/100</span>
          </div>
          <span className="text-xs font-bold pl-1 border-l border-current/20 hidden sm:inline">
            {scoreBadge.label}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full ${scoreBadge.bar} transition-all duration-300 ease-out`}
          style={{ width: `${seoScore}%` }}
        />
      </div>

      {/* Focus Keyword Input */}
      <div>
        <label className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
          <span className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Từ Khóa Trọng Tâm (Focus Keyword):
          </span>
          {normalizedKeyword && (
            <span className="text-[11px] text-slate-500 font-normal">
              Xuất hiện: <strong className="text-blue-600">{keywordStats.occurrences}</strong> lần (
              {keywordStats.density}%)
            </span>
          )}
        </label>
        <input
          type="text"
          value={focusKeyword}
          onChange={(e) => onFocusKeywordChange(e.target.value)}
          placeholder="VD: du lịch ninh bình, kinh nghiệm du lịch hà nội, ẩm thực đà nẵng..."
          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium bg-slate-50/50"
        />
        <p className="text-[10px] text-slate-400 mt-1">
          Từ khóa chính giúp hệ thống kiểm tra mật độ xuất hiện trong tiêu đề, mô tả, heading và bài viết.
        </p>
      </div>

      {/* Google SERP Snippet Preview */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            Xem trước hiển thị kết quả tìm kiếm Google (SERP Preview)
          </span>

          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setDevicePreview('mobile')}
              className={`p-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                devicePreview === 'mobile'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Giao diện Google Mobile"
            >
              <Smartphone className="w-3 h-3" /> Mobile
            </button>
            <button
              type="button"
              onClick={() => setDevicePreview('desktop')}
              className={`p-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                devicePreview === 'desktop'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Giao diện Google Desktop"
            >
              <Monitor className="w-3 h-3" /> Desktop
            </button>
          </div>
        </div>

        {/* Realistic Google Snippet Card */}
        <div
          className={`bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs ${
            devicePreview === 'mobile' ? 'max-w-sm' : 'w-full'
          }`}
        >
          {/* Breadcrumb row */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-1">
            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-extrabold">
              T
            </div>
            <span className="font-semibold text-slate-800">Travel Booking</span>
            <span className="text-slate-400">&rsaquo;</span>
            <span className="text-slate-500 truncate">
              {activeLang}/news/{slug || 'du-lich-viet-nam'}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-blue-700 hover:underline cursor-pointer font-medium text-sm leading-snug line-clamp-2">
            {displayTitle}
          </h4>

          {/* Snippet Description */}
          <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">{displayDesc}</p>
        </div>

        {/* Toggle Custom SEO Meta fields */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsMetaExpanded(!isMetaExpanded)}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{isMetaExpanded ? 'Thu gọn' : 'Tùy chỉnh riêng'} Thẻ Meta Title & Meta Description Google</span>
            {isMetaExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {isMetaExpanded && (
            <div className="mt-2.5 p-3 bg-white rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Tiêu đề SEO Google (Meta Title)</span>
                  <span
                    className={
                      (seoTitle || title).length > 65
                        ? 'text-amber-600 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {(seoTitle || title).length} / 60 ký tự
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => onSeoTitleChange(e.target.value)}
                  placeholder={title || 'Mặc định lấy từ Tiêu đề bài viết...'}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Mô tả SEO Google (Meta Description)</span>
                  <span
                    className={
                      (seoDescription || excerpt).length > 165
                        ? 'text-amber-600 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {(seoDescription || excerpt).length} / 160 ký tự
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => onSeoDescriptionChange(e.target.value)}
                  placeholder={excerpt || 'Mặc định lấy từ Tóm tắt bài viết...'}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Checklist (Collapsible) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAuditExpanded(!isAuditExpanded)}
          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        >
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-3.5 h-3.5 text-blue-600" />
            Bảng Kiểm Tra Tiêu Chí SEO Chi Tiết
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              {wordCount} từ &bull; ~{readingTime} phút đọc
            </span>
            {isAuditExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {isAuditExpanded && (
          <div className="p-3 divide-y divide-slate-100 text-[11px] space-y-2">
            {/* 1. Keyword in Title */}
            <div className="flex items-start gap-2.5 pt-2 first:pt-0">
              {keywordStats.inTitle ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-800">Từ khóa trong Tiêu đề (Title)</p>
                <p className="text-slate-500 text-[10px]">
                  {keywordStats.inTitle
                    ? 'Tiêu đề đã chứa từ khóa mục tiêu chuẩn SEO.'
                    : 'Nên đưa từ khóa mục tiêu vào tiêu đề (tốt nhất ở nửa đầu tiêu đề).'}
                </p>
              </div>
            </div>

            {/* 2. Keyword in Meta Description */}
            <div className="flex items-start gap-2.5 pt-2">
              {keywordStats.inExcerpt ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-800">Từ khóa trong Đoạn tóm tắt (Meta Description)</p>
                <p className="text-slate-500 text-[10px]">
                  {keywordStats.inExcerpt
                    ? 'Đoạn tóm tắt đã chứa từ khóa mục tiêu.'
                    : 'Nên thêm từ khóa vào tóm tắt để người tìm kiếm dễ bấm vào bài viết.'}
                </p>
              </div>
            </div>

            {/* 3. Word Count */}
            <div className="flex items-start gap-2.5 pt-2">
              {wordCount >= 800 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : wordCount >= 300 ? (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-800">
                  Độ dài nội dung bài viết: <span className="text-blue-600">{wordCount} từ</span>
                </p>
                <p className="text-slate-500 text-[10px]">
                  {wordCount >= 800
                    ? 'Độ dài bài viết rất tốt, cung cấp thông tin chuyên sâu cho người đọc.'
                    : wordCount >= 300
                    ? 'Độ dài ở mức trung bình (khuyến nghị trên 800 từ để cạnh tranh top tìm kiếm).'
                    : 'Bài viết quá ngắn (dưới 300 từ), có thể bị Google đánh giá là thin content.'}
                </p>
              </div>
            </div>

            {/* 4. Headings Structure */}
            <div className="flex items-start gap-2.5 pt-2">
              {structureStats.h2Count >= 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-800">
                  Phân cấp đề mục Headings: {structureStats.h2Count} thẻ H2 &bull; {structureStats.h3Count} thẻ H3
                </p>
                <p className="text-slate-500 text-[10px]">
                  {structureStats.h2Count >= 2
                    ? 'Cấu trúc bài viết có phân cấp rõ ràng với các mục H2, H3.'
                    : 'Nên sử dụng ít nhất 2-3 thẻ H2 để chia nhỏ nội dung giúp người đọc và bot dễ quét.'}
                </p>
              </div>
            </div>

            {/* 5. Images & Alt attributes */}
            <div className="flex items-start gap-2.5 pt-2">
              {structureStats.imgCount >= 1 && structureStats.altCount === structureStats.imgCount ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : structureStats.imgCount >= 1 ? (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-800">
                  Tối ưu hình ảnh: {structureStats.imgCount} ảnh ({structureStats.altCount} ảnh có thẻ alt,{' '}
                  {structureStats.figcaptionCount} chú thích)
                </p>
                <p className="text-slate-500 text-[10px]">
                  {structureStats.imgCount === 0
                    ? 'Chưa có ảnh trong bài viết. Hãy thêm khối ảnh để bài viết sinh động hơn.'
                    : structureStats.altCount < structureStats.imgCount
                    ? 'Một số ảnh đang thiếu thẻ alt mô tả. Hãy bổ sung alt để tối ưu Google Image Search.'
                    : 'Tất cả các ảnh đều có thẻ alt chuẩn SEO.'}
                </p>
              </div>
            </div>

            {/* 6. Keyword Density */}
            <div className="flex items-start gap-2.5 pt-2">
              {keywordStats.density >= 0.8 && keywordStats.density <= 3.0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : keywordStats.density > 3.0 ? (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-800">
                  Mật độ từ khóa chính: {keywordStats.density}% ({keywordStats.occurrences} lần)
                </p>
                <p className="text-slate-500 text-[10px]">
                  {keywordStats.density >= 0.8 && keywordStats.density <= 3.0
                    ? 'Mật độ từ khóa đạt chuẩn tối ưu (1.0% - 2.5%).'
                    : keywordStats.density > 3.0
                    ? 'Mật độ từ khóa hơi cao (> 3%), có nguy cơ bị tính là nhồi nhét từ khóa.'
                    : 'Mật độ từ khóa hơi thấp. Bạn có thể nhắc lại từ khóa một cách tự nhiên trong bài.'}
                </p>
              </div>
            </div>

            {/* 7. Internal Links */}
            <div className="flex items-start gap-2.5 pt-2">
              {structureStats.linkCount >= 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-800">
                  Liên kết nội bộ (Internal Links): {structureStats.linkCount} liên kết
                </p>
                <p className="text-slate-500 text-[10px]">
                  {structureStats.linkCount >= 1
                    ? 'Bài viết có liên kết nội bộ, giúp tăng thời gian on-site và điều hướng khách đặt tour.'
                    : 'Nên chèn ít nhất 1 liên kết dẫn đến tour du lịch hoặc khách sạn liên quan.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
