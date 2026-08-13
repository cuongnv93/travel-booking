'use client';

import { useState } from 'react';
import { Plus, X, Search, Upload, Loader2, Building2, Star, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, getI18nText } from '@/lib/utils';

const fetchAdminHotels = async () => {
  const res: any = await api.get('/hotels');
  return Array.isArray(res) ? res : (res?.data || []);
};

const AMENITY_OPTIONS = ['WiFi miễn phí', 'Hồ bơi', 'Buffet sáng', 'Spa & Massage', 'Phòng gym', 'Bar', 'Nhà hàng', 'Bãi biển riêng', 'Đưa đón sân bay', 'Kids club', 'Yoga', 'Tắm ngâm thảo mộc', 'Lò sưởi'];

const toSlug = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

export default function AdminHotelsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [nameVi, setNameVi] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descVi, setDescVi] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [pricePerNight, setPricePerNight] = useState(1000000);
  const [stars, setStars] = useState(4);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [flashSalePrice, setFlashSalePrice] = useState(700000);
  const [flashSaleEnd, setFlashSaleEnd] = useState('');

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: fetchAdminHotels,
    placeholderData: keepPreviousData,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        const res: any = await api.post('/upload', formData);
        if (res?.url) setImages(prev => [...prev, res.url]);
      }
    } catch (err: any) {
      alert('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const toggleAmenity = (item: string) => {
    setAmenities(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingHotel) return api.put(`/hotels/${editingHotel._id}`, payload);
      return api.post('/hotels', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => alert('Lỗi lưu khách sạn: ' + (err.response?.data?.message || err.message)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/hotels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });

  const resetForm = () => {
    setEditingHotel(null);
    setNameVi(''); setNameEn(''); setDescVi(''); setImages([]); setUrlInput('');
    setPricePerNight(1000000); setStars(4); setLocation(''); setAddress(''); setAmenities([]);
    setIsFlashSale(false); setFlashSalePrice(700000);
    setFlashSaleEnd(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  };

  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (hotel: any) => {
    setEditingHotel(hotel);
    setNameVi(hotel.name?.vi || '');
    setNameEn(hotel.name?.en || '');
    setDescVi(hotel.description?.vi || '');
    setImages(Array.isArray(hotel.images) ? [...hotel.images] : []);
    setUrlInput('');
    setPricePerNight(hotel.pricePerNight || 1000000);
    setStars(hotel.stars || 4);
    setLocation(hotel.location || '');
    setAddress(hotel.address || '');
    setAmenities(Array.isArray(hotel.amenities) ? [...hotel.amenities] : []);
    setIsFlashSale(hotel.isFlashSale || false);
    setFlashSalePrice(hotel.flashSalePrice || Math.round((hotel.pricePerNight || 1000000) * 0.7));
    setFlashSaleEnd(hotel.flashSaleEnd ? new Date(hotel.flashSaleEnd).toISOString().slice(0, 16) : '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = editingHotel?.slug || toSlug(nameVi || 'khach-san-' + Date.now());
    saveMutation.mutate({
      slug,
      name: {
        vi: nameVi,
        en: nameEn || nameVi,
        zh: nameEn || nameVi,
        ko: nameEn || nameVi,
        ja: nameEn || nameVi,
      },
      description: {
        vi: descVi,
        en: descVi,
        zh: descVi,
        ko: descVi,
        ja: descVi,
      },
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
      pricePerNight: Number(pricePerNight),
      stars: Number(stars),
      location,
      address,
      amenities,
      isFlashSale,
      flashSalePrice: Number(flashSalePrice),
      flashSaleEnd: flashSaleEnd ? new Date(flashSaleEnd) : null,
    });
  };

  const filtered = hotels.filter((h: any) => {
    const name = h.name?.vi || '';
    return name.toLowerCase().includes(search.toLowerCase()) || (h.location || '').toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) return <AdminTableSkeleton cols={5} rows={7} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Khách Sạn & Resort</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách chỗ nghỉ trên hệ thống</p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Thêm Khách Sạn
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input type="text" placeholder="Tìm khách sạn theo tên hoặc địa điểm..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Khách sạn</th>
                <th className="px-6 py-3.5">Địa điểm</th>
                <th className="px-6 py-3.5">Hạng sao</th>
                <th className="px-6 py-3.5">Giá/đêm</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-6 text-center text-slate-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />Chưa có khách sạn nào.
                </td></tr>
              ) : filtered.map((hotel: any) => (
                <tr key={hotel._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 flex items-center gap-3">
                    <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                      {hotel.images?.[0] ? (
                        <img src={hotel.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : <Building2 className="w-4 h-4 text-slate-400 m-auto mt-3" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 line-clamp-1 max-w-xs">{hotel.name?.vi || 'N/A'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{hotel.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      <MapPin className="w-3 h-3" />{hotel.location}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />{hotel.stars} Sao
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{formatPrice(hotel.pricePerNight)}<span className="text-[11px] font-normal text-slate-400">/đêm</span></td>
                  <td className="px-6 py-3.5 text-right space-x-1.5">
                    <button onClick={() => openEditModal(hotel)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors text-xs">Sửa</button>
                    <button onClick={() => { if (confirm('Xóa khách sạn này?')) deleteMutation.mutate(hotel._id); }}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md transition-colors text-xs">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">{editingHotel ? 'Chỉnh Sửa Khách Sạn' : 'Thêm Khách Sạn Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên (Tiếng Việt) *</label>
                  <input required value={nameVi} onChange={e => setNameVi(e.target.value)} placeholder="VD: Resort Đà Nẵng 5 Sao"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên (Tiếng Anh)</label>
                  <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="EN: Da Nang 5-Star Resort"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô tả</label>
                <textarea rows={3} value={descVi} onChange={e => setDescVi(e.target.value)} placeholder="Mô tả khách sạn..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giá/đêm (VNĐ) *</label>
                  <input type="number" required min={0} value={pricePerNight} onChange={e => setPricePerNight(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                </div>

                {/* Flash Sale Controls */}
                <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 space-y-3 col-span-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                      🔥 Cấu Hình Flash Sale Giờ Vàng
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFlashSale}
                        onChange={(e) => setIsFlashSale(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  {isFlashSale && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1 text-xs">Giá Flash Sale (VNĐ/Đêm) *</label>
                        <input
                          type="number"
                          value={flashSalePrice}
                          onChange={(e) => setFlashSalePrice(Number(e.target.value))}
                          className="w-full border border-rose-300 rounded-lg p-2 text-rose-600 font-extrabold focus:outline-none focus:border-rose-500 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1 text-xs">Thời Gian Kết Thúc Sale *</label>
                        <input
                          type="datetime-local"
                          value={flashSaleEnd}
                          onChange={(e) => setFlashSaleEnd(e.target.value)}
                          className="w-full border border-rose-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-rose-500 bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hạng sao *</label>
                  <select value={stars} onChange={e => setStars(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white">
                    {[1,2,3,4,5].map(s => <option key={s} value={s}>{s} Sao</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Địa điểm *</label>
                  <input required value={location} onChange={e => setLocation(e.target.value)} placeholder="VD: Đà Nẵng"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Địa chỉ đầy đủ</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="VD: 168 Võ Nguyên Giáp, Mỹ Khê, Đà Nẵng"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
              </div>

              {/* Amenities multi-select */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Tiện nghi ({amenities.length} đã chọn)</label>
                <div className="flex flex-wrap gap-1.5">
                  {AMENITY_OPTIONS.map(item => (
                    <button type="button" key={item} onClick={() => toggleAmenity(item)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                        amenities.includes(item) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                      }`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-image upload */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Hình ảnh ({images.length} ảnh)</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 transition-colors bg-slate-50/50">
                  <label className="cursor-pointer flex flex-col items-center py-2">
                    {isUploading ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-xs">Đang tải lên...</span>
                      </div>
                    ) : (
                      <><Upload className="w-5 h-5 text-blue-400 mb-1" /><span className="text-xs font-medium text-slate-600">Tải nhiều ảnh từ máy tính</span></>
                    )}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <div className="mt-2 flex gap-2">
                  <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (urlInput.trim()) { setImages(prev => [...prev, urlInput.trim()]); setUrlInput(''); }}}}
                    placeholder="Dán URL ảnh..." className="flex-1 border border-slate-200 rounded-lg p-2 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500" />
                  <button type="button" onClick={() => { if (urlInput.trim()) { setImages(prev => [...prev, urlInput.trim()]); setUrlInput(''); }}}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-semibold text-xs shrink-0">Thêm URL</button>
                </div>
                {images.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group h-16 rounded-lg overflow-hidden border border-slate-200">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-xs">Hủy</button>
                <button type="submit" disabled={saveMutation.isPending || isUploading}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm disabled:opacity-50 text-xs">
                  {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Khách Sạn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
