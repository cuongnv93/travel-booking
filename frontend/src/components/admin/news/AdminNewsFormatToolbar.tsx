'use client';

import React from 'react';
import {
  Heading2,
  Heading3,
  Image as ImageIcon,
  Table as TableIcon,
  List,
  Lightbulb,
  Link as LinkIcon,
  Quote,
} from 'lucide-react';

interface AdminNewsFormatToolbarProps {
  onInsert: (template: string) => void;
  activeLang: string;
}

export const AdminNewsFormatToolbar: React.FC<AdminNewsFormatToolbarProps> = ({
  onInsert,
  activeLang,
}) => {
  const insertH2 = () => {
    onInsert('<h2>1. Tiêu đề mục chính chuẩn SEO</h2>\n\n');
  };

  const insertH3 = () => {
    onInsert('<h3>1.1. Tiêu đề mục phụ chi tiết</h3>\n\n');
  };

  const insertFigure = () => {
    onInsert(
      `<figure class="my-6">\n  <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1200" alt="Mô tả từ khóa hình ảnh du lịch" class="rounded-2xl w-full object-cover shadow-md" />\n  <figcaption class="text-center text-xs text-slate-500 italic mt-2.5">Chú thích chi tiết góc chụp và địa điểm</figcaption>\n</figure>\n\n`
    );
  };

  const insertCallout = () => {
    onInsert(
      `<div class="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl my-4 text-amber-900">\n  <strong class="font-bold">💡 Mẹo hữu ích:</strong> Bạn nên chủ động đặt vé trước từ 2 đến 3 tuần vào mùa cao điểm để nhận được mức giá ưu đãi nhất.\n</div>\n\n`
    );
  };

  const insertQuote = () => {
    onInsert(
      `<blockquote class="p-4 my-4 border-l-4 border-blue-600 bg-blue-50/70 rounded-r-xl italic text-slate-800 text-sm font-medium">\n  &ldquo;Hành trình khám phá không chỉ là nhìn thấy những cảnh quan mới, mà là có được một đôi mắt mới.&rdquo;\n</blockquote>\n\n`
    );
  };

  const insertTable = () => {
    onInsert(
      `<table class="w-full my-6 text-xs sm:text-sm border-collapse border border-slate-200">\n  <thead>\n    <tr class="bg-slate-100">\n      <th class="p-3 text-left font-bold border border-slate-200">Hạng mục chi phí</th>\n      <th class="p-3 text-left font-bold border border-slate-200">Mức giá dự kiến</th>\n      <th class="p-3 text-left font-bold border border-slate-200">Ghi chú & Kinh nghiệm</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td class="p-3 border border-slate-200 font-medium">Khách sạn / Resort</td>\n      <td class="p-3 border border-slate-200 text-blue-600 font-semibold">800.000 – 1.500.000đ/đêm</td>\n      <td class="p-3 border border-slate-200 text-slate-600">Tiêu chuẩn 3-4 sao gần trung tâm</td>\n    </tr>\n    <tr>\n      <td class="p-3 border border-slate-200 font-medium">Vé tham quan & Thuyền</td>\n      <td class="p-3 border border-slate-200 text-blue-600 font-semibold">250.000đ/người</td>\n      <td class="p-3 border border-slate-200 text-slate-600">Trọn gói vé vào cổng & đi thuyền</td>\n    </tr>\n    <tr>\n      <td class="p-3 border border-slate-200 font-medium">Ẩm thực đặc sản</td>\n      <td class="p-3 border border-slate-200 text-blue-600 font-semibold">300.000đ/ngày</td>\n      <td class="p-3 border border-slate-200 text-slate-600">Thưởng thức món ngon địa phương</td>\n    </tr>\n  </tbody>\n</table>\n\n`
    );
  };

  const insertList = () => {
    onInsert(
      `<ul class="list-disc pl-5 space-y-2 my-4 text-slate-700">\n  <li>Chuẩn bị trang phục thoáng mát, kem chống nắng và mũ nón đầy đủ.</li>\n  <li>Mang theo giấy tờ tùy thân CCCD/Hộ chiếu để làm thủ tục nhận phòng.</li>\n  <li>Tải sẵn bản đồ ngoại tuyến hoặc đăng ký 4G để tra cứu thuận tiện.</li>\n</ul>\n\n`
    );
  };

  const insertCta = () => {
    onInsert(
      `<div class="my-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">\n  <div>\n    <h4 class="font-extrabold text-blue-950 text-sm sm:text-base">Gợi ý Tour Du Lịch Trọn Gói Giá Ưu Đãi</h4>\n    <p class="text-xs text-blue-700 mt-1">Dịch vụ chuẩn 5 sao, hướng dẫn viên nhiệt tình, đưa đón tận nơi an toàn.</p>\n  </div>\n  <a href="/${activeLang}/tours" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs">\n    Xem Tour Liên Quan &rarr;\n  </a>\n</div>\n\n`
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-t-lg border-b-0 text-slate-700">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 border-r border-slate-200 shrink-0">
        Chèn mẫu SEO:
      </span>

      <button
        type="button"
        onClick={insertH2}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer text-slate-800"
        title="Chèn thẻ H2 (Tiêu đề phần chính)"
      >
        <Heading2 className="w-3.5 h-3.5 text-blue-600" />
        <span>H2 Mục chính</span>
      </button>

      <button
        type="button"
        onClick={insertH3}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer text-slate-800"
        title="Chèn thẻ H3 (Tiêu đề con)"
      >
        <Heading3 className="w-3.5 h-3.5 text-indigo-600" />
        <span>H3 Mục phụ</span>
      </button>

      <button
        type="button"
        onClick={insertFigure}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer text-slate-800"
        title="Chèn khối ảnh có chú thích (Figure + Alt)"
      >
        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
        <span>Ảnh + Chú thích</span>
      </button>

      <button
        type="button"
        onClick={insertCallout}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer text-slate-800"
        title="Chèn khung ghi chú / mẹo du lịch"
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        <span>Hộp Mẹo Tip</span>
      </button>

      <button
        type="button"
        onClick={insertQuote}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer text-slate-800"
        title="Chèn trích dẫn blockquote"
      >
        <Quote className="w-3.5 h-3.5 text-purple-600" />
        <span>Trích dẫn</span>
      </button>

      <button
        type="button"
        onClick={insertTable}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer text-slate-800"
        title="Chèn bảng báo giá / chi phí"
      >
        <TableIcon className="w-3.5 h-3.5 text-cyan-600" />
        <span>Bảng giá</span>
      </button>

      <button
        type="button"
        onClick={insertList}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer text-slate-800"
        title="Chèn danh sách checklist"
      >
        <List className="w-3.5 h-3.5 text-slate-600" />
        <span>Checklist</span>
      </button>

      <button
        type="button"
        onClick={insertCta}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-md transition-colors cursor-pointer ml-auto"
        title="Chèn liên kết nội bộ hướng tới Tour du lịch"
      >
        <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
        <span>Gợi ý Tour (Internal Link)</span>
      </button>
    </div>
  );
};
