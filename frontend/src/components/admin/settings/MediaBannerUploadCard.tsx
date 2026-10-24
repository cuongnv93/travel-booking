'use client';

import { Image as ImageIcon, Video, Upload } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/stores/toastStore';

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
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <label className="bg-white/90 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md hover:bg-white transition-colors">
            <Upload className="w-4 h-4 text-blue-600" />
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
                } catch (err: any) {
                  toast.error('Lỗi tải ảnh lên: ' + (err.response?.data?.message || err.message));
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
          <ImageIcon className="w-3 h-3 text-blue-500" /> URL Ảnh Bìa / Poster:
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
          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-purple-500 text-xs font-mono"
        />
      </div>
    </div>
  );
}
