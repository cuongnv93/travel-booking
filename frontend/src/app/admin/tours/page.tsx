'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Star, X, Search, Image as ImageIcon, Upload, Loader2, Check, Calendar, MapPin, Sparkles, Compass } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';

const fetchAdminTours = async () => {
  const res: any = await api.get('/tours?limit=100');
  return res?.data || [];
};

export default function ToursAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);

  // Form State
  const [titleVi, setTitleVi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionVi, setDescriptionVi] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [price, setPrice] = useState(1500000);
  const [originalPrice, setOriginalPrice] = useState(2000000);
  const [duration, setDuration] = useState(3);
  const [destination, setDestination] = useState('Đà Nẵng');
  const [category, setCategory] = useState('beach');
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [flashSalePrice, setFlashSalePrice] = useState(990000);
  const [flashSaleEnd, setFlashSaleEnd] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic Lists State
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState('');

  const [itinerary, setItinerary] = useState<{ title: string; description: string }[]>([]);
  const [departureDates, setDepartureDates] = useState<{ date: string; price: number; availableSlots: number }[]>([]);

  // React Query fetch
  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['admin-tours'],
    queryFn: fetchAdminTours,
    placeholderData: keepPreviousData,
  });

  // Handle File Upload directly to backend Express Multer endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);

        const res: any = await api.post('/upload', formData);
        if (res?.url) {
          setImages((prev) => [...prev, res.url]);
        }
      }
    } catch (err: any) {
      alert('Lỗi tải ảnh lên: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Highlights handlers
  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return;
    setHighlights((prev) => [...prev, highlightInput.trim()]);
    setHighlightInput('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
  };

  // Itinerary handlers
  const handleAddItineraryDay = () => {
    setItinerary((prev) => [
      ...prev,
      { title: `Ngày ${prev.length + 1}: Thăm quan & Trải nghiệm`, description: 'Chi tiết các điểm tham quan...' }
    ]);
  };

  const handleUpdateItineraryDay = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const handleRemoveItineraryDay = (index: number) => {
    setItinerary((prev) => prev.filter((_, i) => i !== index));
  };

  // Departure dates handlers
  const handleAddDepartureDate = () => {
    const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    setDepartureDates((prev) => [
      ...prev,
      { date: defaultDate, price: Number(price), availableSlots: 15 }
    ]);
  };

  const handleUpdateDepartureDate = (index: number, field: string, value: any) => {
    const updated = [...departureDates];
    updated[index] = { ...updated[index], [field]: value };
    setDepartureDates(updated);
  };

  const handleRemoveDepartureDate = (index: number) => {
    setDepartureDates((prev) => prev.filter((_, i) => i !== index));
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingTour) {
        return api.put(`/tours/${editingTour._id || editingTour.id}`, payload);
      } else {
        return api.post('/tours', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['featured-tours'] });
      queryClient.invalidateQueries({ queryKey: ['featured-tours-related'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      alert('Lỗi lưu tour: ' + (err.response?.data?.message || err.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tours/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['featured-tours'] });
    },
    onError: (err: any) => {
      alert('Lỗi xóa tour: ' + err.message);
    }
  });

  const openCreateModal = () => {
    setEditingTour(null);
    setTitleVi('');
    setTitleEn('');
    setDescriptionVi('');
    setDescriptionEn('');
    setPrice(2000000);
    setOriginalPrice(2500000);
    setDuration(3);
    setDestination('Đà Nẵng');
    setCategory('beach');
    setImages([]);
    setUrlInput('');
    setIsFeatured(false);
    setIsFlashSale(false);
    setFlashSalePrice(1200000);
    setFlashSaleEnd(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    setHighlights(['Dịch vụ khách sạn 4-5 sao', 'Hướng dẫn viên nhiệt tình', 'Vé vào cổng các điểm tham quan']);
    setItinerary([
      { title: 'Ngày 1: Đón đoàn & Nhận phòng', description: 'Đón sân bay, ăn trưa và nhận phòng khách sạn. Chiều tự do tắm biển.' },
      { title: 'Ngày 2: Tham quan danh thắng', description: 'Cả ngày tham quan các điểm du lịch nổi tiếng.' },
    ]);
    setDepartureDates([
      { date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0], price: 2000000, availableSlots: 15 }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (tour: any) => {
    setEditingTour(tour);
    setTitleVi(tour.title?.vi || (typeof tour.title === 'string' ? tour.title : ''));
    setTitleEn(tour.title?.en || '');
    setDescriptionVi(tour.description?.vi || (typeof tour.description === 'string' ? tour.description : ''));
    setDescriptionEn(tour.description?.en || '');
    setPrice(tour.price || 0);
    setOriginalPrice(tour.originalPrice || 0);
    setDuration(tour.duration || 1);
    setDestination(tour.destination || '');
    setCategory(tour.category || 'city-tour');
    setImages(Array.isArray(tour.images) ? [...tour.images] : (tour.images ? [tour.images] : []));
    setUrlInput('');
    setIsFeatured(tour.isFeatured || false);
    setIsFlashSale(tour.isFlashSale || false);
    setFlashSalePrice(tour.flashSalePrice || Math.round((tour.price || 1000000) * 0.7));
    setFlashSaleEnd(tour.flashSaleEnd ? new Date(tour.flashSaleEnd).toISOString().slice(0, 16) : '');

    // Populate highlights
    if (Array.isArray(tour.highlights) && tour.highlights.length > 0) {
      setHighlights(tour.highlights.map((h: any) => typeof h === 'string' ? h : (h?.vi || '')));
    } else {
      setHighlights([]);
    }

    // Populate itinerary
    if (Array.isArray(tour.itinerary) && tour.itinerary.length > 0) {
      setItinerary(tour.itinerary.map((day: any) => ({
        title: typeof day.title === 'string' ? day.title : (day.title?.vi || ''),
        description: typeof day.description === 'string' ? day.description : (day.description?.vi || '')
      })));
    } else {
      setItinerary([]);
    }

    // Populate departure dates
    if (Array.isArray(tour.departureDates) && tour.departureDates.length > 0) {
      setDepartureDates(tour.departureDates.map((dep: any) => {
        let dateStr = '';
        try {
          dateStr = new Date(dep.date).toISOString().split('T')[0];
        } catch { dateStr = ''; }
        return {
          date: dateStr,
          price: dep.price || tour.price,
          availableSlots: dep.availableSlots || 15
        };
      }));
    } else {
      setDepartureDates([]);
    }

    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = (titleVi || 'tour-' + Date.now())
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const finalImages = images.length > 0 
      ? images 
      : ['https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800'];

    const formattedHighlights = highlights.map(h => ({ vi: h, en: h }));
    const formattedItinerary = itinerary.map(day => ({
      title: { vi: day.title, en: day.title },
      description: { vi: day.description, en: day.description }
    }));
    const formattedDepartureDates = departureDates
      .filter(dep => dep.date)
      .map(dep => ({
        date: new Date(dep.date),
        price: Number(dep.price),
        availableSlots: Number(dep.availableSlots)
      }));

    const payload = {
      slug: editingTour ? editingTour.slug : slug,
      title: {
        vi: titleVi,
        en: titleEn || titleVi,
        zh: titleEn || titleVi,
        ko: titleEn || titleVi,
        ja: titleEn || titleVi,
      },
      description: {
        vi: descriptionVi,
        en: descriptionEn || descriptionVi,
        zh: descriptionEn || descriptionVi,
        ko: descriptionEn || descriptionVi,
        ja: descriptionEn || descriptionVi,
      },
      price: Number(price),
      originalPrice: Number(originalPrice),
      duration: Number(duration),
      destination,
      category,
      images: finalImages,
      isFeatured,
      isFlashSale,
      flashSalePrice: Number(flashSalePrice),
      flashSaleEnd: flashSaleEnd ? new Date(flashSaleEnd) : null,
      maxGuests: 20,
      highlights: formattedHighlights,
      itinerary: formattedItinerary,
      departureDates: formattedDepartureDates
    };

    saveMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tour này?')) return;
    deleteMutation.mutate(id);
  };

  const filteredTours = tours.filter((t: any) => {
    const titleText = typeof t.title === 'string' ? t.title : (t.title?.vi || '');
    return titleText.toLowerCase().includes(search.toLowerCase()) || (t.destination || '').toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) return <AdminTableSkeleton cols={6} rows={7} />;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Tours Du Lịch</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách tour, điểm nhấn, lịch trình chi tiết và lịch khởi hành</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo Tour Mới
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên tour hoặc điểm đến..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Tours Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Tour</th>
                <th className="px-6 py-3.5">Điểm đến</th>
                <th className="px-6 py-3.5">Thời gian</th>
                <th className="px-6 py-3.5">Giá bán</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-400">Đang tải danh sách tours...</td>
                </tr>
              ) : filteredTours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-400">Chưa có tour nào được tìm thấy.</td>
                </tr>
              ) : (
                filteredTours.map((tour: any) => {
                  const title = typeof tour.title === 'string' ? tour.title : (tour.title?.vi || 'N/A');
                  const id = tour._id || tour.id;

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                          {tour.images?.[0] ? (
                            <img src={tour.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-1">{title}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{tour.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                          {tour.destination}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-medium">{tour.duration} ngày</td>
                      <td className="px-6 py-3.5">
                        <p className="font-bold text-slate-900">{formatPrice(tour.price)}</p>
                        {tour.originalPrice && (
                          <p className="text-[11px] text-slate-400 line-through">{formatPrice(tour.originalPrice)}</p>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {tour.isFeatured ? (
                          <span className="bg-amber-50 text-amber-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Nổi bật
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Thường</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(tour)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors text-xs"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md transition-colors text-xs"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Tour Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl p-6 space-y-6 shadow-2xl max-h-[92vh] overflow-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingTour ? 'Chỉnh Sửa Tour Du Lịch' : 'Tạo Tour Du Lịch Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 text-xs">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">1. Thông Tin Cơ Bản</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tên Tour (Tiếng Việt) *</label>
                    <input
                      type="text"
                      required
                      value={titleVi}
                      onChange={(e) => setTitleVi(e.target.value)}
                      placeholder="VD: Hồ Gươm & Phố Cổ Hà Nội..."
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tên Tour (Tiếng Anh)</label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="VD: Hanoi Old Quarter Tour..."
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mô tả Tour *</label>
                  <textarea
                    rows={3}
                    required
                    value={descriptionVi}
                    onChange={(e) => setDescriptionVi(e.target.value)}
                    placeholder="Mô tả chi tiết về trải nghiệm tour..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Giá bán (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Giá gốc niêm yết</label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số ngày *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Flash Sale Controls */}
                <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 space-y-3">
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
                        <label className="font-semibold text-slate-700 block mb-1 text-xs">Giá Flash Sale (VNĐ) *</label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Điểm đến *</label>
                    <input
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="VD: Hà Nội, Đà Nẵng, Phú Quốc..."
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Danh mục *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="city-tour">City Tour</option>
                      <option value="beach">Du lịch Biển</option>
                      <option value="nature">Thiên nhiên</option>
                      <option value="culture">Văn hóa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Photos Management */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">2. Hình Ảnh Tour ({images.length} ảnh)</h3>
                
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-4 transition-colors bg-slate-50/50 flex flex-col items-center justify-center text-center">
                  <label className="cursor-pointer w-full flex flex-col items-center py-2">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 text-blue-600">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-medium">Đang tải ảnh lên...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-800">Tải ảnh từ máy tính (Có thể chọn nhiều ảnh)</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ JPG, PNG, WEBP</p>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                      </>
                    )}
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrlImage(); } }}
                    placeholder="Dán URL hình ảnh (http...)"
                    className="flex-1 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-semibold text-xs transition-colors shrink-0"
                  >
                    Thêm URL
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group w-full h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Highlights Management */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" /> 3. Điểm Nhấn Chương Trình ({highlights.length})
                  </h3>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHighlight(); } }}
                    placeholder="VD: Cầu Thê Húc & Đền Ngọc Sơn..."
                    className="flex-1 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-2 rounded-lg transition-colors shrink-0"
                  >
                    + Thêm
                  </button>
                </div>

                <div className="space-y-1.5">
                  {highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="font-medium text-slate-800">✓ {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary Management */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal-600" /> 4. Lịch Trình Chi Tiết ({itinerary.length} ngày)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold px-3 py-1 rounded-lg text-xs"
                  >
                    + Thêm Ngày
                  </button>
                </div>

                <div className="space-y-3">
                  {itinerary.map((day, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700 text-xs">Ngày #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItineraryDay(idx)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Xóa ngày này
                        </button>
                      </div>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => handleUpdateItineraryDay(idx, 'title', e.target.value)}
                        placeholder="Tiêu đề ngày..."
                        className="w-full border border-slate-200 rounded-lg p-2 font-bold text-slate-900 bg-white"
                      />
                      <textarea
                        rows={2}
                        value={day.description}
                        onChange={(e) => handleUpdateItineraryDay(idx, 'description', e.target.value)}
                        placeholder="Mô tả chi tiết chặng..."
                        className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-white resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Departure Dates Management */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" /> 5. Các Đợt Khởi Hành ({departureDates.length} đợt)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddDepartureDate}
                    className="bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold px-3 py-1 rounded-lg text-xs"
                  >
                    + Thêm Ngày Khởi Hành
                  </button>
                </div>

                <div className="space-y-2">
                  {departureDates.map((dep, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-400 block font-semibold">Ngày khởi hành</label>
                        <input
                          type="date"
                          value={dep.date}
                          onChange={(e) => handleUpdateDepartureDate(idx, 'date', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 font-bold bg-white"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-400 block font-semibold">Giá tour (VNĐ)</label>
                        <input
                          type="number"
                          value={dep.price}
                          onChange={(e) => handleUpdateDepartureDate(idx, 'price', Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 font-bold bg-white"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-400 block font-semibold">Số chỗ còn</label>
                        <input
                          type="number"
                          value={dep.availableSlots}
                          onChange={(e) => handleUpdateDepartureDate(idx, 'availableSlots', Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 font-bold bg-white"
                        />
                      </div>
                      <div className="col-span-1 text-right pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveDepartureDate(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Is Featured Checkbox */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300"
                />
                <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-800">
                  Đánh dấu Tour Nổi Bật (Hiển thị trang chủ & mục tour gợi ý)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending || isUploading}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Tất Cả Thông Tin Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}