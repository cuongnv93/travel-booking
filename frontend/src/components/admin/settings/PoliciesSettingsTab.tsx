'use client';

import { memo, useState } from 'react';
import { Plus, Trash2, ShieldAlert, Building2, FileText, CheckCircle2, XCircle, Info, Scale } from 'lucide-react';

export interface TourDefaultPolicies {
  inclusions: string[];
  exclusions: string[];
  importantNotes: string[];
}

export interface BusinessLicenseConfig {
  taxCode: string;
  issuedBy: string;
  internationalLicense: string;
  hotlineComplaints: string;
}

interface Props {
  tourPolicies: TourDefaultPolicies;
  setTourPolicies: (val: TourDefaultPolicies) => void;
  hotelAmenities: string[];
  setHotelAmenities: (items: string[]) => void;
  businessLicense?: BusinessLicenseConfig;
  setBusinessLicense?: (val: BusinessLicenseConfig) => void;
}

export const PoliciesSettingsTab = memo(function PoliciesSettingsTab({
  tourPolicies,
  setTourPolicies,
  hotelAmenities,
  setHotelAmenities,
  businessLicense,
  setBusinessLicense,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'tourPolicies' | 'amenities' | 'license'>('tourPolicies');
  const [newAmenityInput, setNewAmenityInput] = useState('');

  // Tour Policy Helpers
  const handleAddItem = (type: 'inclusions' | 'exclusions' | 'importantNotes') => {
    setTourPolicies({
      ...tourPolicies,
      [type]: [...(tourPolicies[type] || []), ''],
    });
  };

  const handleUpdateItem = (type: 'inclusions' | 'exclusions' | 'importantNotes', idx: number, val: string) => {
    const updated = [...(tourPolicies[type] || [])];
    updated[idx] = val;
    setTourPolicies({
      ...tourPolicies,
      [type]: updated,
    });
  };

  const handleRemoveItem = (type: 'inclusions' | 'exclusions' | 'importantNotes', idx: number) => {
    const updated = (tourPolicies[type] || []).filter((_, i) => i !== idx);
    setTourPolicies({
      ...tourPolicies,
      [type]: updated,
    });
  };

  // Hotel Amenities Helpers
  const handleAddAmenity = () => {
    const trimmed = newAmenityInput.trim();
    if (!trimmed || hotelAmenities.includes(trimmed)) return;
    setHotelAmenities([...hotelAmenities, trimmed]);
    setNewAmenityInput('');
  };

  const handleRemoveAmenity = (idx: number) => {
    setHotelAmenities(hotelAmenities.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="bg-slate-100/90 border border-slate-200/80 rounded-lg p-1 inline-flex gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('tourPolicies')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'tourPolicies'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Điều Khoản Tour Mặc Định
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('amenities')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'amenities'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Tiện Ích Khách Sạn Chuẩn ({hotelAmenities.length})
          </button>
          {setBusinessLicense && (
            <button
              type="button"
              onClick={() => setActiveSubTab('license')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'license'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> Giấy Phép & Pháp Lý
            </button>
          )}
        </div>
      </div>

      {/* 1. Tour Default Policies */}
      {activeSubTab === 'tourPolicies' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Quy Định & Điều Khoản Áp Dụng Mặc Định Cho Tours</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tự động áp dụng cho các tour du lịch mới tạo hoặc khi tour không có quy định riêng biệt
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inclusions */}
            <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/20 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-900 text-xs">Giá Tour Bao Gồm (Inclusions)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddItem('inclusions')}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Thêm Dòng
                </button>
              </div>

              <div className="space-y-2">
                {(tourPolicies?.inclusions || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleUpdateItem('inclusions', idx, e.target.value)}
                      placeholder="Mục bao gồm..."
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:border-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('inclusions', idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/20 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-rose-900 text-xs">Giá Tour Không Bao Gồm (Exclusions)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddItem('exclusions')}
                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Thêm Dòng
                </button>
              </div>

              <div className="space-y-2">
                {(tourPolicies?.exclusions || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleUpdateItem('exclusions', idx, e.target.value)}
                      placeholder="Mục không bao gồm..."
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:border-rose-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('exclusions', idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/20 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-amber-900 text-xs">Lưu Ý Quan Trọng Khi Khởi Hành (Important Notes)</span>
              </div>
              <button
                type="button"
                onClick={() => handleAddItem('importantNotes')}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Thêm Dòng
              </button>
            </div>

            <div className="space-y-2">
              {(tourPolicies?.importantNotes || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateItem('importantNotes', idx, e.target.value)}
                    placeholder="Lưu ý về giấy tờ tùy thân, thời gian tập trung..."
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('importantNotes', idx)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Hotel Amenities Master */}
      {activeSubTab === 'amenities' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Danh Mục Tiện Nghi Khách Sạn & Resort Chuẩn</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các tiện ích hiển thị trong bộ lọc tìm kiếm khách sạn và danh mục chọn nhanh khi tạo/sửa khách sạn
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAmenityInput}
                onChange={(e) => setNewAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
                placeholder="Nhập tiện ích mới (vd: Bãi đỗ xe riêng, Trông trẻ...)"
                className="flex-1 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Tiện Ích
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {hotelAmenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200/80 px-3 py-1.5 rounded-lg text-xs font-medium group hover:bg-blue-100 transition-colors"
                >
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(idx)}
                    className="text-blue-400 hover:text-red-600 p-0.5 rounded transition-colors cursor-pointer"
                    title="Xóa tiện ích"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Business License */}
      {activeSubTab === 'license' && setBusinessLicense && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Thông Tin Giấy Phép & Đăng Ký Pháp Lý</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hiển thị tính pháp lý, mã số thuế và số giấy phép lữ hành quốc tế ở chân trang website
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Mã Số Doanh Nghiệp (Mã Số Thuế)</label>
                <input
                  type="text"
                  value={businessLicense?.taxCode || ''}
                  onChange={(e) =>
                    setBusinessLicense({
                      ...(businessLicense || {
                        taxCode: '',
                        issuedBy: '',
                        internationalLicense: '',
                        hotlineComplaints: '',
                      }),
                      taxCode: e.target.value,
                    })
                  }
                  placeholder="0102030405"
                  className="w-full border border-slate-200 rounded-lg p-2.5 font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Cơ Quan Cấp Phép & Ngày Cấp</label>
                <input
                  type="text"
                  value={businessLicense?.issuedBy || ''}
                  onChange={(e) =>
                    setBusinessLicense({
                      ...(businessLicense || {
                        taxCode: '',
                        issuedBy: '',
                        internationalLicense: '',
                        hotlineComplaints: '',
                      }),
                      issuedBy: e.target.value,
                    })
                  }
                  placeholder="Sở Kế Hoạch & Đầu Tư TP.HCM cấp ngày 15/08/2012"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Giấy Phép Kinh Doanh Lữ Hành Quốc Tế</label>
                <input
                  type="text"
                  value={businessLicense?.internationalLicense || ''}
                  onChange={(e) =>
                    setBusinessLicense({
                      ...(businessLicense || {
                        taxCode: '',
                        issuedBy: '',
                        internationalLicense: '',
                        hotlineComplaints: '',
                      }),
                      internationalLicense: e.target.value,
                    })
                  }
                  placeholder="GP Lữ Hành Quốc Tế: 79-0123/2026/TCDL-GP LHQT"
                  className="w-full border border-slate-200 rounded-lg p-2.5 font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Hotline Tiếp Nhận Phản Ánh Chất Lượng</label>
                <input
                  type="text"
                  value={businessLicense?.hotlineComplaints || ''}
                  onChange={(e) =>
                    setBusinessLicense({
                      ...(businessLicense || {
                        taxCode: '',
                        issuedBy: '',
                        internationalLicense: '',
                        hotlineComplaints: '',
                      }),
                      hotlineComplaints: e.target.value,
                    })
                  }
                  placeholder="1900 6868 (Phản ánh chất lượng dịch vụ)"
                  className="w-full border border-slate-200 rounded-lg p-2.5 font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
