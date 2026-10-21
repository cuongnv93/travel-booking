'use client';

import { useState, useMemo } from 'react';
import { Plus, X, Search, Upload, Loader2, Utensils } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, getI18nText } from '@/lib/utils';
import { AdminI18nTabs, ADMIN_SUPPORTED_LANGUAGES, createEmptyI18nRecord, toI18nRecord, sanitizeI18nRecord } from '@/components/admin/common/AdminI18nTabs';

import { VIETNAM_PROVINCES } from '@/lib/provinces';
import { useVietnamProvinces } from '@/hooks/useVietnamProvinces';

const fetchSpecialties = async () => {
  const res: any = await api.get('/specialties');
  return Array.isArray(res) ? res : (res?.data || []);
};

const REGIONS = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];

const toSlug = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

export default function AdminSpecialtiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [activeLang, setActiveLang] = useState<string>('vi');
  const [name, setName] = useState<Record<string, string>>(createEmptyI18nRecord());
  const [description, setDescription] = useState<Record<string, string>>(createEmptyI18nRecord());
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(50000);
  const [region, setRegion] = useState('Miền Bắc');
  const [location, setLocation] = useState('Hà Nội');

  const { data: specialties = [], isLoading } = useQuery({
    queryKey: ['admin-specialties'],
    queryFn: fetchSpecialties,
    placeholderData: keepPreviousData,
  });

  const { data: provinces = VIETNAM_PROVINCES } = useVietnamProvinces();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setIsUploading(true);
      const res: any = await api.post('/upload', formData);
      if (res?.url) setImage(res.url);
    } catch (err: any) {
      alert('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingItem) return api.put(`/specialties/${editingItem._id}`, payload);
      return api.post('/specialties', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-specialties'] });
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => alert('Lỗi lưu: ' + (err.response?.data?.message || err.message)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/specialties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-specialties'] });
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
    },
    onError: (err: any) => alert('Lỗi xóa đặc sản: ' + (err.response?.data?.message || err.message)),
  });

  const handleCopyFromVi = () => {
    if (activeLang === 'vi') return;
    setName((prev) => ({ ...prev, [activeLang]: prev[activeLang] || prev.vi || '' }));
    setDescription((prev) => ({ ...prev, [activeLang]: prev[activeLang] || prev.vi || '' }));
  };

  const resetForm = () => {
    setEditingItem(null);
    setActiveLang('vi');
    setName(createEmptyI18nRecord());
    setDescription(createEmptyI18nRecord());
    setImage(''); setPrice(50000); setRegion('Miền Bắc'); setLocation('Hà Nội');
  };

  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setActiveLang('vi');
    setName(toI18nRecord(item.name));
    setDescription(toI18nRecord(item.description));
    setImage(item.image || '');
    setPrice(item.price || 50000);
    setRegion(item.region || 'Miền Bắc');
    setLocation(item.location || 'Hà Nội');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = editingItem?.slug || toSlug(name.vi || 'dac-san-' + Date.now());
    saveMutation.mutate({
      slug,
      name: sanitizeI18nRecord(name),
      description: sanitizeI18nRecord(description),
      image: image || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
      price: Number(price),
      region,
      location,
    });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return specialties.filter((s: any) => {
      const name = getI18nText(s.name, 'vi') || (typeof s.name === 'string' ? s.name : '');
      return (
        !q ||
        name.toLowerCase().includes(q) ||
        (s.region || '').toLowerCase().includes(q) ||
        (s.location || '').toLowerCase().includes(q)
      );
    });
  }, [specialties, search]);

  if (isLoading) return <AdminTableSkeleton cols={5} rows={7} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Đặc Sản Địa Phương</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách món ăn đặc sản 3 miền Việt Nam</p>
        </div>
        <button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Thêm Đặc Sản
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input type="text" placeholder="Tìm kiếm đặc sản theo tên, miền, tỉnh thành..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 bg-white p-12 rounded-xl border border-slate-200 text-center">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Chưa có đặc sản nào.</p>
          </div>
        ) : filtered.map((item: any) => {
          const itemName = getI18nText(item.name, 'vi') || (typeof item.name === 'string' ? item.name : 'Đặc sản');
          const itemDesc = getI18nText(item.description, 'vi') || (typeof item.description === 'string' ? item.description : '');
          return (
            <div key={item._id} className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="h-36 bg-slate-100 relative overflow-hidden">
                <img src={item.image || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400'}
                  alt={itemName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.region}</span>
                {item.location && (
                  <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">📍 {item.location}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{itemName}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{itemDesc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-600">{formatPrice(item.price)}</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEditModal(item)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs transition-colors">Sửa</button>
                    <button onClick={() => { if (confirm('Xóa đặc sản này?')) deleteMutation.mutate(item._id); }}
                      className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md text-xs transition-colors">Xóa</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">{editingItem ? 'Chỉnh Sửa Đặc Sản' : 'Thêm Đặc Sản Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-slate-800">Thông tin đặc sản & Đa ngôn ngữ</h3>
                </div>

                <AdminI18nTabs
                  activeLang={activeLang}
                  onChange={setActiveLang}
                  onCopyFromVi={handleCopyFromVi}
                  hasContent={{
                    vi: !!name.vi,
                    en: !!name.en,
                    zh: !!name.zh,
                    ko: !!name.ko,
                    ja: !!name.ja,
                  }}
                  label="Chọn ngôn ngữ nhập liệu cho Tên & Mô tả Đặc sản:"
                />

                {activeLang !== 'vi' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center justify-between">
                    <span>
                      Đang chỉnh sửa bản dịch <strong>{ADMIN_SUPPORTED_LANGUAGES.find(l => l.code === activeLang)?.label}</strong>. Nếu để trống, hệ thống sẽ tự động hiển thị bản dịch Tiếng Anh hoặc Tiếng Việt.
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyFromVi}
                      className="ml-3 shrink-0 px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-blue-700 font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Sao chép từ TV
                    </button>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 text-xs">
                    Tên Đặc Sản ({activeLang.toUpperCase()}) {activeLang === 'vi' && '*'}
                  </label>
                  <input
                    required={activeLang === 'vi'}
                    value={name[activeLang] || ''}
                    onChange={(e) => setName((prev) => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder={activeLang === 'vi' ? 'VD: Phở Hà Nội' : `Tên đặc sản bằng tiếng ${activeLang.toUpperCase()}...`}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 text-xs">
                    Mô tả Đặc Sản ({activeLang.toUpperCase()})
                  </label>
                  <textarea
                    rows={3}
                    value={description[activeLang] || ''}
                    onChange={(e) => setDescription((prev) => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder="Mô tả ngắn gọn về đặc sản..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giá tham khảo (VNĐ)</label>
                  <input type="number" min={0} value={price} onChange={e => setPrice(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vùng miền *</label>
                  <select value={region} onChange={e => setRegion(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white">
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tỉnh / Thành phố *</label>
                <select value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white">
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Image upload */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Hình ảnh</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl transition-colors">
                  {image ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden group">
                      <img src={image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                          Thay ảnh <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <button type="button" onClick={() => setImage('')}
                          className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-md">Xóa</button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-4">
                      {isUploading ? <Loader2 className="w-6 h-6 text-blue-500 animate-spin" /> : (
                        <><Upload className="w-5 h-5 text-blue-400 mb-1" /><span className="text-xs font-medium text-slate-600">Tải ảnh lên</span></>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
                <input type="text" value={image} onChange={e => setImage(e.target.value)}
                  placeholder="Hoặc dán URL ảnh..."
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2 text-[11px] text-slate-600 focus:outline-none focus:border-blue-500" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-xs">Hủy</button>
                <button type="submit" disabled={saveMutation.isPending || isUploading}
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-sm disabled:opacity-50 text-xs">
                  {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Đặc Sản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
