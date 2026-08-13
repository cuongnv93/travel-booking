'use client';

import { useState } from 'react';
import { Tag, Search, Trash2, Edit, Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils';

const fetchCoupons = async () => {
  const res: any = await api.get('/coupons');
  return res || [];
};

export default function CouponsAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountAmount: 0,
    validUntil: '',
    usageLimit: 0,
    isActive: true
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: fetchCoupons,
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/coupons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowModal(false);
      setFormData({ code: '', discountAmount: 0, validUntil: '', usageLimit: 0, isActive: true });
    },
    onError: (err: any) => {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => api.put(`/coupons/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err: any) => {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err: any) => {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  });

  const toggleStatus = (c: any) => {
    toggleStatusMutation.mutate({ id: c._id, isActive: !c.isActive });
  };

  const deleteCoupon = (c: any) => {
    if (!confirm(`Xóa mã giảm giá ${c.code}? Hành động này không thể hoàn tác.`)) return;
    deleteMutation.mutate(c._id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredCoupons = coupons.filter((c: any) => {
    return (c.code || '').toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) return <AdminTableSkeleton cols={7} rows={5} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mã Giảm Giá (Coupons)</h1>
          <p className="text-xs text-slate-500 mt-1">Quản lý các mã khuyến mãi hệ thống</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Thêm Mã
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Mã (Code)</th>
                <th className="px-6 py-3.5">Mức giảm</th>
                <th className="px-6 py-3.5">Đã Dùng / Giới Hạn</th>
                <th className="px-6 py-3.5">Hạn Dùng</th>
                <th className="px-6 py-3.5">Trạng Thái</th>
                <th className="px-6 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-400">Chưa có mã giảm giá nào.</td>
                </tr>
              ) : (
                filteredCoupons.map((c: any) => {
                  const isExpired = new Date(c.validUntil) < new Date();
                  const isExhausted = c.usageLimit > 0 && c.currentUses >= c.usageLimit;
                  const isValid = c.isActive && !isExpired && !isExhausted;

                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        <span className="font-extrabold text-slate-900 uppercase">{c.code}</span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-emerald-600">{formatPrice(c.discountAmount)}</td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {c.currentUses} / {c.usageLimit === 0 ? 'Vô hạn' : c.usageLimit}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {new Date(c.validUntil).toLocaleDateString('vi-VN')}
                        {isExpired && <span className="ml-2 text-[10px] text-red-500 font-bold">(Hết hạn)</span>}
                      </td>
                      <td className="px-6 py-3.5">
                        {isValid ? (
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-200">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200">
                            Ngừng / Không khả dụng
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => toggleStatus(c)}
                          className={`px-2.5 py-1.5 font-semibold rounded-md transition-colors text-[10px] ${
                            c.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === c._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            c.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'
                          )}
                        </button>
                        <button
                          onClick={() => deleteCoupon(c)}
                          disabled={deleteMutation.isPending && deleteMutation.variables === c._id}
                          className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md transition-colors"
                        >
                           {deleteMutation.isPending && deleteMutation.variables === c._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Tạo Mã Giảm Giá Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã Code (Tự viết hoa)</label>
                <input 
                  required 
                  type="text" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mức giảm (VNĐ)</label>
                <input 
                  required 
                  type="number" 
                  min="0"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({...formData, discountAmount: Number(e.target.value)})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngày hết hạn</label>
                <input 
                  required 
                  type="date" 
                  value={formData.validUntil}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giới hạn số lần dùng (0 = Vô hạn)</label>
                <input 
                  required 
                  type="number" 
                  min="0"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <label className="text-xs font-bold text-slate-700">Kích hoạt ngay</label>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Tạo Mã
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
