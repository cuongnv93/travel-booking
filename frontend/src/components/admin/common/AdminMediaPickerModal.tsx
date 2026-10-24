'use client';

import React, { useState, useMemo, useEffect, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Search, Upload, Check, Image as ImageIcon, Loader2, Sparkles, Copy, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/stores/toastStore';

export interface AdminMediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

const CURATED_PRESETS = [
  { label: 'Vịnh Hạ Long', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600' },
  { label: 'Đà Nẵng & Cầu Vàng', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1600' },
  { label: 'Phú Quốc Bãi Sao', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600' },
  { label: 'Hội An Phố Cổ', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600' },
  { label: 'Sa Pa Ruộng Bậc Thang', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600' },
  { label: 'Nha Trang Biển Xanh', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600' },
  { label: 'Hà Nội Hồ Gươm', url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600' },
  { label: 'Khách sạn / Resort 5 Sao', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600' },
  { label: 'Phòng Khách Sạn Deluxe', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600' },
  { label: 'Bể Bơi Vô Cực Biển', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600' },
  { label: 'Ẩm Thực Đặc Sản', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600' },
  { label: 'Máy Bay Cất Cánh', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600' },
];

export const AdminMediaPickerModal = memo(function AdminMediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Thư Viện Phương Tiện',
}: AdminMediaPickerModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'uploads' | 'presets'>('uploads');
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch uploaded media
  const { data: uploadedMedia = [], isLoading } = useQuery({
    queryKey: ['admin-media-library'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/upload');
        return Array.isArray(res) ? res : (res?.data || []);
      } catch {
        return [];
      }
    },
    enabled: isOpen,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const res: any = await api.post('/upload', formData);
      if (res?.url) {
        toast.success('Tải ảnh mới lên thư viện thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-media-library'] });
        onSelect(res.url);
        onClose();
      }
    } catch (err: any) {
      toast.error('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const filteredUploads = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return uploadedMedia;
    return uploadedMedia.filter((item: any) =>
      (item.filename || item.url || '').toLowerCase().includes(s)
    );
  }, [uploadedMedia, search]);

  const filteredPresets = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return CURATED_PRESETS;
    return CURATED_PRESETS.filter((item) =>
      item.label.toLowerCase().includes(s) || item.url.toLowerCase().includes(s)
    );
  }, [search]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
              <p className="text-xs text-slate-500 font-medium">Chọn ảnh có sẵn hoặc tải ảnh mới từ máy tính</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Tabs & Search & Upload Button */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('uploads')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'uploads'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ảnh Đã Tải Lên ({uploadedMedia.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ảnh Mẫu Chất Lượng Cao
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm hình ảnh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <label className="shrink-0 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors">
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{isUploading ? 'Đang tải...' : 'Tải File Mới'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Media Grid Content */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[300px]">
          {activeTab === 'uploads' ? (
            isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                <p className="text-xs">Đang tải danh sách phương tiện...</p>
              </div>
            ) : filteredUploads.length === 0 ? (
              <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Chưa có ảnh nào được tải lên</p>
                <p className="text-[11px] text-slate-400 mt-1">Bấm nút &ldquo;Tải File Mới&rdquo; ở trên để thêm ảnh vào hệ thống.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {filteredUploads.map((media: any, i: number) => (
                  <div
                    key={media.filename || i}
                    onClick={() => {
                      onSelect(media.url);
                      toast.success('Đã chọn ảnh thành công!');
                      onClose();
                    }}
                    className="group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-500 bg-slate-100 aspect-video cursor-pointer shadow-2xs hover:shadow-md transition-all flex flex-col justify-end"
                  >
                    <img
                      src={media.url}
                      alt={media.filename || ''}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <div className="w-full flex items-center justify-between text-white text-[11px] font-bold">
                        <span className="truncate max-w-[120px]">{media.filename}</span>
                        <span className="px-2 py-0.5 bg-blue-600 rounded-md text-[10px] shrink-0">Chọn</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredPresets.map((preset, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onSelect(preset.url);
                    toast.success(`Đã chọn ảnh "${preset.label}"!`);
                    onClose();
                  }}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-500 bg-slate-100 aspect-video cursor-pointer shadow-2xs hover:shadow-md transition-all flex flex-col justify-end"
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-2.5">
                    <div className="w-full flex items-center justify-between text-white text-[11px] font-bold">
                      <span className="truncate">{preset.label}</span>
                      <span className="px-2 py-0.5 bg-blue-600 rounded-md text-[10px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Chọn</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>Nhấp vào bất kỳ ảnh nào để áp dụng trực tiếp</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
});
