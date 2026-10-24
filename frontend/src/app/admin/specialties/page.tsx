'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, X, Search, Upload, Loader2, Utensils, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, getI18nText, toSlug } from '@/lib/utils';
import { AdminI18nTabs, createEmptyI18nRecord, toI18nRecord, sanitizeI18nRecord } from '@/components/admin/common/AdminI18nTabs';
import { AdminPagination } from '@/components/admin/common/AdminPagination';
import { exportToCsv } from '@/lib/exportCsv';
import { VIETNAM_PROVINCES } from '@/lib/provinces';
import { useVietnamProvinces } from '@/hooks/useVietnamProvinces';
import { toast } from '@/stores/toastStore';

const fetchSpecialties = async () => {
  const res: any = await api.get('/specialties');
  return Array.isArray(res) ? res : (res?.data || []);
};

const REGIONS = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];

export default function AdminSpecialtiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

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
      toast.error('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message));
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
      toast.success(editingItem ? 'Cập nhật đặc sản thành công!' : 'Thêm đặc sản mới thành công!');
    },
    onError: (err: any) => toast.error('Lỗi lưu: ' + (err.response?.data?.message || err.message)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/specialties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-specialties'] });
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      toast.success('Đã xóa đặc sản thành công!');
    },
    onError: (err: any) => toast.error('Lỗi xóa đặc sản: ' + (err.response?.data?.message || err.message)),
  });

  const handleCopyFromVi = useCallback(() => {
    if (activeLang === 'vi') return;
    setName((prev) => ({ ...prev, [activeLang]: prev[activeLang] || prev.vi || '' }));
    setDescription((prev) => ({ ...prev, [activeLang]: prev[activeLang] || prev.vi || '' }));
  }, [activeLang]);

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

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return specialties.filter((s: any) => {
      const nameText = getI18nText(s.name, 'vi') || (typeof s.name === 'string' ? s.name : '');
      const searchMatch = !q ||
        nameText.toLowerCase().includes(q) ||
        (s.region || '').toLowerCase().includes(q) ||
        (s.location || '').toLowerCase().includes(q);

      const regionMatch = !regionFilter || s.region === regionFilter;
      return searchMatch && regionMatch;
    });
  }, [specialties, search, regionFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.warning('Không có dữ liệu để xuất!');
      return;
    }
    exportToCsv('danh_sach_dac_san', filtered, [
      { key: 'name', label: 'Tên Đặc Sản', formatter: (s) => getI18nText(s.name, 'vi') || 'N/A' },
      { key: 'region', label: 'Miền' },
      { key: 'location', label: 'Tỉnh / Thành Phố' },
      { key: 'price', label: 'Giá Tham Khảo (VNĐ)' },
      { key: 'slug', label: 'Slug' },
    ]);
  };

  if (isLoading) return <AdminTableSkeleton cols={5} rows={7} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Đặc Sản Địa Phương</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách món ăn đặc sản 3 miền Việt Nam</p>
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
            onClick={openCreateModal}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Đặc Sản
          </button>
        </div>
      </div>

      {/* Quick Region Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-2">
        <button
          type="button"
          onClick={() => {
            setRegionFilter('');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            regionFilter === ''
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Tất Cả Miền
        </button>

        {REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRegionFilter(r);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              regionFilter === r
                ? 'bg-orange-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-orange-50 border border-slate-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm đặc sản theo tên, miền, tỉnh thành..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedItems.length === 0 ? (
          <div className="col-span-3 bg-white p-12 rounded-xl border border-slate-200 text-center">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Chưa có đặc sản nào phù hợp.</p>
          </div>
        ) : (
          paginatedItems.map((item: any) => {
            const itemName = getI18nText(item.name, 'vi') || (typeof item.name === 'string' ? item.name : 'Đặc sản');
            const itemDesc = getI18nText(item.description, 'vi') || (typeof item.description === 'string' ? item.description : '');
            return (
              <div key={item._id} className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                <div>
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400'}
                      alt={itemName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {item.region}
                    </span>
                    {item.location && (
                      <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        📍 {item.location}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{itemName}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{itemDesc}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-600 font-mono">{formatPrice(item.price)}</span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href="/vi/specialties"
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-flex items-center cursor-pointer"
                      title="Xem trang đặc sản trên website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs transition-colors cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Xóa đặc sản này khỏi hệ thống?')) deleteMutation.mutate(item._id);
                      }}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md text-xs transition-colors cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[6, 9, 18, 36]}
      />

      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">{editingItem ? 'Chỉnh Sửa Đặc Sản' : 'Thêm Đặc Sản Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
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
                  label="Chọn ngôn ngữ nhập liệu cho Tên & Mô tả:"
                />

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 text-xs">
                    Tên đặc sản ({activeLang.toUpperCase()}) {activeLang === 'vi' && '*'}
                  </label>
                  <input
                    required={activeLang === 'vi'}
                    value={name[activeLang] || ''}
                    onChange={(e) => setName((prev) => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder={activeLang === 'vi' ? 'VD: Bún Chả Hà Nội' : `Tên đặc sản bằng tiếng ${activeLang.toUpperCase()}...`}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 text-xs">
                    Mô tả ({activeLang.toUpperCase()})
                  </label>
                  <textarea
                    rows={3}
                    value={description[activeLang] || ''}
                    onChange={(e) => setDescription((prev) => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder="Mô tả hương vị, nguyên liệu, nguồn gốc..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Miền *</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tỉnh / Thành phố *</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    {provinces.map((p: any) => (
                      <option key={p.code || p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Giá tham khảo (VNĐ) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hình ảnh đặc sản *</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 transition-colors bg-slate-50/50">
                  {image ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-slate-100">
                          Thay ảnh <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-700 cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-3">
                      {isUploading ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-xs">Đang tải lên...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-blue-500 mb-1" />
                          <span className="text-xs font-semibold text-slate-700">Tải ảnh từ máy tính</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </>
                      )}
                    </label>
                  )}
                </div>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Hoặc dán URL ảnh..."
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending || isUploading}
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-sm disabled:opacity-50 text-xs cursor-pointer"
                >
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
