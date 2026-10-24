'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import {
  Plus,
  X,
  Search,
  Upload,
  Loader2,
  Building2,
  Star,
  MapPin,
  Trash2,
  DollarSign,
  Sparkles,
  BedDouble,
  ShieldCheck,
  Check,
  Navigation,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, getI18nText } from '@/lib/utils';
import { AdminI18nTabs, ADMIN_SUPPORTED_LANGUAGES, createEmptyI18nRecord, toI18nRecord, sanitizeI18nRecord } from '@/components/admin/common/AdminI18nTabs';
import { AdminStepperModal, AdminStepItem } from '@/components/admin/common/AdminStepperModal';
import { AdminPagination } from '@/components/admin/common/AdminPagination';
import { exportToCsv } from '@/lib/exportCsv';

const fetchAdminHotels = async () => {
  const res: any = await api.get('/hotels?all=true');
  return Array.isArray(res) ? res : (res?.data || []);
};

const AMENITY_OPTIONS = [
  'WiFi miễn phí',
  'Hồ bơi ngoài trời',
  'Hồ bơi trong nhà',
  'Buffet sáng',
  'Spa & Massage',
  'Phòng gym',
  'Bar / Lounge',
  'Nhà hàng',
  'Bãi biển riêng',
  'Đưa đón sân bay',
  'Kids club',
  'Yoga & Thiền',
  'Tắm ngâm thảo mộc',
  'Lò sưởi',
  'Lễ tân 24h',
  'Chỗ đậu xe miễn phí'
];

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

interface HotelTableRowProps {
  hotel: any;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (hotel: any) => void;
  onDelete: (id: string) => void;
}

const HotelTableRow = memo(function HotelTableRow({
  hotel,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: HotelTableRowProps) {
  const [imgSrc, setImgSrc] = useState(hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800');

  return (
    <tr className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
      <td className="px-4 py-3.5 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(hotel._id)}
          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
        />
      </td>
      <td className="px-5 py-3.5 flex items-center gap-3">
        <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgSrc('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800')}
            />
          ) : (
            <Building2 className="w-4 h-4 text-slate-400 m-auto mt-3" />
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-900 line-clamp-1 max-w-xs">{getI18nText(hotel.name, 'vi') || 'N/A'}</p>
          <p className="text-[11px] text-slate-400 font-mono">{hotel.slug}</p>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">
          <MapPin className="w-3 h-3 text-slate-500" />
          {hotel.location}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold text-xs bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          {hotel.stars} Sao
        </span>
      </td>
      <td className="px-5 py-3.5 font-bold text-slate-900">
        {formatPrice(hotel.pricePerNight)}
        <span className="text-[11px] font-normal text-slate-400">/đêm</span>
      </td>
      <td className="px-5 py-3.5 text-right space-x-1.5 shrink-0">
        <button
          onClick={() => onEdit(hotel)}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors text-xs cursor-pointer"
        >
          Sửa
        </button>
        <button
          onClick={() => onDelete(hotel._id)}
          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md transition-colors text-xs cursor-pointer"
        >
          Xóa
        </button>
      </td>
    </tr>
  );
});

const HOTEL_STEPS: AdminStepItem[] = [
  { id: 'basic', label: 'Thông Tin Chung & Đa Ngữ', icon: Building2 },
  { id: 'pricing', label: 'Giá & Flash Sale', icon: DollarSign },
  { id: 'media_amenities', label: 'Hình Ảnh & Tiện Ích', icon: Sparkles },
  { id: 'location_policies', label: 'Vị Trí & Chính Sách', icon: MapPin },
  { id: 'rooms', label: 'Cấu Hình Hạng Phòng', icon: BedDouble },
];

export default function AdminHotelsPage() {
  const queryClient = useQueryClient();

  // Filters & Search
  const [search, setSearch] = useState('');
  const [starsFilter, setStarsFilter] = useState<number | ''>('');
  const [isFlashSaleOnly, setIsFlashSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'stars'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Row selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<string>('basic');
  const [isDirty, setIsDirty] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [activeLang, setActiveLang] = useState<string>('vi');
  const [name, setName] = useState<Record<string, string>>(createEmptyI18nRecord());
  const [description, setDescription] = useState<Record<string, string>>(createEmptyI18nRecord());
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [pricePerNight, setPricePerNight] = useState(1000000);
  const [stars, setStars] = useState(4);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);

  // Location & Policies
  const [policiesStr, setPoliciesStr] = useState('');
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [nearbyPlaces, setNearbyPlaces] = useState<{ name: string; distance: string }[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  // Flash Sale
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [flashSalePrice, setFlashSalePrice] = useState(700000);
  const [flashSaleEnd, setFlashSaleEnd] = useState('');

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: fetchAdminHotels,
    placeholderData: keepPreviousData,
  });

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

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
      alert('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message));
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

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
    markDirty();
  };

  const addRoom = () => {
    setRooms([
      ...rooms,
      {
        name: 'Phòng mới',
        description: '',
        price: 1000000,
        size: 30,
        bedType: '1 Giường đôi',
        capacity: { adults: 2, children: 1 },
        amenities: [],
        images: []
      }
    ]);
    markDirty();
  };

  const removeRoom = (idx: number) => {
    setRooms(rooms.filter((_, i) => i !== idx));
    markDirty();
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
    markDirty();
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingHotel) return api.put(`/hotels/${editingHotel._id}`, payload);
      return api.post('/hotels', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['featured-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['flash-sale-items'] });
      setIsDirty(false);
      setIsModalOpen(false);
    },
    onError: (err: any) => alert('Lỗi lưu khách sạn: ' + (err.response?.data?.message || err.message)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/hotels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['featured-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['flash-sale-items'] });
    },
    onError: (err: any) => alert('Lỗi xóa khách sạn: ' + (err.response?.data?.message || err.message)),
  });

  const handleCopyFromVi = useCallback(() => {
    if (activeLang === 'vi') return;
    setName((prev) => ({ ...prev, [activeLang]: prev[activeLang] || prev.vi || '' }));
    setDescription((prev) => ({ ...prev, [activeLang]: prev[activeLang] || prev.vi || '' }));
    markDirty();
  }, [activeLang, markDirty]);

  const resetForm = () => {
    setEditingHotel(null);
    setActiveStep('basic');
    setActiveLang('vi');
    setName(createEmptyI18nRecord());
    setDescription(createEmptyI18nRecord());
    setImages([]);
    setUrlInput('');
    setPricePerNight(1000000);
    setStars(4);
    setLocation('');
    setAddress('');
    setAmenities([]);
    setPoliciesStr('');
    setLat('');
    setLng('');
    setNearbyPlaces([]);
    setRooms([]);
    setIsFlashSale(false);
    setFlashSalePrice(700000);
    setFlashSaleEnd(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    setIsDirty(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (hotel: any) => {
    setEditingHotel(hotel);
    setActiveStep('basic');
    setActiveLang('vi');
    setName(toI18nRecord(hotel.name));
    setDescription(toI18nRecord(hotel.description));
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
    setIsDirty(false);
    setIsModalOpen(true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!name.vi || !name.vi.trim()) {
      setActiveStep('basic');
      alert('Vui lòng nhập Tên Khách Sạn (Tiếng Việt) ở bước Thông Tin Chung!');
      return;
    }

    if (!location || !location.trim()) {
      setActiveStep('basic');
      alert('Vui lòng nhập Địa điểm / Thành phố ở bước Thông Tin Chung!');
      return;
    }

    if (pricePerNight <= 0) {
      setActiveStep('pricing');
      alert('Giá phòng cơ bản phải lớn hơn 0 VNĐ!');
      return;
    }

    if (isFlashSale && (!flashSalePrice || flashSalePrice >= pricePerNight)) {
      setActiveStep('pricing');
      alert('Giá Flash Sale phải nhỏ hơn giá cơ bản / đêm!');
      return;
    }

    const slug = editingHotel?.slug || toSlug(name.vi || 'khach-san-' + Date.now());

    saveMutation.mutate({
      slug,
      name: sanitizeI18nRecord(name),
      description: sanitizeI18nRecord(description),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
      pricePerNight: Number(pricePerNight),
      stars: Number(stars),
      location: location.trim(),
      address: address.trim(),
      amenities,
      policies: policiesStr.split('\n').map((p) => p.trim()).filter((p) => p !== ''),
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

  const handleDelete = useCallback((id: string) => {
    if (confirm('Xóa khách sạn này khỏi hệ thống?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  // Bulk actions
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Xác nhận xóa ${selectedIds.length} khách sạn đã chọn khỏi hệ thống?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/hotels/${id}`)));
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      setSelectedIds([]);
      alert(`Đã xóa ${selectedIds.length} khách sạn thành công!`);
    } catch (err: any) {
      alert('Lỗi xóa hàng loạt: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filtered & Sorted Hotels
  const filteredHotels = useMemo(() => {
    const s = search.toLowerCase().trim();
    return hotels
      .filter((h: any) => {
        const hotelName = getI18nText(h.name, 'vi') || (typeof h.name === 'string' ? h.name : '');
        const searchMatch = !s || hotelName.toLowerCase().includes(s) || (h.location || '').toLowerCase().includes(s);

        let starsMatch = true;
        if (starsFilter !== '') {
          starsMatch = h.stars === starsFilter;
        }

        let flashSaleMatch = true;
        if (isFlashSaleOnly) {
          flashSaleMatch = !!h.isFlashSale;
        }

        return searchMatch && starsMatch && flashSaleMatch;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'price_asc') return (a.pricePerNight || 0) - (b.pricePerNight || 0);
        if (sortBy === 'price_desc') return (b.pricePerNight || 0) - (a.pricePerNight || 0);
        if (sortBy === 'stars') return (b.stars || 0) - (a.stars || 0);
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [hotels, search, starsFilter, isFlashSaleOnly, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredHotels.length / pageSize) || 1;
  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHotels.slice(start, start + pageSize);
  }, [filteredHotels, currentPage, pageSize]);

  // Select all on page
  const isAllCurrentSelected = useMemo(() => {
    if (paginatedHotels.length === 0) return false;
    return paginatedHotels.every((h: any) => selectedIds.includes(h._id));
  }, [paginatedHotels, selectedIds]);

  const handleToggleSelectAll = () => {
    if (isAllCurrentSelected) {
      const pageIds = new Set(paginatedHotels.map((h: any) => h._id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...paginatedHotels.map((h: any) => h._id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  // Export to CSV
  const handleExportCsv = (onlySelected = false) => {
    const targetData = onlySelected
      ? hotels.filter((h: any) => selectedIds.includes(h._id))
      : filteredHotels;

    if (targetData.length === 0) {
      alert('Không có dữ liệu khách sạn để xuất!');
      return;
    }

    exportToCsv('danh_sach_khach_san', targetData, [
      {
        key: 'name',
        label: 'Tên Khách Sạn',
        formatter: (h) => getI18nText(h.name, 'vi') || 'N/A'
      },
      { key: 'slug', label: 'Slug' },
      { key: 'location', label: 'Địa Điểm / Thành Phố' },
      { key: 'address', label: 'Địa Chỉ' },
      { key: 'stars', label: 'Hạng Sao', formatter: (h) => `${h.stars || 4} Sao` },
      { key: 'pricePerNight', label: 'Giá/Đêm (VNĐ)' },
      { key: 'isFlashSale', label: 'Flash Sale', formatter: (h) => h.isFlashSale ? 'Có' : 'Không' },
      { key: 'flashSalePrice', label: 'Giá Flash Sale' },
      { key: 'roomsCount', label: 'Số Hạng Phòng', formatter: (h) => Array.isArray(h.rooms) ? h.rooms.length : 0 },
    ]);
  };

  const stepsWithCounts = useMemo(() => {
    return HOTEL_STEPS.map((step) => {
      if (step.id === 'media_amenities') return { ...step, badgeCount: images.length };
      if (step.id === 'location_policies') return { ...step, badgeCount: nearbyPlaces.length };
      if (step.id === 'rooms') return { ...step, badgeCount: rooms.length };
      return step;
    });
  }, [images.length, nearbyPlaces.length, rooms.length]);

  if (isLoading) return <AdminTableSkeleton cols={5} rows={7} />;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Khách Sạn & Resort</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách chỗ nghỉ, phân loại sao, bộ lọc nhanh và cấu hình các loại phòng</p>
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
            <Plus className="w-4 h-4" /> Thêm Khách Sạn Mới
          </button>
        </div>
      </div>

      {/* Quick Star & Sale Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-2">
        <button
          type="button"
          onClick={() => {
            setStarsFilter('');
            setIsFlashSaleOnly(false);
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            starsFilter === '' && !isFlashSaleOnly
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Tất Cả
        </button>

        {[5, 4, 3].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              setStarsFilter(star);
              setIsFlashSaleOnly(false);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              starsFilter === star && !isFlashSaleOnly
                ? 'bg-amber-500 text-slate-900 shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            {star} Sao
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            setIsFlashSaleOnly(!isFlashSaleOnly);
            setStarsFilter('');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            isFlashSaleOnly
              ? 'bg-rose-600 text-white shadow-xs font-bold'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          🔥 Flash Sale
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm khách sạn theo tên hoặc địa điểm (Đà Nẵng, Phú Quốc, Nha Trang...)..."
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
            <option value="price_asc">Giá phòng thấp nhất</option>
            <option value="price_desc">Giá phòng cao nhất</option>
            <option value="stars">Hạng sao cao nhất</option>
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
            <span className="text-xs font-semibold">khách sạn đang được chọn</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

      {/* Hotels Table */}
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
                <th className="px-5 py-3.5">Khách sạn</th>
                <th className="px-5 py-3.5">Địa điểm</th>
                <th className="px-5 py-3.5">Hạng sao</th>
                <th className="px-5 py-3.5">Giá/đêm</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedHotels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy khách sạn nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedHotels.map((hotel: any) => (
                  <HotelTableRow
                    key={hotel._id}
                    hotel={hotel}
                    isSelected={selectedIds.includes(hotel._id)}
                    onToggleSelect={handleToggleSelect}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredHotels.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {/* Modern Stepper Modal for Hotel */}
      <AdminStepperModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHotel ? 'Chỉnh Sửa Khách Sạn' : 'Thêm Khách Sạn Mới'}
        subtitle={editingHotel ? `Đang chỉnh sửa: ${editingHotel.slug}` : 'Nhập thông tin chỗ nghỉ qua 5 bước bên dưới'}
        badge={{
          text: editingHotel ? 'Chỉnh sửa' : 'Thêm mới',
          variant: editingHotel ? 'amber' : 'blue',
        }}
        steps={stepsWithCounts}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        isDirty={isDirty}
        isSubmitting={saveMutation.isPending || isUploading}
        submitLabel={editingHotel ? 'Cập Nhật Khách Sạn' : 'Lưu & Xuất Bản Khách Sạn'}
        onSave={handleSave}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 text-xs">
          {/* STEP 1: Basic Info & Multilingual */}
          {activeStep === 'basic' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" /> 1. Thông Tin Cơ Bản & Đa Ngôn Ngữ
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Tên cơ sở lưu trú, hạng sao, thành phố và địa chỉ chi tiết</p>
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
                label="Chọn ngôn ngữ nhập liệu cho Tên & Mô tả Khách sạn:"
              />

              {activeLang !== 'vi' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center justify-between">
                  <span>
                    Đang chỉnh sửa bản dịch <strong>{ADMIN_SUPPORTED_LANGUAGES.find((l) => l.code === activeLang)?.label}</strong>. Nếu để trống, hệ thống sẽ tự động hiển thị bản dịch Tiếng Anh hoặc Tiếng Việt.
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
                  Tên Khách Sạn ({activeLang.toUpperCase()}) {activeLang === 'vi' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={name[activeLang] || ''}
                  onChange={(e) => {
                    setName((prev) => ({ ...prev, [activeLang]: e.target.value }));
                    markDirty();
                  }}
                  placeholder={activeLang === 'vi' ? 'VD: Sheraton Grand Đà Nẵng Resort...' : `Tên khách sạn bằng tiếng ${activeLang.toUpperCase()}...`}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-semibold bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 text-xs">
                  Mô tả Khách Sạn ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={4}
                  value={description[activeLang] || ''}
                  onChange={(e) => {
                    setDescription((prev) => ({ ...prev, [activeLang]: e.target.value }));
                    markDirty();
                  }}
                  placeholder="Mô tả phong cách, không gian nghỉ dưỡng và dịch vụ nổi bật..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hạng sao *</label>
                  <select
                    value={stars}
                    onChange={(e) => {
                      setStars(Number(e.target.value));
                      markDirty();
                    }}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white cursor-pointer font-bold"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>
                        {s} Sao {s >= 4 ? '★★★★' : '★★★'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Địa điểm / Thành phố *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        markDirty();
                      }}
                      placeholder="VD: Đà Nẵng, Phú Quốc, Nha Trang..."
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Địa chỉ cụ thể</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      markDirty();
                    }}
                    placeholder="VD: 35 Trường Sa, Ngũ Hành Sơn..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pricing & Flash Sale */}
          {activeStep === 'pricing' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> 2. Giá Phòng & Flash Sale
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Thiết lập giá khởi điểm mỗi đêm và chương trình ưu đãi giờ vàng</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <label className="font-bold text-slate-800 block text-xs">Giá/đêm cơ bản (VNĐ) *</label>
                <input
                  type="number"
                  min={0}
                  value={pricePerNight}
                  onChange={(e) => {
                    setPricePerNight(Number(e.target.value));
                    markDirty();
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-blue-500 bg-white"
                />
                <p className="text-[11px] text-slate-500">Giá hiển thị: {formatPrice(pricePerNight)} / đêm</p>
              </div>

              {/* Flash Sale Controls */}
              <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                      🔥 Cấu Hình Flash Sale Khách Sạn Giờ Vàng
                    </span>
                    <p className="text-[11px] text-rose-700">Hiển thị giá sốc có đồng hồ đếm ngược trên trang chủ và trang khách sạn</p>
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
                        Giảm: {formatPrice(pricePerNight - flashSalePrice)} ({Math.round(((pricePerNight - flashSalePrice) / pricePerNight) * 100)}%)
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Images & Amenities */}
          {activeStep === 'media_amenities' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> 3. Bộ Sưu Tập Ảnh & Tiện Ích
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Hình ảnh khuôn viên khách sạn và checklist tiện ích phục vụ khách</p>
              </div>

              {/* Photos Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Hình ảnh Khách sạn ({images.length} ảnh đã tải)</label>
                  <span className="text-[11px] text-slate-400">Ảnh đầu tiên làm ảnh đại diện</span>
                </div>

                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-4 transition-colors bg-slate-50/50 flex flex-col items-center justify-center text-center">
                  <label className="cursor-pointer w-full flex flex-col items-center py-2">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 text-blue-600">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-medium">Đang tải ảnh lên máy chủ...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-800">Tải ảnh từ máy tính (Có thể chọn nhiều tệp cùng lúc)</p>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUrlImage();
                      }
                    }}
                    placeholder="Dán URL hình ảnh trực tiếp (https://...)"
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

                {images.length > 0 && (
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
                )}
              </div>

              {/* Amenities Checklist */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">Tiện nghi nổi bật ({amenities.length} tiện ích đã chọn)</label>
                  <span className="text-[11px] text-slate-400">Click để bật / tắt tiện nghi</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((item) => {
                    const isSelected = amenities.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleAmenity(item)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Location Details & Policies */}
          {activeStep === 'location_policies' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" /> 4. Tọa Độ Bản Đồ & Chính Sách
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Tọa độ định vị GPS, các địa điểm nổi tiếng lân cận và quy định lưu trú</p>
              </div>

              {/* Lat & Lng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vĩ độ GPS (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => {
                      setLat(e.target.value ? Number(e.target.value) : '');
                      markDirty();
                    }}
                    placeholder="VD: 16.0544"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kinh độ GPS (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => {
                      setLng(e.target.value ? Number(e.target.value) : '');
                      markDirty();
                    }}
                    placeholder="VD: 108.2022"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Nearby Places */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-blue-600" /> Địa điểm lân cận nổi tiếng ({nearbyPlaces.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNearbyPlaces([...nearbyPlaces, { name: '', distance: '' }]);
                      markDirty();
                    }}
                    className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Thêm địa điểm
                  </button>
                </div>

                {nearbyPlaces.length === 0 ? (
                  <div className="p-4 border border-dashed rounded-xl bg-slate-50 text-center text-slate-400">
                    Chưa có địa điểm lân cận nào. Nhấn &ldquo;+ Thêm địa điểm&rdquo; để gợi ý các điểm tham quan gần khách sạn.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {nearbyPlaces.map((place, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <input
                          value={place.name}
                          onChange={(e) => {
                            const newPlaces = [...nearbyPlaces];
                            newPlaces[idx].name = e.target.value;
                            setNearbyPlaces(newPlaces);
                            markDirty();
                          }}
                          placeholder="Tên địa điểm (VD: Bãi biển Mỹ Khê, Cầu Rồng...)"
                          className="flex-1 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                        />
                        <input
                          value={place.distance}
                          onChange={(e) => {
                            const newPlaces = [...nearbyPlaces];
                            newPlaces[idx].distance = e.target.value;
                            setNearbyPlaces(newPlaces);
                            markDirty();
                          }}
                          placeholder="Khoảng cách (VD: 500m, 2.5 km)"
                          className="w-36 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNearbyPlaces(nearbyPlaces.filter((_, i) => i !== idx));
                            markDirty();
                          }}
                          className="text-slate-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                          title="Xóa địa điểm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Policies */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Quy định & Chính sách lưu trú
                </label>
                <p className="text-[11px] text-slate-500">Mỗi dòng là một quy định (VD: Giờ nhận phòng, Giờ trả phòng, Phí trẻ em, Đặt cọc...)</p>
                <textarea
                  rows={4}
                  value={policiesStr}
                  onChange={(e) => {
                    setPoliciesStr(e.target.value);
                    markDirty();
                  }}
                  placeholder={'Nhận phòng: Từ 14:00\nTrả phòng: Trước 12:00\nKhông hút thuốc trong phòng\nCho phép mang thú cưng (có phụ phí)'}
                  className="w-full border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:border-blue-500 bg-white font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Room Types Configuration */}
          {activeStep === 'rooms' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-blue-600" /> 5. Cấu Hình Hạng Phòng ({rooms.length} phòng)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Các loại phòng có sẵn (Standard, Deluxe, Suite...), diện tích và sức chứa</p>
                </div>
                <button
                  type="button"
                  onClick={addRoom}
                  className="text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Hạng Phòng Mới
                </button>
              </div>

              {rooms.length === 0 ? (
                <div className="p-8 border border-dashed rounded-xl bg-slate-50 text-center space-y-2">
                  <BedDouble className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-slate-500 font-medium">Chưa có hạng phòng nào được cấu hình.</p>
                  <button
                    type="button"
                    onClick={addRoom}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Bấm vào đây để tạo hạng phòng đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room, idx) => (
                    <div key={idx} className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/70 relative space-y-3 shadow-2xs">
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          {room.name || 'Phòng chưa đặt tên'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRoom(idx)}
                          className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa phòng
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-4">
                          <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Tên phòng *</label>
                          <input
                            type="text"
                            value={room.name}
                            onChange={(e) => updateRoom(idx, 'name', e.target.value)}
                            placeholder="VD: Deluxe Hướng Biển"
                            className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 bg-white focus:outline-none focus:border-blue-500 font-bold text-xs"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Giá/đêm (VNĐ) *</label>
                          <input
                            type="number"
                            value={room.price}
                            onChange={(e) => updateRoom(idx, 'price', Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 bg-white focus:outline-none focus:border-blue-500 font-bold text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Diện tích (m²) *</label>
                          <input
                            type="number"
                            value={room.size}
                            onChange={(e) => updateRoom(idx, 'size', Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 bg-white focus:outline-none focus:border-blue-500 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Loại giường *</label>
                          <input
                            type="text"
                            value={room.bedType}
                            onChange={(e) => updateRoom(idx, 'bedType', e.target.value)}
                            placeholder="1 Giường King hoặc 2 Đơn"
                            className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 bg-white focus:outline-none focus:border-blue-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8">
                          <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Mô tả phòng</label>
                          <input
                            type="text"
                            value={room.description}
                            onChange={(e) => updateRoom(idx, 'description', e.target.value)}
                            placeholder="Ban công nhìn ra biển, bồn tắm nằm..."
                            className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 bg-white focus:outline-none focus:border-blue-500 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Người lớn</label>
                          <input
                            type="number"
                            min={1}
                            value={room.capacity?.adults ?? 2}
                            onChange={(e) => updateRoom(idx, 'capacity.adults', Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 bg-white focus:outline-none focus:border-blue-500 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Trẻ em</label>
                          <input
                            type="number"
                            min={0}
                            value={room.capacity?.children ?? 1}
                            onChange={(e) => updateRoom(idx, 'capacity.children', Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 bg-white focus:outline-none focus:border-blue-500 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </AdminStepperModal>
    </div>
  );
}
