'use client';

import { memo, useState } from 'react';
import { Plus, Trash2, Award, Clock, ShieldCheck, Globe, FileCheck, HelpCircle, UserCheck, Star } from 'lucide-react';
import { AdminI18nTabs } from '@/components/admin/common/AdminI18nTabs';

export interface VisaCountryItem {
  key: string;
  flag: string;
  name: Record<string, string>;
  processingTime: Record<string, string>;
  price: number;
  passRate: string;
  tag: string;
  bg?: string;
  border?: string;
  desc: Record<string, string>;
  isFeatured: boolean;
}

export interface VisaProcessStepItem {
  step: string;
  icon: string;
  title: Record<string, string>;
  desc: Record<string, string>;
}

export interface VisaStatBadgeItem {
  label: Record<string, string>;
  value: string;
  sub: Record<string, string>;
  icon: string;
  color: string;
}

interface Props {
  countries: VisaCountryItem[];
  setCountries: (items: VisaCountryItem[]) => void;
  processSteps: VisaProcessStepItem[];
  setProcessSteps: (items: VisaProcessStepItem[]) => void;
  statsBadges: VisaStatBadgeItem[];
  setStatsBadges: (items: VisaStatBadgeItem[]) => void;
}

export const VisaSettingsTab = memo(function VisaSettingsTab({
  countries,
  setCountries,
  processSteps,
  setProcessSteps,
  statsBadges,
  setStatsBadges,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'countries' | 'steps' | 'badges'>('countries');
  const [activeLang, setActiveLang] = useState<string>('vi');

  // Country Handlers
  const handleAddCountry = () => {
    const newCountry: VisaCountryItem = {
      key: 'Country_' + Date.now(),
      flag: 'https://flagcdn.com/w40/vn.png',
      name: { vi: 'Visa Quốc Gia Mới', en: 'New Country Visa' },
      processingTime: { vi: '5 - 7 ngày làm việc', en: '5 - 7 working days' },
      price: 2000000,
      passRate: '99.0%',
      tag: 'Phổ biến',
      desc: {
        vi: 'Hồ sơ tinh gọn, hỗ trợ xử lý chuyên nghiệp và bàn giao visa tận nơi.',
        en: 'Minimal documents, professional assistance and door-to-door visa delivery.',
      },
      isFeatured: false,
    };
    setCountries([...countries, newCountry]);
  };

  const handleUpdateCountry = (idx: number, field: string, val: any) => {
    const updated = [...countries];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[idx] as any)[parent] = { ...(updated[idx] as any)[parent], [child]: val };
    } else {
      (updated[idx] as any)[field] = val;
    }
    setCountries(updated);
  };

  const handleRemoveCountry = (idx: number) => {
    setCountries(countries.filter((_, i) => i !== idx));
  };

  // Process Step Handlers
  const handleAddStep = () => {
    const nextNum = String(processSteps.length + 1).padStart(2, '0');
    setProcessSteps([
      ...processSteps,
      {
        step: nextNum,
        icon: 'HelpCircle',
        title: { vi: `Bước ${nextNum}: Tiêu đề bước mới`, en: `Step ${nextNum}: New Step Title` },
        desc: { vi: 'Mô tả chi tiết các bước xử lý...', en: 'Detailed description of this process step...' },
      },
    ]);
  };

  const handleUpdateStep = (idx: number, field: string, val: any) => {
    const updated = [...processSteps];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[idx] as any)[parent] = { ...(updated[idx] as any)[parent], [child]: val };
    } else {
      (updated[idx] as any)[field] = val;
    }
    setProcessSteps(updated);
  };

  const handleRemoveStep = (idx: number) => {
    setProcessSteps(processSteps.filter((_, i) => i !== idx));
  };

  // Stats Badges Handlers
  const handleUpdateBadge = (idx: number, field: string, val: any) => {
    const updated = [...statsBadges];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[idx] as any)[parent] = { ...(updated[idx] as any)[parent], [child]: val };
    } else {
      (updated[idx] as any)[field] = val;
    }
    setStatsBadges(updated);
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="bg-slate-100/90 border border-slate-200/80 rounded-lg p-1 inline-flex gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('countries')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'countries'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Quốc Gia Cấp Visa ({countries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('steps')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'steps'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" /> Quy Trình Thủ Tục ({processSteps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('badges')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'badges'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Huy Hiệu Uy Tín ({statsBadges.length})
          </button>
        </div>

        {/* Language selector tabs */}
        <AdminI18nTabs activeLang={activeLang} onChange={setActiveLang} />
      </div>

      {/* 1. Countries Catalog */}
      {activeSubTab === 'countries' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Danh Mục Quốc Gia Cung Cấp Dịch Vụ Visa</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu hình các quốc gia nhận làm visa, mức giá trọn gói, tỷ lệ đậu và thời gian xử lý hồ sơ
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCountry}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Quốc Gia
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries.map((c, idx) => (
              <div
                key={c.key || idx}
                className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3 relative group hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={c.flag}
                      alt={c.name?.[activeLang] || ''}
                      className="w-7 h-5 object-cover rounded shadow-xs border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://flagcdn.com/w40/un.png';
                      }}
                    />
                    <input
                      type="text"
                      value={c.name?.[activeLang] || ''}
                      onChange={(e) => handleUpdateCountry(idx, `name.${activeLang}`, e.target.value)}
                      placeholder="Tên quốc gia..."
                      className="font-bold text-slate-800 text-sm border-b border-transparent focus:border-blue-500 focus:outline-hidden bg-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCountry(idx)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                    title="Xóa quốc gia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Link Cờ Quốc Kỳ (Flag URL)</label>
                    <input
                      type="text"
                      value={c.flag || ''}
                      onChange={(e) => handleUpdateCountry(idx, 'flag', e.target.value)}
                      placeholder="https://flagcdn.com/w40/jp.png"
                      className="w-full border border-slate-200 rounded-lg p-1.5 font-mono text-[11px] text-slate-700 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-medium">Giá Dịch Vụ (VNĐ)</label>
                      <input
                        type="number"
                        value={c.price || 0}
                        onChange={(e) => handleUpdateCountry(idx, 'price', Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg p-1.5 text-slate-800 font-semibold focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-medium">Tỷ Lệ Đậu</label>
                      <input
                        type="text"
                        value={c.passRate || ''}
                        onChange={(e) => handleUpdateCountry(idx, 'passRate', e.target.value)}
                        placeholder="99.2%"
                        className="w-full border border-slate-200 rounded-lg p-1.5 text-emerald-600 font-semibold focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-medium">Thời Gian Xử Lý ({activeLang.toUpperCase()})</label>
                      <input
                        type="text"
                        value={c.processingTime?.[activeLang] || ''}
                        onChange={(e) => handleUpdateCountry(idx, `processingTime.${activeLang}`, e.target.value)}
                        placeholder="5 - 7 ngày"
                        className="w-full border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-medium">Huy Hiệu (Tag)</label>
                      <input
                        type="text"
                        value={c.tag || ''}
                        onChange={(e) => handleUpdateCountry(idx, 'tag', e.target.value)}
                        placeholder="Hot / Ưa chuộng"
                        className="w-full border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Mô Tả Ghi Chú ({activeLang.toUpperCase()})</label>
                    <textarea
                      rows={2}
                      value={c.desc?.[activeLang] || ''}
                      onChange={(e) => handleUpdateCountry(idx, `desc.${activeLang}`, e.target.value)}
                      placeholder="Mô tả ưu điểm hồ sơ, chính sách hỗ trợ..."
                      className="w-full border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:border-blue-500 focus:outline-hidden text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.isFeatured || false}
                        onChange={(e) => handleUpdateCountry(idx, 'isFeatured', e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Nổi bật trang chủ Visa</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Process Steps */}
      {activeSubTab === 'steps' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Quy Trình 4 Bước Xin Visa Chuẩn</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các giai đoạn tư vấn, chuẩn bị giấy tờ, nộp hồ sơ và trả kết quả hiển thị cho khách hàng
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddStep}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Bước
            </button>
          </div>

          <div className="space-y-3">
            {processSteps.map((step, idx) => (
              <div
                key={step.step || idx}
                className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3 relative hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center shrink-0">
                      {step.step}
                    </span>
                    <input
                      type="text"
                      value={step.title?.[activeLang] || ''}
                      onChange={(e) => handleUpdateStep(idx, `title.${activeLang}`, e.target.value)}
                      placeholder="Tiêu đề bước..."
                      className="font-bold text-slate-800 text-sm border-b border-transparent focus:border-blue-500 focus:outline-hidden bg-transparent min-w-[280px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Mã Bước (Số thứ tự)</label>
                    <input
                      type="text"
                      value={step.step || ''}
                      onChange={(e) => handleUpdateStep(idx, 'step', e.target.value)}
                      placeholder="01"
                      className="w-full border border-slate-200 rounded-lg p-1.5 font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Tên Icon (Lucide)</label>
                    <input
                      type="text"
                      value={step.icon || ''}
                      onChange={(e) => handleUpdateStep(idx, 'icon', e.target.value)}
                      placeholder="HelpCircle / Award"
                      className="w-full border border-slate-200 rounded-lg p-1.5 font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-500 block mb-0.5 font-medium">Nội Dung Chi Tiết ({activeLang.toUpperCase()})</label>
                    <textarea
                      rows={2}
                      value={step.desc?.[activeLang] || ''}
                      onChange={(e) => handleUpdateStep(idx, `desc.${activeLang}`, e.target.value)}
                      placeholder="Mô tả công việc và thời gian phản hồi..."
                      className="w-full border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:border-blue-500 focus:outline-hidden text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Stats Badges */}
      {activeSubTab === 'badges' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">4 Huy Hiệu Cam Kết & Năng Lực Visa</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các chỉ số uy tín về số lượng quốc gia, tỷ lệ đậu visa, tốc độ thẩm định và cam kết bảo mật
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statsBadges.map((b, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Huy hiệu #{idx + 1}</span>
                  <span className="text-xs font-mono text-slate-400">{b.icon}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Chỉ Số Nổi Bật (Value)</label>
                    <input
                      type="text"
                      value={b.value || ''}
                      onChange={(e) => handleUpdateBadge(idx, 'value', e.target.value)}
                      placeholder="99.2% / 50+"
                      className="w-full border border-slate-200 rounded-lg p-1.5 font-bold text-blue-600 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Icon (Lucide)</label>
                    <input
                      type="text"
                      value={b.icon || ''}
                      onChange={(e) => handleUpdateBadge(idx, 'icon', e.target.value)}
                      placeholder="Globe / ShieldCheck"
                      className="w-full border border-slate-200 rounded-lg p-1.5 font-mono text-slate-700 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Nhãn Hiển Thị ({activeLang.toUpperCase()})</label>
                    <input
                      type="text"
                      value={b.label?.[activeLang] || ''}
                      onChange={(e) => handleUpdateBadge(idx, `label.${activeLang}`, e.target.value)}
                      placeholder="Tỷ Lệ Đậu Visa"
                      className="w-full border border-slate-200 rounded-lg p-1.5 text-slate-800 font-semibold focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Phụ Đề Nhỏ ({activeLang.toUpperCase()})</label>
                    <input
                      type="text"
                      value={b.sub?.[activeLang] || ''}
                      onChange={(e) => handleUpdateBadge(idx, `sub.${activeLang}`, e.target.value)}
                      placeholder="Được kiểm chứng"
                      className="w-full border border-slate-200 rounded-lg p-1.5 text-slate-600 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
