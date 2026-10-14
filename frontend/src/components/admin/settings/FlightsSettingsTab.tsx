'use client';

import { memo, useState } from 'react';
import { Plus, Trash2, Plane, Building2 } from 'lucide-react';

export interface AirportItem {
  code: string;
  name: string;
  city: { vi: string; en: string; zh?: string; ko?: string; ja?: string };
  country: string;
  order: number;
  isDomestic: boolean;
}

export interface AirlineItem {
  code: string;
  name: string;
  isPartner: boolean;
  partnerBadge: string;
  logoText: string;
  badgeColor: string;
}

interface Props {
  airports: AirportItem[];
  setAirports: (items: AirportItem[]) => void;
  airlines: AirlineItem[];
  setAirlines: (items: AirlineItem[]) => void;
}

export const FlightsSettingsTab = memo(function FlightsSettingsTab({
  airports,
  setAirports,
  airlines,
  setAirlines,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'airports' | 'airlines'>('airports');

  // Airport Handlers
  const handleAddAirport = () => {
    setAirports([
      ...airports,
      {
        code: 'NEW',
        name: 'Sân bay mới',
        city: { vi: 'Thành phố mới', en: 'New City' },
        country: 'Vietnam',
        order: airports.length + 1,
        isDomestic: true,
      },
    ]);
  };

  const handleUpdateAirport = (idx: number, field: string, val: any) => {
    const updated = [...airports];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[idx] as any)[parent] = { ...(updated[idx] as any)[parent], [child]: val };
    } else {
      (updated[idx] as any)[field] = val;
    }
    setAirports(updated);
  };

  const handleRemoveAirport = (idx: number) => {
    setAirports(airports.filter((_, i) => i !== idx));
  };

  // Airline Handlers
  const handleAddAirline = () => {
    setAirlines([
      ...airlines,
      {
        code: 'NEW',
        name: 'Hãng bay mới',
        isPartner: false,
        partnerBadge: 'Hãng hàng không',
        logoText: 'NEW',
        badgeColor: 'bg-blue-600 text-white',
      },
    ]);
  };

  const handleUpdateAirline = (idx: number, field: string, val: any) => {
    const updated = [...airlines];
    (updated[idx] as any)[field] = val;
    setAirlines(updated);
  };

  const handleRemoveAirline = (idx: number) => {
    setAirlines(airlines.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Segmented Sub Tabs */}
      <div className="bg-slate-100/90 border border-slate-200/80 rounded-lg p-1 inline-flex gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('airports')}
          className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'airports' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <Plane className="w-3.5 h-3.5" /> Danh Mục Sân Bay ({airports.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('airlines')}
          className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'airlines' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Hãng Hàng Không ({airlines.length})
        </button>
      </div>

      {/* 1. Sân Bay */}
      {activeSubTab === 'airports' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Danh Mục Sân Bay & Điểm Đi / Điểm Đến</h3>
              <p className="text-xs text-slate-500">Mã IATA, tên sân bay và tên thành phố đa ngôn ngữ dùng cho bộ tìm kiếm vé bay</p>
            </div>
            <button
              type="button"
              onClick={handleAddAirport}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Thêm Sân Bay
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Mã IATA</th>
                    <th className="p-3">Tên Sân Bay</th>
                    <th className="p-3">Thành Phố (VI)</th>
                    <th className="p-3">Thành Phố (EN)</th>
                    <th className="p-3">Loại</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {airports.map((ap, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-3">
                        <input
                          value={ap.code}
                          onChange={(e) => handleUpdateAirport(idx, 'code', e.target.value.toUpperCase())}
                          className="w-20 font-mono font-bold text-blue-600 border border-slate-200 rounded p-1.5 focus:border-blue-500 uppercase"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          value={ap.name}
                          onChange={(e) => handleUpdateAirport(idx, 'name', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 text-slate-800 focus:border-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          value={ap.city?.vi || ''}
                          onChange={(e) => handleUpdateAirport(idx, 'city.vi', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 text-slate-800 focus:border-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          value={ap.city?.en || ''}
                          onChange={(e) => handleUpdateAirport(idx, 'city.en', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 text-slate-600 focus:border-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ap.isDomestic !== false}
                            onChange={(e) => handleUpdateAirport(idx, 'isDomestic', e.target.checked)}
                            className="rounded text-blue-600"
                          />
                          <span>{ap.isDomestic ? 'Nội địa' : 'Quốc tế'}</span>
                        </label>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveAirport(idx)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Hãng Hàng Không */}
      {activeSubTab === 'airlines' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Danh Mục Hãng Hàng Không Đối Tác</h3>
              <p className="text-xs text-slate-500">Mã hãng, huy hiệu ưu đãi và nhãn hiển thị trên vé bay</p>
            </div>
            <button
              type="button"
              onClick={handleAddAirline}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Thêm Hãng Bay
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {airlines.map((al, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                      {al.code}
                    </span>
                    <span className="font-bold text-xs text-slate-800">{al.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAirline(idx)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Mã hãng (Code) *</label>
                    <input
                      value={al.code}
                      onChange={(e) => handleUpdateAirline(idx, 'code', e.target.value.toUpperCase())}
                      placeholder="VD: VU"
                      className="w-full border border-slate-200 rounded-lg p-2 font-bold text-blue-600 focus:outline-none focus:border-blue-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Tên hãng *</label>
                    <input
                      value={al.name}
                      onChange={(e) => handleUpdateAirline(idx, 'name', e.target.value)}
                      placeholder="VD: Vietravel Airlines"
                      className="w-full border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Nhãn hiển thị</label>
                    <input
                      value={al.partnerBadge || ''}
                      onChange={(e) => handleUpdateAirline(idx, 'partnerBadge', e.target.value)}
                      placeholder="VD: Đối tác chiến lược"
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={al.isPartner}
                        onChange={(e) => handleUpdateAirline(idx, 'isPartner', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Đánh dấu Đối Tác Chiến Lược</span>
                    </label>
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
