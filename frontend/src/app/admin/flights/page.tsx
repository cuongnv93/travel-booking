'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { Plane, Plus, Search, Edit3, Trash2, X, Check, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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
  const res: any = await api.get('/flights');
  return Array.isArray(res) ? res : (res?.data || []);
};

export default function AdminFlightsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
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

  const filteredFlights = flights.filter(
    (f: Flight) =>
      f.flightNumber?.toLowerCase().includes(search.toLowerCase()) ||
      f.airline?.toLowerCase().includes(search.toLowerCase()) ||
      f.from?.toLowerCase().includes(search.toLowerCase()) ||
      f.to?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <AdminTableSkeleton cols={5} rows={7} />;

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Vé Máy Bay</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách các chuyến bay nội địa và quốc tế có sẵn trên hệ thống</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm Chuyến Bay Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo số hiệu, hãng, điểm đi/đến..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Tổng số: {filteredFlights.length} chuyến bay</span>
      </div>

      {/* Flights Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Hãng Bay</th>
                <th className="px-5 py-3.5">Số Hiệu</th>
                <th className="px-5 py-3.5">Tuyến Bay</th>
                <th className="px-5 py-3.5">Giờ Khởi Hành - Hạ Cánh</th>
                <th className="px-5 py-3.5">Giá Vé</th>
                <th className="px-5 py-3.5">Số Ghế</th>
                <th className="px-5 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">Đang tải danh sách chuyến bay...</td>
                </tr>
              ) : filteredFlights.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">Chưa có chuyến bay nào.</td>
                </tr>
              ) : (
                filteredFlights.map((f: Flight) => (
                  <tr key={f._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-[10px]">
                        {f.logo || 'VN'}
                      </span>
                      {f.airline}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-600">{f.flightNumber}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">{f.from}</span>
                      <span className="mx-1.5 text-slate-400">➔</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">{f.to}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <span className="font-semibold text-slate-900">{f.departureTime} - {f.arrivalTime}</span>
                      <span className="text-[11px] text-slate-400 block">{f.duration}</span>
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-orange-600">{formatPrice(f.price)}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{f.availableSeats} chỗ</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          f.isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {f.isAvailable ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(f)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirm('Xóa chuyến bay này?') && deleteMutation.mutate(f._id)}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-600" />
                {editingFlight ? 'Cập Nhật Chuyến Bay' : 'Thêm Chuyến Bay Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
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
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold"
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
                    placeholder="VD: VN-234, VJ-112"
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Điểm Đi (From Code) *</label>
                  <select
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900"
                  >
                    <option value="SGN">SGN - TP. Hồ Chí Minh</option>
                    <option value="HAN">HAN - Hà Nội</option>
                    <option value="DAD">DAD - Đà Nẵng</option>
                    <option value="CXR">CXR - Nha Trang</option>
                    <option value="PQC">PQC - Phú Quốc</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Điểm Đến (To Code) *</label>
                  <select
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900"
                  >
                    <option value="HAN">HAN - Hà Nội</option>
                    <option value="SGN">SGN - TP. Hồ Chí Minh</option>
                    <option value="DAD">DAD - Đà Nẵng</option>
                    <option value="CXR">CXR - Nha Trang</option>
                    <option value="PQC">PQC - Phú Quốc</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ Đi *</label>
                  <input
                    required
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    placeholder="08:00"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ Đến *</label>
                  <input
                    required
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    placeholder="10:15"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời Lượng</label>
                  <input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="2h 15m"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giá Vé (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Ghế Trống</label>
                  <input
                    type="number"
                    value={formData.availableSeats}
                    onChange={(e) => setFormData({ ...formData, availableSeats: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="isAvailable" className="font-semibold text-slate-700">
                  Mở bán vé cho chuyến bay này
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Lưu Chuyến Bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
