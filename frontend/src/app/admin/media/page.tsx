'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  Loader2,
  Eye,
  Check,
  Grid,
  List,
  Filter,
  HardDrive,
  FileCheck,
  Calendar,
  AlertTriangle,
  X,
  Maximize2,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/stores/toastStore';
import { AdminConfirmModal } from '@/components/admin/common/AdminConfirmModal';

interface MediaItem {
  filename: string;
  url: string;
  createdAt?: string | Date;
  size?: number;
}

const CURATED_PRESETS = [
  { label: 'Vịnh Hạ Long - Kỳ Quan Thiên Nhiên', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600', category: 'Thiên nhiên' },
  { label: 'Đà Nẵng & Cầu Vàng Bà Nà Hills', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1600', category: 'Điểm đến' },
  { label: 'Phú Quốc Bãi Sao Biển Xanh', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600', category: 'Biển đảo' },
  { label: 'Hội An Phố Cổ Đèn Lồng', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600', category: 'Văn hóa' },
  { label: 'Sa Pa Ruộng Bậc Thang Mùa Lúa Chín', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600', category: 'Miền núi' },
  { label: 'Nha Trang Bờ Biển Hoàng Hôn', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600', category: 'Biển đảo' },
  { label: 'Hà Nội Hồ Gươm Cổ Kính', url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600', category: 'Thủ đô' },
  { label: 'Khách sạn / Resort 5 Sao Sang Trọng', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600', category: 'Khách sạn' },
  { label: 'Phòng Khách Sạn Suite Deluxe', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600', category: 'Phòng nghỉ' },
  { label: 'Bể Bơi Vô Cực Hướng Biển', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600', category: 'Tiện ích' },
  { label: 'Ẩm Thực Đặc Sản 3 Miền Việt Nam', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600', category: 'Ẩm thực' },
  { label: 'Máy Bay Cất Cánh Bầu Trời', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600', category: 'Hàng không' },
];

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'uploads' | 'presets' | 'all'>('uploads');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [selectedPreview, setSelectedPreview] = useState<MediaItem | null>(null);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Query Media from Backend
  const { data: uploadedMedia = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ['admin-media-library'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/upload');
        return Array.isArray(res) ? res : (res?.data || []);
      } catch {
        return [];
      }
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (filename: string) => {
      return await api.delete(`/upload/${filename}`);
    },
    onSuccess: () => {
      toast.success('Đã xóa hình ảnh khỏi thư viện!');
      queryClient.invalidateQueries({ queryKey: ['admin-media-library'] });
      if (selectedPreview) setSelectedPreview(null);
    },
    onError: (err: any) => {
      toast.error('Lỗi khi xóa ảnh: ' + (err.response?.data?.message || err.message));
    },
  });

  // Handle Upload
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.warning(`Tệp "${file.name}" không phải là ảnh hợp lệ.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.warning(`Tệp "${file.name}" vượt quá kích thước 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress(`Đang tải (${i + 1}/${validFiles.length}): ${file.name}`);
      const formData = new FormData();
      formData.append('image', file);

      try {
        await api.post('/upload', formData);
        successCount++;
      } catch (err: any) {
        toast.error(`Lỗi tải "${file.name}": ` + (err.response?.data?.message || err.message));
      }
    }

    setIsUploading(false);
    setUploadProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      toast.success(`Đã tải lên thành công ${successCount} hình ảnh vào thư viện!`);
      queryClient.invalidateQueries({ queryKey: ['admin-media-library'] });
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Copy URL with toast
  const handleCopyUrl = useCallback((url: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      toast.success('Đã sao chép đường dẫn ảnh vào bộ nhớ tạm!');
    } else {
      toast.info(`URL: ${url}`);
    }
  }, []);

  // Request Delete with Modal
  const requestDelete = useCallback((item: MediaItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác Nhận Xóa Hình Ảnh',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn tệp "${item.filename}" khỏi hệ thống? Các bài viết hoặc tour đang sử dụng ảnh này có thể bị mất hình ảnh.`,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(item.filename);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  }, [deleteMutation]);

  // Filtered Media
  const filteredUploads = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return uploadedMedia;
    return uploadedMedia.filter((item) =>
      (item.filename || item.url || '').toLowerCase().includes(s)
    );
  }, [uploadedMedia, search]);

  const filteredPresets = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return CURATED_PRESETS;
    return CURATED_PRESETS.filter((item) =>
      item.label.toLowerCase().includes(s) || item.url.toLowerCase().includes(s) || item.category.toLowerCase().includes(s)
    );
  }, [search]);

  // Total Storage Size Calculation
  const totalStorageBytes = useMemo(() => {
    return uploadedMedia.reduce((acc, curr) => acc + (curr.size || 0), 0);
  }, [uploadedMedia]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Stats */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Thư Viện Phương Tiện & Hình Ảnh (Media)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Quản lý kho ảnh tập trung dùng chung cho Tours, Khách Sạn, Tin Tức, Trang Tĩnh và Banner
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{isUploading ? 'Đang Tải Lên...' : 'Tải Ảnh Mới Lên'}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Ảnh Đã Tải Lên</span>
              <span className="font-extrabold text-slate-800 text-sm">{uploadedMedia.length} tệp</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Dung Lượng Sử Dụng</span>
              <span className="font-extrabold text-slate-800 text-sm">{formatBytes(totalStorageBytes)}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Ảnh Mẫu Du Lịch</span>
              <span className="font-extrabold text-slate-800 text-sm">{CURATED_PRESETS.length} ảnh HD</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Định Dạng Hỗ Trợ</span>
              <span className="font-extrabold text-slate-800 text-sm">JPG, PNG, WEBP, SVG</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
            : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
        }`}
      >
        <div className="max-w-md mx-auto space-y-2 pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 border border-slate-200 shadow-sm mx-auto flex items-center justify-center">
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            {isUploading ? uploadProgress : 'Kéo thả hình ảnh vào đây hoặc nhấp để chọn tệp'}
          </h3>
          <p className="text-xs text-slate-400">
            Hỗ trợ tải lên nhiều tệp cùng lúc. Tối đa 10MB mỗi ảnh (Định dạng: JPG, PNG, WEBP, GIF, SVG).
          </p>
        </div>
      </div>

      {/* 3. Toolbar: Search, Filters & View Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('uploads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'uploads'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Ảnh Đã Tải Lên ({uploadedMedia.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ảnh Mẫu Du Lịch ({CURATED_PRESETS.length})</span>
          </button>
        </div>

        {/* Right Tools: Search & View Toggle */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm hình ảnh theo tên..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Dạng lưới"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Dạng danh sách"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Media Gallery Content */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm min-h-[400px]">
        {activeTab === 'uploads' ? (
          isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Đang tải thư viện ảnh...</p>
            </div>
          ) : filteredUploads.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Chưa có hình ảnh nào được tải lên</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Kéo thả ảnh vào khung ở trên hoặc nhấn nút &ldquo;Tải Ảnh Mới Lên&rdquo; để đưa ảnh vào thư viện.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredUploads.map((item, idx) => (
                <div
                  key={item.filename || idx}
                  className="group bg-slate-50 border border-slate-200/90 hover:border-blue-400 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.filename}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPreview(item)}
                        title="Xem chi tiết"
                        className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl transition-transform hover:scale-110 cursor-pointer shadow-md"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.url)}
                        title="Sao chép URL"
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-transform hover:scale-110 cursor-pointer shadow-md"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(item)}
                        title="Xóa ảnh"
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-transform hover:scale-110 cursor-pointer shadow-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Card Footer */}
                  <div className="p-3 bg-white space-y-1">
                    <p className="font-bold text-slate-800 text-xs truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>{formatBytes(item.size)}</span>
                      <span>{formatDate(item.createdAt).split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Xem Trước</th>
                    <th className="py-3 px-3">Tên Tệp Tin</th>
                    <th className="py-3 px-3">Kích Thước</th>
                    <th className="py-3 px-3">Ngày Tải Lên</th>
                    <th className="py-3 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUploads.map((item, idx) => (
                    <tr key={item.filename || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block truncate max-w-xs">{item.filename}</span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate max-w-md">{item.url}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{formatBytes(item.size)}</td>
                      <td className="py-2.5 px-3 text-slate-500">{formatDate(item.createdAt)}</td>
                      <td className="py-2.5 px-3 text-right space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedPreview(item)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          title="Phóng to"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.url)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          title="Sao chép URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(item)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          title="Xóa tệp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Presets Tab */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {filteredPresets.map((preset, idx) => (
              <div
                key={idx}
                className="group bg-slate-50 border border-slate-200/90 hover:border-blue-400 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {preset.category}
                  </span>
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPreview({
                          filename: preset.label,
                          url: preset.url,
                          createdAt: new Date(),
                        })
                      }
                      title="Xem ảnh lớn"
                      className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl transition-transform hover:scale-110 cursor-pointer shadow-md"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(preset.url)}
                      title="Sao chép URL"
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-transform hover:scale-110 cursor-pointer shadow-md"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white space-y-1">
                  <p className="font-bold text-slate-800 text-xs line-clamp-1" title={preset.label}>
                    {preset.label}
                  </p>
                  <p className="text-[11px] text-blue-600 font-semibold flex items-center justify-between">
                    <span>Ảnh Mẫu Miễn Phí</span>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(preset.url)}
                      className="hover:underline text-[10px]"
                    >
                      Copy URL
                    </button>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Lightbox / Image Details Modal */}
      {selectedPreview && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPreview(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-md">
                  {selectedPreview.filename}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="max-h-[50vh] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                <img
                  src={selectedPreview.url}
                  alt={selectedPreview.filename}
                  className="max-h-[50vh] w-auto object-contain mx-auto"
                />
              </div>

              {/* Details & Copy URL */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Đường Dẫn URL Hình Ảnh:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedPreview.url}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(selectedPreview.url)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao Chép</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Kích Thước</span>
                    <span className="font-bold text-slate-800">{formatBytes(selectedPreview.size)}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Thời Gian</span>
                    <span className="font-bold text-slate-800">{formatDate(selectedPreview.createdAt)}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Xem Trực Tiếp</span>
                    <a
                      href={selectedPreview.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      Mở trong tab mới <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              {uploadedMedia.some((m) => m.filename === selectedPreview.filename) ? (
                <button
                  type="button"
                  onClick={() => requestDelete(selectedPreview)}
                  className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa Ảnh Này
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. General Confirm Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Xác nhận xóa"
        variant="danger"
      />
    </div>
  );
}
