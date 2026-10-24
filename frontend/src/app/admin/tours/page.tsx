'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import {
  Plus,
  Trash2,
  Star,
  Search,
  Image as ImageIcon,
  Upload,
  Loader2,
  Calendar,
  Sparkles,
  Compass,
  FileText,
  DollarSign,
  X,
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Copy
} from 'lucide-react';
import { toast } from '@/stores/toastStore';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatPrice, toSlug } from '@/lib/utils';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { AdminI18nTabs, ADMIN_SUPPORTED_LANGUAGES, createEmptyI18nRecord, toI18nRecord, sanitizeI18nRecord } from '@/components/admin/common/AdminI18nTabs';
import { AdminStepperModal, AdminStepItem } from '@/components/admin/common/AdminStepperModal';
import { AdminPagination } from '@/components/admin/common/AdminPagination';
import { AdminMediaPickerModal } from '@/components/admin/common/AdminMediaPickerModal';
import { exportToCsv } from '@/lib/exportCsv';

const fetchAdminTours = async () => {
  const res: any = await api.get('/tours?all=true&limit=100');
  return res?.data || [];
};

interface TourTableRowProps {
  tour: any;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (tour: any) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  onDuplicate: (id: string) => void;
}

const TourTableRow = memo(function TourTableRow({
  tour,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  onDuplicate,
}: TourTableRowProps) {
  const [imgSrc, setImgSrc] = useState(tour.images?.[0] || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800');
  const title = typeof tour.title === 'string' ? tour.title : (tour.title?.vi || 'N/A');
  const id = tour._id || tour.id;
  const isActive = tour.isActive !== false;

  return (
    <tr className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
      <td className="px-4 py-3.5 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(id)}
          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
        />
      </td>
      <td className="px-5 py-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgSrc('https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800')}
            />
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
      <td className="px-5 py-3.5">
        <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">
          {tour.destination}
        </span>
      </td>
      <td className="px-5 py-3.5 font-medium">{tour.duration} ngày</td>
      <td className="px-5 py-3.5">
        <p className="font-bold text-slate-900">{formatPrice(tour.price)}</p>
        {tour.originalPrice && (
          <p className="text-[11px] text-slate-400 line-through">{formatPrice(tour.originalPrice)}</p>
        )}
      </td>
      <td className="px-5 py-3.5">
        <button
          type="button"
          onClick={() => onToggleActive(id, isActive)}
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
          }`}
          title="Bấm để bật/tắt hiển thị tour trên website"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {isActive ? 'Đang bán' : 'Tạm ẩn'}
        </button>
      </td>
      <td className="px-5 py-3.5">
        <button
          type="button"
          onClick={() => onToggleFeatured(id, !tour.isFeatured)}
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
            tour.isFeatured
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
          }`}
          title="Bấm để chuyển trạng thái Nổi bật"
        >
          <Star className={`w-3 h-3 ${tour.isFeatured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
          {tour.isFeatured ? 'Nổi bật' : 'Thường'}
        </button>
      </td>
      <td className="px-5 py-3.5 text-right space-x-1.5 shrink-0">
        <a
          href={`/vi/tours/${tour.slug}`}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-flex items-center cursor-pointer"
          title="Xem trực tiếp trên website"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button
          type="button"
          onClick={() => onDuplicate(id)}
          className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-md transition-colors text-xs cursor-pointer inline-flex items-center"
          title="Nhân bản tour (Tạo bản sao nháp)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onEdit(tour)}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors text-xs cursor-pointer"
        >
          Sửa
        </button>
        <button
          onClick={() => onDelete(id)}
          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md transition-colors text-xs cursor-pointer"
        >
          Xóa
        </button>
      </td>
    </tr>
  );
});

const TOUR_STEPS: AdminStepItem[] = [
  { id: 'basic', label: 'Thông Tin Chung & Đa Ngữ', icon: FileText },
  { id: 'pricing', label: 'Giá Bán & Flash Sale', icon: DollarSign },
  { id: 'media', label: 'Hình Ảnh & Điểm Nhấn', icon: Sparkles },
  { id: 'itinerary', label: 'Lịch Trình Chi Tiết', icon: Compass },
  { id: 'departures', label: 'Lịch Khởi Hành & Chỗ', icon: Calendar },
];

export default function ToursAdminPage() {
  const queryClient = useQueryClient();

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'duration'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Row selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<string>('basic');
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [activeLang, setActiveLang] = useState<string>('vi');
  const [title, setTitle] = useState<Record<string, string>>(createEmptyI18nRecord());
  const [description, setDescription] = useState<Record<string, string>>(createEmptyI18nRecord());
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

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

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
          markDirty();
        }
      }
    } catch (err: any) {
      toast.error('Lỗi tải ảnh lên: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
    markDirty();
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    markDirty();
  };

  // Highlights handlers
  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return;
    setHighlights((prev) => [...prev, highlightInput.trim()]);
    setHighlightInput('');
    markDirty();
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  // Itinerary handlers
  const handleAddItineraryDay = () => {
    setItinerary((prev) => [
      ...prev,
      { title: `Ngày ${prev.length + 1}: Thăm quan & Trải nghiệm`, description: 'Chi tiết các điểm tham quan...' }
    ]);
    markDirty();
  };

  const handleUpdateItineraryDay = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
    markDirty();
  };

  const handleRemoveItineraryDay = (index: number) => {
    setItinerary((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  };

  // Departure dates handlers
  const handleAddDepartureDate = () => {
    const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    setDepartureDates((prev) => [
      ...prev,
      { date: defaultDate, price: Number(price), availableSlots: 15 }
    ]);
    markDirty();
  };

  const handleUpdateDepartureDate = (index: number, field: string, value: any) => {
    const updated = [...departureDates];
    updated[index] = { ...updated[index], [field]: value };
    setDepartureDates(updated);
    markDirty();
  };

  const handleRemoveDepartureDate = (index: number) => {
    setDepartureDates((prev) => prev.filter((_, i) => i !== index));
    markDirty();
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
      queryClient.invalidateQueries({ queryKey: ['specialties-featured-tours'] });
      queryClient.invalidateQueries({ queryKey: ['flash-sale-items'] });
      setIsDirty(false);
      setIsModalOpen(false);
      toast.success(editingTour ? 'Cập nhật tour du lịch thành công!' : 'Tạo tour du lịch mới thành công!');
    },
    onError: (err: any) => {
      toast.error('Lỗi lưu tour: ' + (err.response?.data?.message || err.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tours/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['featured-tours'] });
      queryClient.invalidateQueries({ queryKey: ['featured-tours-related'] });
      queryClient.invalidateQueries({ queryKey: ['specialties-featured-tours'] });
      queryClient.invalidateQueries({ queryKey: ['flash-sale-items'] });
      toast.success('Đã xóa tour thành công!');
    },
    onError: (err: any) => {
      toast.error('Lỗi xóa tour: ' + err.message);
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return api.patch(`/tours/${id}/active`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['featured-tours'] });
      queryClient.invalidateQueries({ queryKey: ['featured-tours-related'] });
      queryClient.invalidateQueries({ queryKey: ['specialties-featured-tours'] });
      queryClient.invalidateQueries({ queryKey: ['flash-sale-items'] });
      toast.success('Đã cập nhật trạng thái hiển thị tour!');
    },
    onError: (err: any) => {
      toast.error('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      return api.patch(`/tours/${id}/featured`, { isFeatured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['featured-tours'] });
      toast.success('Đã cập nhật trạng thái nổi bật!');
    },
    onError: (err: any) => {
      toast.error('Lỗi cập nhật nổi bật: ' + (err.response?.data?.message || err.message));
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/tours/${id}/duplicate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast.success('Đã nhân bản tour thành công (bản sao ở trạng thái Tạm ẩn)!');
    },
    onError: (err: any) => {
      toast.error('Lỗi nhân bản tour: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleToggleActive = useCallback((id: string, currentActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !currentActive });
  }, [toggleActiveMutation]);

  const handleToggleFeatured = useCallback((id: string, nextFeatured: boolean) => {
    toggleFeaturedMutation.mutate({ id, isFeatured: nextFeatured });
  }, [toggleFeaturedMutation]);

  const handleDuplicate = useCallback((id: string) => {
    duplicateMutation.mutate(id);
  }, [duplicateMutation]);

  const openCreateModal = () => {
    setEditingTour(null);
    setActiveStep('basic');
    setActiveLang('vi');
    setTitle(createEmptyI18nRecord());
    setDescription(createEmptyI18nRecord());
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
    setIsDirty(false);
    setIsModalOpen(true);
  };

  const openEditModal = (tour: any) => {
    setEditingTour(tour);
    setActiveStep('basic');
    setActiveLang('vi');
    setTitle(toI18nRecord(tour.title));
    setDescription(toI18nRecord(tour.description));
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

    setIsDirty(false);
    setIsModalOpen(true);
  };

  const handleCopyFromVi = useCallback(() => {
    if (activeLang === 'vi') return;
    setTitle((prev) => ({ ...prev, [activeLang]: prev[activeLang] || prev.vi || '' }));
    setDescription((prev) => ({ ...prev, [activeLang]: prev[activeLang] || prev.vi || '' }));
    markDirty();
  }, [activeLang, markDirty]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!title.vi || !title.vi.trim()) {
      setActiveStep('basic');
      toast.warning('Vui lòng nhập Tên Tour (Tiếng Việt) tại bước Thông Tin Chung!');
      return;
    }

    if (!destination || !destination.trim()) {
      setActiveStep('basic');
      toast.warning('Vui lòng nhập Điểm đến tại bước Thông Tin Chung!');
      return;
    }

    if (price <= 0) {
      setActiveStep('pricing');
      toast.warning('Giá bán tour phải lớn hơn 0 VNĐ!');
      return;
    }

    if (isFlashSale && (!flashSalePrice || flashSalePrice >= price)) {
      setActiveStep('pricing');
      toast.warning('Giá Flash Sale phải nhỏ hơn giá bán thông thường!');
      return;
    }

    const slug = toSlug(title.vi || 'tour-' + Date.now());

    const finalImages = images.length > 0 
      ? images 
      : ['https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800'];

    const formattedHighlights = highlights
      .filter(h => h && h.trim())
      .map(h => ({
        vi: h.trim(),
        en: h.trim(),
        zh: h.trim(),
        ko: h.trim(),
        ja: h.trim(),
      }));

    const formattedItinerary = itinerary
      .filter(day => day.title && day.title.trim())
      .map(day => ({
        title: {
          vi: day.title.trim(),
          en: day.title.trim(),
          zh: day.title.trim(),
          ko: day.title.trim(),
          ja: day.title.trim(),
        },
        description: {
          vi: day.description || '',
          en: day.description || '',
          zh: day.description || '',
          ko: day.description || '',
          ja: day.description || '',
        }
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
      title: sanitizeI18nRecord(title),
      description: sanitizeI18nRecord(description),
      price: Number(price),
      originalPrice: Number(originalPrice),
      duration: Number(duration),
      destination: destination.trim(),
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

  const handleDelete = useCallback((id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tour này?')) return;
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  // Bulk actions
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Xác nhận xóa ${selectedIds.length} tour đã chọn khỏi hệ thống?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/tours/${id}`)));
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} tour thành công!`);
    } catch (err: any) {
      toast.error('Lỗi xóa hàng loạt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBulkToggleFeatured = async (featured: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => {
          const t = tours.find((tour: any) => (tour._id || tour.id) === id);
          if (!t) return Promise.resolve();
          return api.put(`/tours/${id}`, { ...t, isFeatured: featured });
        })
      );
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      queryClient.invalidateQueries({ queryKey: ['featured-tours'] });
      setSelectedIds([]);
      toast.success(`Đã cập nhật trạng thái nổi bật cho ${selectedIds.length} tour!`);
    } catch (err: any) {
      toast.error('Lỗi cập nhật hàng loạt: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filtered & Sorted Tours
  const filteredTours = useMemo(() => {
    const s = search.toLowerCase().trim();
    return tours
      .filter((t: any) => {
        const titleText = typeof t.title === 'string' ? t.title : (t.title?.vi || '');
        const searchMatch = !s || titleText.toLowerCase().includes(s) || (t.destination || '').toLowerCase().includes(s);

        let categoryMatch = true;
        if (categoryFilter === 'featured') {
          categoryMatch = !!t.isFeatured;
        } else if (categoryFilter) {
          categoryMatch = t.category === categoryFilter;
        }

        return searchMatch && categoryMatch;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'duration') return (b.duration || 0) - (a.duration || 0);
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [tours, search, categoryFilter, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredTours.length / pageSize) || 1;
  const paginatedTours = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTours.slice(start, start + pageSize);
  }, [filteredTours, currentPage, pageSize]);

  // Select all on page
  const isAllCurrentSelected = useMemo(() => {
    if (paginatedTours.length === 0) return false;
    return paginatedTours.every((t: any) => selectedIds.includes(t._id || t.id));
  }, [paginatedTours, selectedIds]);

  const handleToggleSelectAll = () => {
    if (isAllCurrentSelected) {
      const pageIds = new Set(paginatedTours.map((t: any) => t._id || t.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...paginatedTours.map((t: any) => t._id || t.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  // Export to CSV
  const handleExportCsv = (onlySelected = false) => {
    const targetData = onlySelected
      ? tours.filter((t: any) => selectedIds.includes(t._id || t.id))
      : filteredTours;

    if (targetData.length === 0) {
      toast.warning('Không có dữ liệu tour để xuất!');
      return;
    }

    exportToCsv('danh_sach_tour', targetData, [
      {
        key: 'title',
        label: 'Tên Tour',
        formatter: (t) => typeof t.title === 'string' ? t.title : (t.title?.vi || 'N/A')
      },
      { key: 'slug', label: 'Slug' },
      { key: 'destination', label: 'Điểm Đến' },
      { key: 'category', label: 'Danh Mục' },
      { key: 'duration', label: 'Thời Lượng (Ngày)' },
      { key: 'price', label: 'Giá Bán (VNĐ)' },
      { key: 'originalPrice', label: 'Giá Gốc Niêm Yết' },
      { key: 'isFeatured', label: 'Tour Nổi Bật', formatter: (t) => t.isFeatured ? 'Có' : 'Không' },
      { key: 'isFlashSale', label: 'Flash Sale', formatter: (t) => t.isFlashSale ? 'Có' : 'Không' },
      { key: 'flashSalePrice', label: 'Giá Flash Sale' },
    ]);
  };

  const stepsWithCounts = useMemo(() => {
    return TOUR_STEPS.map((step) => {
      if (step.id === 'media') return { ...step, badgeCount: images.length };
      if (step.id === 'itinerary') return { ...step, badgeCount: itinerary.length };
      if (step.id === 'departures') return { ...step, badgeCount: departureDates.length };
      return step;
    });
  }, [images.length, itinerary.length, departureDates.length]);

  if (isLoading) return <AdminTableSkeleton cols={6} rows={7} />;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Tours Du Lịch</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách tour, bộ lọc nhanh, thao tác hàng loạt và lịch trình chi tiết</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportCsv(false)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-lg flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất CSV
          </button>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo Tour Mới
          </button>
        </div>
      </div>

      {/* Quick Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-2">
        {[
          { id: '', label: 'Tất Cả' },
          { id: 'featured', label: '⭐ Nổi Bật' },
          { id: 'city-tour', label: 'City Tour' },
          { id: 'beach', label: 'Du lịch Biển' },
          { id: 'nature', label: 'Thiên nhiên' },
          { id: 'culture', label: 'Văn hóa' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setCategoryFilter(tab.id);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Sort Controls */}
      <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên tour hoặc điểm đến (Đà Nẵng, Hà Nội, Phú Quốc...)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium cursor-pointer w-full sm:w-auto"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="duration">Thời lượng dài nhất</option>
          </select>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold">tour đang được chọn</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkToggleFeatured(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Star className="w-3.5 h-3.5 fill-slate-900" /> Đặt nổi bật ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggleFeatured(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Bỏ nổi bật
            </button>
            <button
              type="button"
              onClick={() => handleExportCsv(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Xuất ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Tours Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    title="Chọn tất cả trên trang này"
                  />
                </th>
                <th className="px-5 py-3.5">Tour</th>
                <th className="px-5 py-3.5">Điểm đến</th>
                <th className="px-5 py-3.5">Thời gian</th>
                <th className="px-5 py-3.5">Giá bán</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5">Nổi bật</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedTours.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <Compass className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy tour nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedTours.map((tour: any) => {
                  const id = tour._id || tour.id;
                  return (
                    <TourTableRow
                      key={id}
                      tour={tour}
                      isSelected={selectedIds.includes(id)}
                      onToggleSelect={handleToggleSelect}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                      onToggleFeatured={handleToggleFeatured}
                      onDuplicate={handleDuplicate}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTours.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {/* Modern Stepper Modal for Create / Edit Tour */}
      <AdminStepperModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTour ? 'Chỉnh Sửa Tour Du Lịch' : 'Tạo Tour Du Lịch Mới'}
        subtitle={editingTour ? `Đang chỉnh sửa: ${editingTour.slug}` : 'Điền đầy đủ thông tin 5 bước bên dưới để xuất bản tour'}
        badge={{
          text: editingTour ? 'Chỉnh sửa' : 'Thêm mới',
          variant: editingTour ? 'amber' : 'blue',
        }}
        steps={stepsWithCounts}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        isDirty={isDirty}
        isSubmitting={saveMutation.isPending || isUploading}
        submitLabel={editingTour ? 'Cập Nhật Tour' : 'Lưu & Xuất Bản Tour'}
        onSave={handleSave}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 text-xs">
          {/* STEP 1: Basic Info & Multilingual */}
          {activeStep === 'basic' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> 1. Thông Tin Cơ Bản & Đa Ngôn Ngữ
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Nhập tiêu đề, mô tả và phân loại điểm đến của tour du lịch</p>
              </div>

              <AdminI18nTabs
                activeLang={activeLang}
                onChange={setActiveLang}
                onCopyFromVi={handleCopyFromVi}
                hasContent={{
                  vi: !!title.vi,
                  en: !!title.en,
                  zh: !!title.zh,
                  ko: !!title.ko,
                  ja: !!title.ja,
                }}
                label="Chọn ngôn ngữ nhập liệu cho Tên & Mô tả Tour:"
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
                  Tên Tour ({activeLang.toUpperCase()}) {activeLang === 'vi' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={title[activeLang] || ''}
                  onChange={(e) => {
                    setTitle((prev) => ({ ...prev, [activeLang]: e.target.value }));
                    markDirty();
                  }}
                  placeholder={activeLang === 'vi' ? 'VD: Hồ Gươm & Phố Cổ Hà Nội...' : `Tên tour bằng tiếng ${activeLang.toUpperCase()}...`}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 text-xs">
                  Mô tả Tour ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={4}
                  value={description[activeLang] || ''}
                  onChange={(e) => {
                    setDescription((prev) => ({ ...prev, [activeLang]: e.target.value }));
                    markDirty();
                  }}
                  placeholder="Mô tả chi tiết về trải nghiệm tour..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Điểm đến *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        markDirty();
                      }}
                      placeholder="VD: Hà Nội, Đà Nẵng, Phú Quốc..."
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Danh mục *</label>
                  <div className="relative">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        markDirty();
                      }}
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                    >
                      <option value="city-tour">City Tour</option>
                      <option value="beach">Du lịch Biển</option>
                      <option value="nature">Thiên nhiên</option>
                      <option value="culture">Văn hóa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời lượng (Số ngày) *</label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) => {
                        setDuration(Number(e.target.value));
                        markDirty();
                      }}
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Đánh dấu Tour Nổi Bật</span>
                  <span className="text-[11px] text-slate-500">Ưu tiên hiển thị tại trang chủ và danh sách tour đề xuất</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => {
                      setIsFeatured(e.target.checked);
                      markDirty();
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Pricing & Flash Sale */}
          {activeStep === 'pricing' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> 2. Giá Bán & Chiến Dịch Flash Sale
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Thiết lập giá niêm yết, giá bán thực tế và chương trình ưu đãi đặc biệt</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <label className="font-bold text-slate-800 block text-xs">Giá bán áp dụng (VNĐ) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      setPrice(Number(e.target.value));
                      markDirty();
                    }}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-blue-500 bg-white"
                  />
                  <p className="text-[11px] text-slate-500">Định dạng hiển thị: {formatPrice(price)}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <label className="font-bold text-slate-800 block text-xs">Giá gốc niêm yết (Gạch ngang nếu có)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => {
                      setOriginalPrice(Number(e.target.value));
                      markDirty();
                    }}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium text-sm focus:outline-none focus:border-blue-500 bg-white"
                  />
                  <p className="text-[11px] text-slate-500">
                    {originalPrice > price ? (
                      <span className="text-emerald-600 font-semibold">
                        Tiết kiệm: {formatPrice(originalPrice - price)} ({Math.round(((originalPrice - price) / originalPrice) * 100)}%)
                      </span>
                    ) : (
                      'Nên nhập cao hơn giá bán để tạo sức hút ưu đãi'
                    )}
                  </p>
                </div>
              </div>

              {/* Flash Sale Banner Config */}
              <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                      🔥 Cấu Hình Flash Sale Giờ Vàng
                    </span>
                    <p className="text-[11px] text-rose-700">Hiển thị đồng hồ đếm ngược và badge giảm giá sốc ở trang chủ</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFlashSale}
                      onChange={(e) => {
                        setIsFlashSale(e.target.checked);
                        markDirty();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {isFlashSale && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-rose-200/60">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1 text-xs">Giá Flash Sale (VNĐ) *</label>
                      <input
                        type="number"
                        value={flashSalePrice}
                        onChange={(e) => {
                          setFlashSalePrice(Number(e.target.value));
                          markDirty();
                        }}
                        className="w-full border border-rose-300 rounded-lg p-2.5 text-rose-600 font-extrabold text-sm focus:outline-none focus:border-rose-500 bg-white"
                      />
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">
                        Đang giảm sâu: {formatPrice(flashSalePrice)} (Thấp hơn giá bán {formatPrice(price - flashSalePrice)})
                      </p>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1 text-xs">Thời Gian Kết Thúc Sale *</label>
                      <input
                        type="datetime-local"
                        value={flashSaleEnd}
                        onChange={(e) => {
                          setFlashSaleEnd(e.target.value);
                          markDirty();
                        }}
                        className="w-full border border-rose-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-rose-500 bg-white font-mono text-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">Đồng hồ đếm ngược sẽ tự dừng khi hết hạn</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Images & Highlights */}
          {activeStep === 'media' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> 3. Bộ Sưu Tập Ảnh & Điểm Nhấn
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Hình ảnh chất lượng cao và các điểm đặc sắc nhất của chuyến đi</p>
              </div>

              {/* Photos Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Hình ảnh Tour ({images.length} ảnh đã tải)</label>
                  <span className="text-[11px] text-slate-400">Ảnh đầu tiên sẽ làm ảnh bìa chính</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-3.5 transition-colors bg-slate-50/50 flex flex-col items-center justify-center text-center">
                    <label className="cursor-pointer w-full flex flex-col items-center py-1">
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
                          <p className="text-xs font-semibold text-slate-800">Tải ảnh từ máy tính</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP (nhiều tệp)</p>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                        </>
                      )}
                    </label>
                  </div>

                  <div
                    onClick={() => setIsMediaModalOpen(true)}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl p-3.5 transition-colors bg-indigo-50/40 flex flex-col items-center justify-center text-center cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-indigo-900">Chọn từ Thư Viện Media</p>
                    <p className="text-[10px] text-indigo-500 mt-0.5">Ảnh đã tải lên & Preset thắng cảnh</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrlImage(); } }}
                    placeholder="Hoặc dán URL hình ảnh trực tiếp (https://...)"
                    className="flex-1 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Thêm URL
                  </button>
                </div>

                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                            Ảnh bìa
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="Xóa ảnh"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed rounded-xl bg-slate-50 text-center text-slate-400">
                    Chưa có ảnh nào. Tour sẽ dùng ảnh mặc định nếu không tải ảnh lên.
                  </div>
                )}
              </div>

              {/* Highlights Management */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" /> Điểm Nhấn Chương Trình ({highlights.length})
                  </label>
                  <span className="text-[11px] text-slate-400">Gạch đầu dòng nổi bật ở trang chi tiết</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHighlight(); } }}
                    placeholder="VD: Khách sạn tiêu chuẩn 4-5 sao gần biển, Bữa ăn hải sản cao cấp..."
                    className="flex-1 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    + Thêm
                  </button>
                </div>

                <div className="space-y-1.5">
                  {highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                      <span className="font-medium text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                        title="Xóa điểm nhấn"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Detailed Itinerary */}
          {activeStep === 'itinerary' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Compass className="w-4 h-4 text-teal-600" /> 4. Lịch Trình Chi Tiết ({itinerary.length} ngày)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Lộ trình từng ngày của tour du lịch để khách hàng dễ theo dõi</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItineraryDay}
                  className="bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Ngày Mới
                </button>
              </div>

              {itinerary.length === 0 ? (
                <div className="p-8 border border-dashed rounded-xl bg-slate-50 text-center space-y-2">
                  <Compass className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-slate-500 font-medium">Chưa có lịch trình nào.</p>
                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Bấm vào đây để tạo Ngày 1
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {itinerary.map((day, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-3 relative group">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-teal-800 text-xs bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                          Ngày #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItineraryDay(idx)}
                          className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa ngày này
                        </button>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tiêu đề ngày:</label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleUpdateItineraryDay(idx, 'title', e.target.value)}
                          placeholder="VD: Ngày 1: Đón đoàn sân bay & Khám phá Chợ Đêm..."
                          className="w-full border border-slate-200 rounded-lg p-2.5 font-bold text-slate-900 bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Chi tiết hoạt động trong ngày:</label>
                        <textarea
                          rows={3}
                          value={day.description}
                          onChange={(e) => handleUpdateItineraryDay(idx, 'description', e.target.value)}
                          placeholder="Mô tả cụ thể các điểm tham quan, ăn uống, phương tiện di chuyển..."
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-white focus:outline-none focus:border-teal-500 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Departure Dates & Slots */}
          {activeStep === 'departures' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" /> 5. Các Đợt Khởi Hành & Giữ Chỗ ({departureDates.length} đợt)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Quản lý các ngày khởi hành sắp tới, giá riêng theo từng đợt và số chỗ còn nhận</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDepartureDate}
                  className="bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Ngày Khởi Hành
                </button>
              </div>

              {departureDates.length === 0 ? (
                <div className="p-8 border border-dashed rounded-xl bg-slate-50 text-center space-y-2">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-slate-500 font-medium">Chưa có ngày khởi hành nào được thiết lập.</p>
                  <button
                    type="button"
                    onClick={handleAddDepartureDate}
                    className="text-amber-700 font-bold hover:underline"
                  >
                    Bấm vào đây để thêm đợt khởi hành đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {departureDates.map((dep, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50/80 border border-slate-200/90 rounded-xl">
                      <div className="col-span-12 sm:col-span-4">
                        <label className="text-[10px] text-slate-500 block font-bold mb-1">Ngày khởi hành *</label>
                        <input
                          type="date"
                          value={dep.date}
                          onChange={(e) => handleUpdateDepartureDate(idx, 'date', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-900 font-bold bg-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-4">
                        <label className="text-[10px] text-slate-500 block font-bold mb-1">Giá tour đợt này (VNĐ) *</label>
                        <input
                          type="number"
                          value={dep.price}
                          onChange={(e) => handleUpdateDepartureDate(idx, 'price', Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-900 font-bold bg-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-3">
                        <label className="text-[10px] text-slate-500 block font-bold mb-1">Số chỗ còn nhận *</label>
                        <input
                          type="number"
                          min={0}
                          value={dep.availableSlots}
                          onChange={(e) => handleUpdateDepartureDate(idx, 'availableSlots', Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-900 font-bold bg-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="col-span-1 text-right pt-4 sm:pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveDepartureDate(idx)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-md transition-colors cursor-pointer"
                          title="Xóa đợt khởi hành"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </AdminStepperModal>

      {/* Central Media Library Picker Modal */}
      <AdminMediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          setImages((prev) => [...prev, url]);
          markDirty();
        }}
        title="Thư Viện Ảnh Cho Tour"
      />
    </div>
  );
}
