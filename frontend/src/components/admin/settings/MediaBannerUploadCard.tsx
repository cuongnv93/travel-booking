'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Video, Upload, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/stores/toastStore';
import { AdminMediaPickerModal } from '@/components/admin/common/AdminMediaPickerModal';

export interface MediaBannerUploadCardProps {
  label: string;
  imageValue: string;
  onImageChange: (val: string) => void;
  videoValue: string;
  onVideoChange: (val: string) => void;
  imagePlaceholder?: string;
  videoPlaceholder?: string;
}

export function MediaBannerUploadCard({
  label,
  imageValue,
  onImageChange,
  videoValue,
  onVideoChange,
  imagePlaceholder = 'https://images.unsplash.com/...',
  videoPlaceholder = 'https://.../video.mp4',
}: MediaBannerUploadCardProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-800 block text-xs">{label}</label>
        {videoValue && (
          <span className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
            <Video className="w-3 h-3" /> Video Nền
          </span>
        )}
      </div>

      <div className="h-36 bg-slate-900 rounded-xl overflow-hidden relative group shadow-inner">
        {videoValue ? (
          <video
            src={videoValue}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={imageValue || imagePlaceholder}
            alt={label}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Thư Viện Media</span>
          </button>

          <label className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md hover:bg-white transition-colors">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Tải Ảnh Mới</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (!e.target.files?.[0]) return;
                try {
                  const formData = new FormData();
                  formData.append('image', e.target.files[0]);
                  const res: any = await api.post('/upload', formData);
                  const url = res.url || res.path || res.imageUrl;
                  const backendOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
                  onImageChange(url.startsWith('http') ? url : `${backendOrigin}${url}`);
                  toast.success('Đã tải ảnh lên thành công!');
                } catch (err: any) {
                  toast.error('Lỗi tải ảnh lên: ' + (err.response?.data?.message || err.message));
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-blue-500" /> URL Ảnh Bìa / Poster:
          </span>
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 font-bold text-[10px]"
          >
            <Sparkles className="w-3 h-3" /> Chọn từ Thư Viện Media
          </button>
        </div>
        <input
          value={imageValue}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder={imagePlaceholder}
          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-xs font-mono"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
          <Video className="w-3 h-3 text-purple-500" /> URL Video Nền:
        </div>
        <input
          value={videoValue}
          onChange={(e) => onVideoChange(e.target.value)}
          placeholder={videoPlaceholder}
          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-xs font-mono"
        />
      </div>

      {/* Media Picker Modal */}
      <AdminMediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          onImageChange(url);
          setIsMediaModalOpen(false);
        }}
        title={`Chọn Ảnh Cho ${label}`}
      />
    </div>
  );
}
export default MediaBannerUploadCard;
