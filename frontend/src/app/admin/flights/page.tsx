'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { Plane, Plus, Search, Edit3, Trash2, X, Loader2, FileSpreadsheet } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { AdminPagination } from '@/components/admin/common/AdminPagination';
import { exportToCsv } from '@/lib/exportCsv';

interface Flight {
  _id: string;
  airline: string;
  logo: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  isAvailable: boolean;
}

const fetchFlights = async () => {
  const res: any = await api.get('/flights?all=true');
  return Array.isArray(res) ? res : (res?.data || []);
};

export default function AdminFlightsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  const [formData, setFormData] = useState({
    airline: 'Vietnam Airlines',
    logo: 'VN',
    flightNumber: '',
    from: 'SGN',
    to: 'HAN',
    departureTime: '08:00',
    arrivalTime: '10:15',
    duration: '2h 15m',
    price: 1250000,
    availableSeats: 100,
    isAvailable: true,
  });

  const { data: flights = [], isLoading } = useQuery({
    queryKey: ['admin-flights'],
    queryFn: fetchFlights,
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/flights', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flights'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => alert('Lỗi: ' + (err.response?.data?.message || err.message)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/flights/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flights'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => alert('Lỗi: ' + (err.response?.data?.message || err.message)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/flights/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-flights'] }),
    onError: (err: any) => alert('Lỗi: ' + (err.response?.data?.message || err.message)),
  });

  const resetForm = () => {
    setEditingFlight(null);
    setFormData({
      airline: 'Vietnam Airlines',
      logo: 'VN',
      flightNumber: '',
      from: 'SGN',
      to: 'HAN',
      departureTime: '08:00',
      arrivalTime: '10:15',
      duration: '2h 15m',
      price: 1250000,
      availableSeats: 100,
      isAvailable: true,
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: Flight) => {
    setEditingFlight(f);
    setFormData({
      airline: f.airline,
      logo: f.logo || 'VN',
      flightNumber: f.flightNumber,
      from: f.from,
      to: f.to,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      duration: f.duration || '2h 15m',
      price: f.price,
      availableSeats: f.availableSeats || 100,
      isAvailable: f.isAvailable !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFlight) {
      updateMutation.mutate({ id: editingFlight._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredFlights = useMemo(() => {
    const s = search.toLowerCase().trim();
    return flights.filter(
      (f: Flight) =>
        !s ||
        f.flightNumber?.toLowerCase().includes(s) ||
        f.airline?.toLowerCase().includes(s) ||
        f.from?.toLowerCase().includes(s) ||
        f.to?.toLowerCase().includes(s)
    );
  }, [flights, search]);

  const totalPages = Math.ceil(filteredFlights.length / pageSize) || 1;
  const paginatedFlights = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFlights.slice(start, start + pageSize);
  }, [filteredFlights, currentPage, pageSize]);

  const handleExportCsv = () => {
    if (filteredFlights.length === 0) {
      alert('Không có dữ liệu chuyến bay để xuất!');
      return;
    }
    exportToCsv('danh_sach_ve_may_bay', filteredFlights, [
      { key: 'flightNumber', label: 'Số Hiệu' },
      { key: 'airline', label: 'Hãng Bay' },
      { key: 'from', label: 'Điểm Đi' },
      { key: 'to', label: 'Điểm Đến' },
      { key: 'departureTime', label: 'Giờ Cất Cánh' },
      { key: 'arrivalTime', label: 'Giờ Hạ Cánh' },
      { key: 'duration', label: 'Thời Gian Bay' },
      { key: 'price', label: 'Giá Vé (VNĐ)' },
      { key: 'availableSeats', label: 'Ghế Còn Trống' },
      { key: 'isAvailable', label: 'Khả Dụng', formatter: (f) => f.isAvailable ? 'Có' : 'Không' },
    ]);
  };

  if (isLoading) return <AdminTableSkeleton cols={8} rows={7} />;

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Vé Máy Bay</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách các chuyến bay nội địa và quốc tế có sẵn trên hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-lg flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất CSV
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Chuyến Bay Mới
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo số hiệu, hãng, điểm đi/đến..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Tìm thấy {filteredFlights.length} chuyến bay</span>
      </div>

      {/* Flights Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Hãng & Số Hiệu</th>
                <th className="px-6 py-3.5">Hành Trình</th>
                <th className="px-6 py-3.5">Giờ Bay</th>
                <th className="px-6 py-3.5">Thời Gian</th>
                <th className="px-6 py-3.5">Giá Vé</th>
                <th className="px-6 py-3.5">Chỗ Trống</th>
                <th className="px-6 py-3.5">Trạng Thái</th>
                <th className="px-6 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedFlights.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    <Plane className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Không tìm thấy chuyến bay nào.
                  </td>
                </tr>
              ) : (
                paginatedFlights.map((f: Flight) => (
                  <tr key={f._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-[10px] border border-blue-100 shrink-0">
                          {f.logo || 'VN'}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{f.flightNumber}</p>
                          <p className="text-[10px] text-slate-400">{f.airline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-slate-800">{f.from}</span>
                      <span className="text-slate-400 mx-1.5">→</span>
                      <span className="font-bold text-slate-800">{f.to}</span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600">
                      {f.departureTime} - {f.arrivalTime}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{f.duration}</td>
                    <td className="px-6 py-3.5 font-extrabold text-blue-600 font-mono">
                      {formatPrice(f.price)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {f.availableSeats} chỗ
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {f.isAvailable ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Khả dụng
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200">
                          Hết vé
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(f)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirm('Xóa chuyến bay này?') && deleteMutation.mutate(f._id)}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredFlights.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-600" />
                {editingFlight ? 'Cập Nhật Chuyến Bay' : 'Thêm Chuyến Bay Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hãng Hàng Không *</label>
                  <select
                    value={formData.airline}
                    onChange={(e) => {
                      const val = e.target.value;
                      let logo = 'VN';
                      if (val.includes('Vietjet')) logo = 'VJ';
                      if (val.includes('Bamboo')) logo = 'QH';
                      if (val.includes('Vietravel')) logo = 'VU';
                      setFormData({ ...formData, airline: val, logo });
                    }}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Vietnam Airlines">Vietnam Airlines</option>
                    <option value="Vietjet Air">Vietjet Air</option>
                    <option value="Bamboo Airways">Bamboo Airways</option>
                    <option value="Vietravel Airlines">Vietravel Airlines</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Hiệu Chuyến Bay *</label>
                  <input
                    required
                    value={formData.flightNumber}
                    onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
                    placeholder="VD: VN 212"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Điểm Đi (IATA) *</label>
                  <input
                    required
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value.toUpperCase() })}
                    placeholder="VD: SGN, HAN, DAD..."
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Điểm Đến (IATA) *</label>
                  <input
                    required
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value.toUpperCase() })}
                    placeholder="VD: HAN, PQC, CXR..."
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ Khởi Hành *</label>
                  <input
                    type="time"
                    required
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ Đến *</label>
                  <input
                    type="time"
                    required
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời Gian Bay</label>
                  <input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="VD: 2h 15m"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giá Vé (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Ghế Còn Lại *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.availableSeats}
                    onChange={(e) => setFormData({ ...formData, availableSeats: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300"
                />
                <label htmlFor="isAvailable" className="text-xs font-semibold text-slate-700">
                  Chuyến bay đang mở bán vé
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {editingFlight ? 'Cập Nhật' : 'Lưu Chuyến Bay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
