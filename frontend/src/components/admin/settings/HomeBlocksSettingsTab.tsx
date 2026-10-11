'use client';

import { memo, useState } from 'react';
import { Plus, Trash2, Upload, MapPin, Shield, Star, Image as ImageIcon, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { AdminI18nTabs } from '@/components/admin/common/AdminI18nTabs';

export interface DestinationItem {
  id: string;
  name: Record<string, string>;
  image: string;
  tag: Record<string, string>;
  tourQuery: string;
  order: number;
  isActive: boolean;
}

export interface WhyChooseUsItem {
  id: string;
  icon: string;
  color: string;
  bg: string;
  title: Record<string, string>;
  detail: Record<string, string>;
}

export interface StatCounterItem {
  value: string;
  icon: string;
  color: string;
  label: Record<string, string>;
  sub: Record<string, string>;
}

interface Props {
  destinations: DestinationItem[];
  setDestinations: (items: DestinationItem[]) => void;
  whyChooseUs: WhyChooseUsItem[];
  setWhyChooseUs: (items: WhyChooseUsItem[]) => void;
  statsCounters: StatCounterItem[];
  setStatsCounters: (items: StatCounterItem[]) => void;
}

export const HomeBlocksSettingsTab = memo(function HomeBlocksSettingsTab({
  destinations,
  setDestinations,
  whyChooseUs,
  setWhyChooseUs,
  statsCounters,
  setStatsCounters,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'destinations' | 'whyUs' | 'stats'>('destinations');
  const [activeLang, setActiveLang] = useState<string>('vi');

  // Destinations Handlers
  const handleAddDestination = () => {
    const newItem: DestinationItem = {
      id: 'dest_' + Date.now(),
      name: { vi: 'Điểm Đến Mới', en: 'New Destination' },
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
      tag: { vi: 'Hấp dẫn', en: 'Attractive' },
      tourQuery: '',
      order: destinations.length + 1,
      isActive: true,
    };
    setDestinations([...destinations, newItem]);
  };

  const handleUpdateDest = (idx: number, field: string, val: any) => {
    const updated = [...destinations];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[idx] as any)[parent] = { ...(updated[idx] as any)[parent], [child]: val };
    } else {
      (updated[idx] as any)[field] = val;
    }
    setDestinations(updated);
  };

  const handleRemoveDest = (idx: number) => {
    setDestinations(destinations.filter((_, i) => i !== idx));
  };

  // Upload image for destination
  const handleUploadDestImage = async (idx: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res: any = await api.post('/upload', formData);
      const url = res.url || res.path || res.imageUrl;
      const backendOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
      const finalUrl = url.startsWith('http') ? url : `${backendOrigin}${url}`;
      handleUpdateDest(idx, 'image', finalUrl);
    } catch (err: any) {
      alert('Lỗi tải ảnh lên: ' + (err.response?.data?.message || err.message));
    }
  };

  // Why Choose Us Handlers
  const handleUpdateWhyUs = (idx: number, field: string, val: any) => {
    const updated = [...whyChooseUs];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[idx] as any)[parent] = { ...(updated[idx] as any)[parent], [child]: val };
    } else {
      (updated[idx] as any)[field] = val;
    }
    setWhyChooseUs(updated);
  };

  const handleAddWhyUs = () => {
    setWhyChooseUs([
      ...whyChooseUs,
      {
        id: 'feature_' + Date.now(),
        icon: 'Shield',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        title: { vi: 'Cam Kết Mới', en: 'New Feature' },
        detail: { vi: 'Mô tả chi tiết về lợi ích mang lại cho khách hàng.', en: 'Detailed feature description.' },
      },
    ]);
  };

  const handleRemoveWhyUs = (idx: number) => {
    setWhyChooseUs(whyChooseUs.filter((_, i) => i !== idx));
  };

  // Stats Handlers
  const handleUpdateStat = (idx: number, field: string, val: any) => {
    const updated = [...statsCounters];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[idx] as any)[parent] = { ...(updated[idx] as any)[parent], [child]: val };
    } else {
      (updated[idx] as any)[field] = val;
    }
    setStatsCounters(updated);
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="bg-slate-100/90 border border-slate-200/80 rounded-lg p-1 inline-flex gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('destinations')}
            className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'destinations' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Điểm Đến Nổi Bật ({destinations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('whyUs')}
            className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'whyUs' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Cam Kết Dịch Vụ ({whyChooseUs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('stats')}
            className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'stats' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Star className="w-3.5 h-3.5" /> Thống Kê Thương Hiệu ({statsCounters.length})
          </button>
        </div>

        {/* Language selector tabs */}
        <AdminI18nTabs activeLang={activeLang} onChange={setActiveLang} />
      </div>

      {/* 1. Điểm Đến Nổi Bật */}
      {activeSubTab === 'destinations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Danh Sách Điểm Đến Hiển Thị Trang Chủ</h3>
              <p className="text-xs text-slate-500">Tùy biến hình ảnh, tên gọi, thẻ nổi bật và từ khóa lọc tour</p>
            </div>
            <button
              type="button"
              onClick={handleAddDestination}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Thêm Điểm Đến
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((dest, idx) => (
              <div key={dest.id || idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 relative group">
                <div className="h-32 rounded-xl overflow-hidden relative bg-slate-900 group/img">
                  <img src={dest.image} alt={dest.name?.vi} className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold gap-1.5">
                    <Upload className="w-4 h-4" /> Đổi Ảnh
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadDestImage(idx, e.target.files[0])}
                    />
                  </label>
                  <span className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    #{dest.order || idx + 1}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Tên ({activeLang.toUpperCase()}) {activeLang === 'vi' && '*'}</label>
                    <input
                      value={dest.name?.[activeLang] || ''}
                      onChange={(e) => handleUpdateDest(idx, `name.${activeLang}`, e.target.value)}
                      placeholder="VD: Hà Nội"
                      className="w-full border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Tag nhãn ({activeLang.toUpperCase()})</label>
                    <input
                      value={dest.tag?.[activeLang] || ''}
                      onChange={(e) => handleUpdateDest(idx, `tag.${activeLang}`, e.target.value)}
                      placeholder="VD: Di sản thế giới"
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Query lọc Tour</label>
                  <input
                    value={dest.tourQuery || dest.name?.vi || ''}
                    onChange={(e) => handleUpdateDest(idx, 'tourQuery', e.target.value)}
                    placeholder="VD: Hà Nội"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dest.isActive !== false}
                      onChange={(e) => handleUpdateDest(idx, 'isActive', e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Hiển thị</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveDest(idx)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Cam Kết Dịch Vụ (Why Choose Us) */}
      {activeSubTab === 'whyUs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Khối Lý Do Chọn Chúng Tôi (Why Choose Us)</h3>
              <p className="text-xs text-slate-500">Quản trị các tiêu chí cam kết uy tín và chất lượng phục vụ</p>
            </div>
            <button
              type="button"
              onClick={handleAddWhyUs}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Thêm Tiêu Chí
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whyChooseUs.map((item, idx) => (
              <div key={item.id || idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-blue-600">Tiêu chí #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWhyUs(idx)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                  </button>
                </div>

                <div className="text-xs space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Tiêu đề ({activeLang.toUpperCase()}) {activeLang === 'vi' && '*'}</label>
                  <input
                    value={item.title?.[activeLang] || ''}
                    onChange={(e) => handleUpdateWhyUs(idx, `title.${activeLang}`, e.target.value)}
                    placeholder="VD: Uy Tín Hàng Đầu"
                    className="w-full border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="text-xs space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">Nội dung chi tiết ({activeLang.toUpperCase()})</label>
                  <textarea
                    rows={2}
                    value={item.detail?.[activeLang] || ''}
                    onChange={(e) => handleUpdateWhyUs(idx, `detail.${activeLang}`, e.target.value)}
                    placeholder="Mô tả lý do..."
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Thống Kê Thương Hiệu */}
      {activeSubTab === 'stats' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Các Chỉ Số Thống Kê Thương Hiệu</h3>
            <p className="text-xs text-slate-500">Các con số chứng thực quy mô và độ uy tín</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statsCounters.map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-blue-600">Thẻ thống kê #{idx + 1}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Con số hiển thị *</label>
                    <input
                      value={stat.value || ''}
                      onChange={(e) => handleUpdateStat(idx, 'value', e.target.value)}
                      placeholder="VD: 500+"
                      className="w-full border border-slate-200 rounded-lg p-2 font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Nhãn ({activeLang.toUpperCase()}) {activeLang === 'vi' && '*'}</label>
                    <input
                      value={stat.label?.[activeLang] || ''}
                      onChange={(e) => handleUpdateStat(idx, `label.${activeLang}`, e.target.value)}
                      placeholder="VD: Tours Khám Phá"
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Phụ đề ({activeLang.toUpperCase()})</label>
                  <input
                    value={stat.sub?.[activeLang] || ''}
                    onChange={(e) => handleUpdateStat(idx, `sub.${activeLang}`, e.target.value)}
                    placeholder="VD: Trong & ngoài nước"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
