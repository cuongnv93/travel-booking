'use client';

import { useState } from 'react';
import { Plus, X, Search, Upload, Loader2, Building2, Star, MapPin, Trash2, BedDouble } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, getI18nText } from '@/lib/utils';

const fetchAdminHotels = async () => {
  const res: any = await api.get('/hotels');
  return Array.isArray(res) ? res : (res?.data || []);
};

const AMENITY_OPTIONS = ['WiFi miễn phí', 'Hồ bơi', 'Buffet sáng', 'Spa & Massage', 'Phòng gym', 'Bar', 'Nhà hàng', 'Bãi biển riêng', 'Đưa đón sân bay', 'Kids club', 'Yoga', 'Tắm ngâm thảo mộc', 'Lò sưởi', 'Hồ bơi trong nhà', 'Lễ tân 24h'];

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
  
  // New State fields
  const [policiesStr, setPoliciesStr] = useState('');
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [nearbyPlaces, setNearbyPlaces] = useState<{name: string, distance: string}[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

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

  const addRoom = () => {
    setRooms([...rooms, {
      name: 'Phòng mới',
      description: '',
      price: 1000000,
      size: 30,
      bedType: '1 Giường đôi',
      capacity: { adults: 2, children: 1 },
      amenities: [],
      images: []
    }]);
  };

  const removeRoom = (idx: number) => {
    setRooms(rooms.filter((_, i) => i !== idx));
  };

  const updateRoom = (idx: number, field: string, value: any) => {
    const newRooms = [...rooms];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newRooms[idx][parent] = { ...newRooms[idx][parent], [child]: value };
    } else {
      newRooms[idx][field] = value;
    }
    setRooms(newRooms);
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
    setPoliciesStr(''); setLat(''); setLng(''); setNearbyPlaces([]); setRooms([]);
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
    setPoliciesStr(Array.isArray(hotel.policies) ? hotel.policies.join('\n') : '');
    setLat(hotel.locationDetails?.lat || '');
    setLng(hotel.locationDetails?.lng || '');
    setNearbyPlaces(hotel.locationDetails?.nearbyPlaces ? [...hotel.locationDetails.nearbyPlaces] : []);
    setRooms(Array.isArray(hotel.rooms) ? [...hotel.rooms] : []);
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
      policies: policiesStr.split('\n').map(p => p.trim()).filter(p => p !== ''),
      locationDetails: {
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        nearbyPlaces
      },
      rooms,
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
          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 shrink-0 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-5 h-5" /> {editingHotel ? 'Chỉnh Sửa Khách Sạn' : 'Thêm Khách Sạn Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>

            <div className="overflow-y-auto p-6 flex-1 bg-white">
              <form id="hotel-form" onSubmit={handleSave} className="space-y-8 text-sm">
                
                {/* Thông tin cơ bản */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 border-b pb-2">Thông tin cơ bản</h3>
                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Giá/đêm cơ bản (VNĐ) *</label>
                      <input type="number" required min={0} value={pricePerNight} onChange={e => setPricePerNight(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Hạng sao *</label>
                      <select value={stars} onChange={e => setStars(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white">
                        {[1,2,3,4,5].map(s => <option key={s} value={s}>{s} Sao</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Địa điểm / Thành phố *</label>
                      <input required value={location} onChange={e => setLocation(e.target.value)} placeholder="VD: Đà Nẵng"
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8">
                      <label className="font-semibold text-slate-700 block mb-1">Địa chỉ đầy đủ</label>
                      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="VD: 168 Võ Nguyên Giáp, Mỹ Khê, Đà Nẵng"
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">Vĩ độ (Lat)</label>
                      <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value ? Number(e.target.value) : '')} placeholder="VD: 21.0362"
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">Kinh độ (Lng)</label>
                      <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value ? Number(e.target.value) : '')} placeholder="VD: 105.8156"
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  {/* Nearby Places */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-semibold text-slate-700 block">Các địa điểm lân cận nổi tiếng</label>
                      <button type="button" onClick={() => setNearbyPlaces([...nearbyPlaces, { name: '', distance: '' }])}
                        className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
                        <Plus className="w-3 h-3" /> Thêm địa điểm
                      </button>
                    </div>
                    {nearbyPlaces.length === 0 ? (
                      <div className="text-xs text-slate-400 italic">Chưa có địa điểm lân cận.</div>
                    ) : (
                      <div className="space-y-2">
                        {nearbyPlaces.map((place, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <input value={place.name} onChange={e => { const newPlaces = [...nearbyPlaces]; newPlaces[idx].name = e.target.value; setNearbyPlaces(newPlaces); }}
                              placeholder="Tên địa điểm (VD: Hồ Gươm)" className="flex-1 border border-slate-200 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500" />
                            <input value={place.distance} onChange={e => { const newPlaces = [...nearbyPlaces]; newPlaces[idx].distance = e.target.value; setNearbyPlaces(newPlaces); }}
                              placeholder="Khoảng cách (VD: 1.5 km)" className="w-32 border border-slate-200 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500" />
                            <button type="button" onClick={() => setNearbyPlaces(nearbyPlaces.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">Tiện nghi khách sạn</label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITY_OPTIONS.map(item => (
                        <button type="button" key={item} onClick={() => toggleAmenity(item)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                            amenities.includes(item) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                          }`}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hình ảnh */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 border-b pb-2">Hình ảnh ({images.length} ảnh)</h3>
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 transition-colors bg-slate-50/50">
                    <label className="cursor-pointer flex flex-col items-center py-4">
                      {isUploading ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="font-medium">Đang tải lên...</span>
                        </div>
                      ) : (
                        <><Upload className="w-8 h-8 text-blue-400 mb-2" /><span className="font-medium text-slate-600">Tải nhiều ảnh từ máy tính</span></>
                      )}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (urlInput.trim()) { setImages(prev => [...prev, urlInput.trim()]); setUrlInput(''); }}}}
                      placeholder="Dán URL ảnh..." className="flex-1 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-blue-500" />
                    <button type="button" onClick={() => { if (urlInput.trim()) { setImages(prev => [...prev, urlInput.trim()]); setUrlInput(''); }}}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold shrink-0">Thêm URL</button>
                  </div>
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-6 gap-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chính sách */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 border-b pb-2">Quy định & Chính sách</h3>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mỗi dòng một chính sách</label>
                    <textarea rows={4} value={policiesStr} onChange={e => setPoliciesStr(e.target.value)} placeholder="Nhận phòng: Từ 14:00&#10;Trả phòng: Trước 12:00&#10;Không hút thuốc..."
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                {/* Danh sách phòng */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-slate-800">Cấu hình các loại phòng ({rooms.length})</h3>
                    <button type="button" onClick={addRoom} className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg">
                      <Plus className="w-4 h-4" /> Thêm phòng
                    </button>
                  </div>
                  
                  {rooms.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 border border-dashed rounded-xl bg-slate-50">Chưa có phòng nào được cấu hình.</div>
                  ) : (
                    <div className="space-y-4">
                      {rooms.map((room, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative group">
                          <button type="button" onClick={() => removeRoom(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-white rounded-md p-1 shadow-sm border border-slate-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-12 gap-4 mb-3 pr-10">
                            <div className="col-span-4">
                              <label className="font-semibold text-slate-700 block mb-1 text-xs">Tên phòng *</label>
                              <input required value={room.name} onChange={e => updateRoom(idx, 'name', e.target.value)}
                                className="w-full border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                            </div>
                            <div className="col-span-3">
                              <label className="font-semibold text-slate-700 block mb-1 text-xs">Giá/đêm (VNĐ) *</label>
                              <input type="number" required value={room.price} onChange={e => updateRoom(idx, 'price', Number(e.target.value))}
                                className="w-full border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                            </div>
                            <div className="col-span-2">
                              <label className="font-semibold text-slate-700 block mb-1 text-xs">Diện tích (m²) *</label>
                              <input type="number" required value={room.size} onChange={e => updateRoom(idx, 'size', Number(e.target.value))}
                                className="w-full border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                            </div>
                            <div className="col-span-3">
                              <label className="font-semibold text-slate-700 block mb-1 text-xs">Loại giường *</label>
                              <input required value={room.bedType} onChange={e => updateRoom(idx, 'bedType', e.target.value)} placeholder="1 Giường đôi"
                                className="w-full border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                            </div>
                          </div>
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-8">
                              <label className="font-semibold text-slate-700 block mb-1 text-xs">Mô tả phòng</label>
                              <input value={room.description} onChange={e => updateRoom(idx, 'description', e.target.value)}
                                className="w-full border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                            </div>
                            <div className="col-span-2">
                              <label className="font-semibold text-slate-700 block mb-1 text-xs">Người lớn tối đa</label>
                              <input type="number" required value={room.capacity?.adults} onChange={e => updateRoom(idx, 'capacity.adults', Number(e.target.value))}
                                className="w-full border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                            </div>
                            <div className="col-span-2">
                              <label className="font-semibold text-slate-700 block mb-1 text-xs">Trẻ em tối đa</label>
                              <input type="number" required value={room.capacity?.children} onChange={e => updateRoom(idx, 'capacity.children', Number(e.target.value))}
                                className="w-full border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </form>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 shrink-0 bg-slate-50">
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors">Hủy</button>
              <button type="submit" form="hotel-form" disabled={saveMutation.isPending || isUploading}
                className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md disabled:opacity-50 transition-colors">
                {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Khách Sạn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
