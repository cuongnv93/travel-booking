'use client';

import { memo, useState } from 'react';
import { Plus, Trash2, MapPin, Clock, Building, Compass, Phone, Mail } from 'lucide-react';
import { AdminI18nTabs } from '@/components/admin/common/AdminI18nTabs';

export interface BranchItem {
  id: string;
  name: Record<string, string>;
  address: Record<string, string>;
  phone: string;
  email: string;
  isMain: boolean;
  mapEmbedUrl?: string;
}

export interface WorkingHoursConfig {
  weekdays: Record<string, string>;
  weekend: Record<string, string>;
  hotlineNote: Record<string, string>;
}

export interface CoreValueItem {
  id: string;
  icon: string;
  title: Record<string, string>;
  desc: Record<string, string>;
  color: string;
}

interface Props {
  branches: BranchItem[];
  setBranches: (items: BranchItem[]) => void;
  workingHours: WorkingHoursConfig;
  setWorkingHours: (val: WorkingHoursConfig) => void;
  coreValues?: CoreValueItem[];
  setCoreValues?: (items: CoreValueItem[]) => void;
}

export const BranchesSettingsTab = memo(function BranchesSettingsTab({
  branches,
  setBranches,
  workingHours,
  setWorkingHours,
  coreValues = [],
  setCoreValues,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'branches' | 'hours' | 'values'>('branches');
  const [activeLang, setActiveLang] = useState<string>('vi');

  // Branch Handlers
  const handleAddBranch = () => {
    const newBranch: BranchItem = {
      id: 'branch_' + Date.now(),
      name: { vi: 'Chi Nhánh Mới', en: 'New Branch Office' },
      address: { vi: 'Địa chỉ văn phòng...', en: 'Office street address...' },
      phone: '028 1234 5678',
      email: 'office@travel.com',
      isMain: false,
      mapEmbedUrl: '',
    };
    setBranches([...branches, newBranch]);
  };

  const handleUpdateBranch = (idx: number, field: string, val: any) => {
    const updated = [...branches];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[idx] as any)[parent] = { ...(updated[idx] as any)[parent], [child]: val };
    } else {
      (updated[idx] as any)[field] = val;
    }
    setBranches(updated);
  };

  const handleSetMainBranch = (idx: number) => {
    const updated = branches.map((b, i) => ({
      ...b,
      isMain: i === idx,
    }));
    setBranches(updated);
  };

  const handleRemoveBranch = (idx: number) => {
    setBranches(branches.filter((_, i) => i !== idx));
  };

  // Working Hours Handlers
  const handleUpdateHours = (section: keyof WorkingHoursConfig, lang: string, val: string) => {
    setWorkingHours({
      ...workingHours,
      [section]: {
        ...(workingHours[section] || {}),
        [lang]: val,
      },
    });
  };

  // Core Values Handlers
  const handleUpdateValue = (idx: number, field: string, val: any) => {
    if (!setCoreValues) return;
    const updated = [...coreValues];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[idx] as any)[parent] = { ...(updated[idx] as any)[parent], [child]: val };
    } else {
      (updated[idx] as any)[field] = val;
    }
    setCoreValues(updated);
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="bg-slate-100/90 border border-slate-200/80 rounded-lg p-1 inline-flex gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('branches')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'branches'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Hệ Thống Chi Nhánh ({branches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('hours')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'hours'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Thời Gian Làm Việc
          </button>
          {setCoreValues && (
            <button
              type="button"
              onClick={() => setActiveSubTab('values')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'values'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Giá Trị Cốt Lõi ({coreValues.length})
            </button>
          )}
        </div>

        {/* Language selector tabs */}
        <AdminI18nTabs activeLang={activeLang} onChange={setActiveLang} />
      </div>

      {/* 1. Branches List */}
      {activeSubTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Danh Sách Trụ Sở & Chi Nhánh Toàn Quốc</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hiển thị trên chân trang (Footer), trang Liên Hệ và biên nhận đặt dịch vụ
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddBranch}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Chi Nhánh
            </button>
          </div>

          <div className="space-y-3">
            {branches.map((b, idx) => (
              <div
                key={b.id || idx}
                className={`border rounded-xl p-4 bg-white shadow-xs space-y-3 relative transition-all ${
                  b.isMain ? 'border-blue-400 bg-blue-50/20 ring-1 ring-blue-300' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-slate-100 text-slate-600">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </span>
                    <input
                      type="text"
                      value={b.name?.[activeLang] || ''}
                      onChange={(e) => handleUpdateBranch(idx, `name.${activeLang}`, e.target.value)}
                      placeholder="Tên chi nhánh..."
                      className="font-bold text-slate-800 text-sm border-b border-transparent focus:border-blue-500 focus:outline-hidden bg-transparent min-w-[240px]"
                    />
                    {b.isMain && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Trụ sở chính
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!b.isMain && (
                      <button
                        type="button"
                        onClick={() => handleSetMainBranch(idx)}
                        className="text-xs text-slate-500 hover:text-blue-600 border border-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        Đặt làm Trụ sở chính
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveBranch(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Xóa chi nhánh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Địa Chỉ Chi Tiết ({activeLang.toUpperCase()})</label>
                    <input
                      type="text"
                      value={b.address?.[activeLang] || ''}
                      onChange={(e) => handleUpdateBranch(idx, `address.${activeLang}`, e.target.value)}
                      placeholder="Số nhà, đường, phường, quận, tỉnh/thành..."
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-medium">Điện Thoại / Hotline</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={b.phone || ''}
                          onChange={(e) => handleUpdateBranch(idx, 'phone', e.target.value)}
                          placeholder="1800 646 888"
                          className="w-full border border-slate-200 rounded-lg p-2 pl-8 text-slate-800 font-mono focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-medium">Email Liên Hệ</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={b.email || ''}
                          onChange={(e) => handleUpdateBranch(idx, 'email', e.target.value)}
                          placeholder="hcm@travel.com"
                          className="w-full border border-slate-200 rounded-lg p-2 pl-8 text-slate-800 font-mono focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Working Hours */}
      {activeSubTab === 'hours' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Thời Gian & Khung Giờ Làm Việc</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thời gian mở cửa đón khách trực tiếp và quy định thời gian trực tổng đài
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 block mb-1 font-semibold">
                  Ngày Trong Tuần (Thứ Hai - Thứ Sáu) - [{activeLang.toUpperCase()}]
                </label>
                <input
                  type="text"
                  value={workingHours?.weekdays?.[activeLang] || ''}
                  onChange={(e) => handleUpdateHours('weekdays', activeLang, e.target.value)}
                  placeholder="Thứ Hai - Thứ Sáu: 08:00 - 21:00"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1 font-semibold">
                  Cuối Tuần (Thứ Bảy - Chủ Nhật) - [{activeLang.toUpperCase()}]
                </label>
                <input
                  type="text"
                  value={workingHours?.weekend?.[activeLang] || ''}
                  onChange={(e) => handleUpdateHours('weekend', activeLang, e.target.value)}
                  placeholder="Thứ Bảy - Chủ Nhật: 08:30 - 18:00"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1 font-semibold">
                  Ghi Chú Tổng Đài Khẩn Cấp - [{activeLang.toUpperCase()}]
                </label>
                <input
                  type="text"
                  value={workingHours?.hotlineNote?.[activeLang] || ''}
                  onChange={(e) => handleUpdateHours('hotlineNote', activeLang, e.target.value)}
                  placeholder="Tổng đài hỗ trợ 24/7 kể cả ngày Lễ & Tết"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Core Values */}
      {activeSubTab === 'values' && setCoreValues && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Giá Trị Cốt Lõi & Sứ Mệnh Doanh Nghiệp</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hiển thị trên trang Về Chúng Tôi (About Us) và giới thiệu hồ sơ năng lực
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coreValues.map((val, idx) => (
              <div key={val.id || idx} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={val.title?.[activeLang] || ''}
                    onChange={(e) => handleUpdateValue(idx, `title.${activeLang}`, e.target.value)}
                    placeholder="Tiêu đề giá trị..."
                    className="font-bold text-slate-800 text-sm border-b border-transparent focus:border-blue-500 focus:outline-hidden bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-400">{val.icon}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Tên Icon (Lucide)</label>
                    <input
                      type="text"
                      value={val.icon || ''}
                      onChange={(e) => handleUpdateValue(idx, 'icon', e.target.value)}
                      placeholder="Target / ShieldCheck / Compass"
                      className="w-full border border-slate-200 rounded-lg p-1.5 font-mono text-slate-700 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-medium">Nội Dung Chi Tiết ({activeLang.toUpperCase()})</label>
                    <textarea
                      rows={3}
                      value={val.desc?.[activeLang] || ''}
                      onChange={(e) => handleUpdateValue(idx, `desc.${activeLang}`, e.target.value)}
                      placeholder="Mô tả tầm nhìn, sứ mệnh..."
                      className="w-full border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:border-blue-500 focus:outline-hidden text-xs"
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
