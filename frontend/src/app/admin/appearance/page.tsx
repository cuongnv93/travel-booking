'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Palette, Save, CheckCircle2, Loader2, Plus, Trash2,
  Upload, LayoutTemplate, Quote, Video, Image as ImageIcon,
  ExternalLink, Layers
} from 'lucide-react';
import {
  HomeBlocksSettingsTab,
  DestinationItem,
  WhyChooseUsItem,
  StatCounterItem
} from '@/components/admin/settings/HomeBlocksSettingsTab';
import { MediaBannerUploadCard } from '@/components/admin/settings/MediaBannerUploadCard';
import Link from 'next/link';
import { toast } from '@/stores/toastStore';

type MultiLang = { vi: string; en: string; zh: string; ko: string; ja: string };

const normalizeMultiLang = (val: any, defaultFallback?: Partial<MultiLang>): MultiLang => {
  const viVal = typeof val === 'string' ? val : (val?.vi || '');
  return {
    vi: viVal || defaultFallback?.vi || '',
    en: (val && typeof val === 'object' && val.en) ? val.en : (defaultFallback?.en || viVal),
    zh: (val && typeof val === 'object' && val.zh) ? val.zh : (defaultFallback?.zh || viVal),
    ko: (val && typeof val === 'object' && val.ko) ? val.ko : (defaultFallback?.ko || viVal),
    ja: (val && typeof val === 'object' && val.ja) ? val.ja : (defaultFallback?.ja || viVal),
  };
};

interface HeroSlide {
  image: string;
  title: MultiLang;
  subtitle: MultiLang;
  ctaText: MultiLang;
  ctaLink: string;
}

const normalizeSlide = (slide: any): HeroSlide => ({
  image: slide?.image || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600',
  title: normalizeMultiLang(slide?.title),
  subtitle: normalizeMultiLang(slide?.subtitle),
  ctaText: normalizeMultiLang(slide?.ctaText),
  ctaLink: slide?.ctaLink || '/tours',
});

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600',
    title: {
      vi: 'Khám Phá Hà Nội Ngàn Năm Văn Hiến',
      en: 'Explore Thousand-Year-Old Hanoi Culture',
      zh: '探索千年文化古都河内',
      ko: '천년의 역사를 간직한 하노이 탐험',
      ja: '千年の歴史を誇るハノイを巡る旅'
    },
    subtitle: {
      vi: 'Trải nghiệm văn hóa, ẩm thực và vẻ đẹp cổ kính của phố cổ 36 phường',
      en: 'Experience culture, cuisine, and ancient beauty of Hanoi 36 Old Streets',
      zh: '体验河内 36 古街的丰富文化、地道美食与古朴风貌',
      ko: '하노이 36개 구시가지의 문화, 음식 및 예스러운 아름다움을 체험하세요',
      ja: 'ハノイ36古街の歴史ある美しさ、文化、絶品グルメをご体感ください'
    },
    ctaText: { vi: 'Khám Phá Tours', en: 'Explore Tours', zh: '探索行程', ko: '투어 탐색', ja: 'ツアーを探す' },
    ctaLink: '/tours',
  },
  {
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1600',
    title: {
      vi: 'Nghỉ Dưỡng 5 Sao Tại Biển Đà Nẵng',
      en: '5-Star Luxury Resort in Da Nang Coast',
      zh: '岘港海滨五星级奢华度假',
      ko: '다낭 해변의 5성급 럭셔리 리조트 휴양',
      ja: 'ダナンビーチの5つ星極上リゾート'
    },
    subtitle: {
      vi: 'Tận hưởng khoảnh khắc tuyệt đẹp tại Cầu Vàng Bà Nà Hills & Hội An lung linh',
      en: 'Enjoy breathtaking moments at Golden Bridge Ba Na Hills & romantic Hoi An',
      zh: '尽情享用巴拿山黄金桥与会安古镇浪漫夜景的绝美时光',
      ko: '바나힐 골든브릿지와 환상적인 호이안에서 특별한 순간을 즐기세요',
      ja: 'バーナーヒルズの神の hand 橋と幻想的なホイアンの夜景を満喫'
    },
    ctaText: { vi: 'Đặt Khách Sạn', en: 'Book Hotels', zh: '预订酒店', ko: '호텔 예약', ja: 'ホテルを予約' },
    ctaLink: '/hotels',
  },
  {
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600',
    title: {
      vi: 'Phú Quốc – Đảo Ngọc Thiên Đường',
      en: 'Phu Quoc – Tropical Island Paradise',
      zh: '富国岛 – 热带天堂珍珠岛',
      ko: '푸꾸옥 – 천국의 파라다이스 섬',
      ja: 'フーコック島 – 楽園のトロピカルアイランド'
    },
    subtitle: {
      vi: 'Bãi biển cát trắng mịn, ngắm san hô biển Nam và VinWonders sôi động',
      en: 'Pristine white sand beaches, coral reef snorkeling & vibrant VinWonders',
      zh: '细白沙滩、浮潜观赏珊瑚及体验精彩纷呈的 VinWonders 主题乐园',
      ko: '하얀 모래사장, 산호초 스노클링 및 활기찬 빈원더스 테마파크 체험',
      ja: '白砂のビーチ、珊瑚礁スノーケリング、人気のテーマパークVinWondersを満喫'
    },
    ctaText: { vi: 'Xem Chuyến Đi', en: 'View Trip', zh: '查看行程', ko: '일정 보기', ja: 'プランを見る' },
    ctaLink: '/tours/phu-quoc-paradise',
  },
];

const fetchSettings = async () => {
  const res: any = await api.get('/settings');
  return Array.isArray(res) ? res : (res?.data || []);
};

export default function AdminAppearancePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'hero' | 'home_blocks' | 'testimonials' | 'banners'>('hero');
  const [langTab, setLangTab] = useState<'vi' | 'en' | 'zh' | 'ko' | 'ja'>('vi');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Hero Slides
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);

  // Home Blocks
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUsItem[]>([]);
  const [statsCounters, setStatsCounters] = useState<StatCounterItem[]>([]);

  // Testimonials
  const [reviews, setReviews] = useState<Array<{ id: number; name: string; role: string; content: string; rating: number }>>([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      role: 'Khách hàng thân thiết',
      content: 'Chuyến đi tuyệt vời! Hướng dẫn viên rất nhiệt tình và chu đáo.',
      rating: 5
    },
  ]);

  // Page Banners State
  const [toursBanner, setToursBanner] = useState('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600');
  const [toursVideo, setToursVideo] = useState('https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/mountains.mp4');
  const [hotelsBanner, setHotelsBanner] = useState('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600');
  const [hotelsVideo, setHotelsVideo] = useState('https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/glide-over-coastal-beach.mp4');
  const [flightsBanner, setFlightsBanner] = useState('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600');
  const [flightsVideo, setFlightsVideo] = useState('https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/airplane.mp4');
  const [visaBanner, setVisaBanner] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?w=1600');
  const [visaVideo, setVisaVideo] = useState('https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/travel.mp4');
  const [newsBanner, setNewsBanner] = useState('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600');
  const [newsVideo, setNewsVideo] = useState('https://res.cloudinary.com/demo/video/upload/so_0,eo_12,q_auto,w_1280,ac_none/forest_bike.mp4');
  const [specialtiesBanner, setSpecialtiesBanner] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600');
  const [specialtiesVideo, setSpecialtiesVideo] = useState('https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/walking.mp4');
  const [contactBanner, setContactBanner] = useState('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600');
  const [contactVideo, setContactVideo] = useState('https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/travel.mp4');
  const [lookupBanner, setLookupBanner] = useState('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600');
  const [lookupVideo, setLookupVideo] = useState('https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/airplane.mp4');

  const { data: settings = [] } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
  });

  // Populate from DB
  useEffect(() => {
    if (settings.length > 0) {
      settings.forEach((s: any) => {
        if (s.key === 'hero_banners' && Array.isArray(s.value) && s.value.length > 0) {
          setSlides(s.value.map(normalizeSlide));
        }
        if (s.key === 'page_banners' && s.value) {
          if (s.value.toursBanner) setToursBanner(s.value.toursBanner);
          if (s.value.toursVideo) setToursVideo(s.value.toursVideo);
          if (s.value.hotelsBanner) setHotelsBanner(s.value.hotelsBanner);
          if (s.value.hotelsVideo) setHotelsVideo(s.value.hotelsVideo);
          if (s.value.flightsBanner) setFlightsBanner(s.value.flightsBanner);
          if (s.value.flightsVideo) setFlightsVideo(s.value.flightsVideo);
          if (s.value.visaBanner) setVisaBanner(s.value.visaBanner);
          if (s.value.visaVideo) setVisaVideo(s.value.visaVideo);
          if (s.value.newsBanner) setNewsBanner(s.value.newsBanner);
          if (s.value.newsVideo) setNewsVideo(s.value.newsVideo);
          if (s.value.specialtiesBanner) setSpecialtiesBanner(s.value.specialtiesBanner);
          if (s.value.specialtiesVideo) setSpecialtiesVideo(s.value.specialtiesVideo);
          if (s.value.contactBanner) setContactBanner(s.value.contactBanner);
          if (s.value.contactVideo) setContactVideo(s.value.contactVideo);
          if (s.value.lookupBanner) setLookupBanner(s.value.lookupBanner);
          if (s.value.lookupVideo) setLookupVideo(s.value.lookupVideo);
        }
        if (s.key === 'testimonials' && Array.isArray(s.value)) {
          setReviews(s.value);
        }
        if (s.key === 'home_featured_destinations' && Array.isArray(s.value)) {
          setDestinations(s.value);
        }
        if (s.key === 'home_why_choose_us' && Array.isArray(s.value)) {
          setWhyChooseUs(s.value);
        }
        if (s.key === 'home_stats_counters' && Array.isArray(s.value)) {
          setStatsCounters(s.value);
        }
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        api.put('/settings/hero_banners', {
          group: 'homepage',
          value: slides,
        }),
        api.put('/settings/page_banners', {
          group: 'general',
          value: {
            toursBanner,
            toursVideo,
            hotelsBanner,
            hotelsVideo,
            flightsBanner,
            flightsVideo,
            visaBanner,
            visaVideo,
            newsBanner,
            newsVideo,
            specialtiesBanner,
            specialtiesVideo,
            contactBanner,
            contactVideo,
            lookupBanner,
            lookupVideo,
          },
        }),
        api.put('/settings/testimonials', {
          group: 'homepage',
          value: reviews,
        }),
        api.put('/settings/batch/update', {
          settings: [
            { key: 'home_featured_destinations', group: 'home', value: destinations },
            { key: 'home_why_choose_us', group: 'home', value: whyChooseUs },
            { key: 'home_stats_counters', group: 'home', value: statsCounters },
          ],
        }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['hero-banners-setting'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials-setting'] });
      setSuccessMsg('Đã lưu cấu hình Giao diện & Bố cục Trang chủ thành công!');
      toast.success('Đã lưu cấu hình Giao diện & Bố cục Trang chủ!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => toast.error('Lỗi lưu giao diện: ' + (err.response?.data?.message || err.message)),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const handleSlideChange = (index: number, field: keyof HeroSlide, val: string) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: val };
    setSlides(updated);
  };

  const handleSlideLangChange = (index: number, field: 'title' | 'subtitle' | 'ctaText', lang: 'vi' | 'en' | 'zh' | 'ko' | 'ja', val: string) => {
    const updated = [...slides];
    const currentFieldObj = normalizeMultiLang(updated[index]?.[field]);
    updated[index] = {
      ...updated[index],
      [field]: { ...currentFieldObj, [lang]: val }
    };
    setSlides(updated);
  };

  const handleAddSlide = () => {
    setSlides([
      ...slides,
      {
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600',
        title: { vi: 'Hành Trình Mới', en: 'New Journey', zh: '新旅程', ko: '새로운 여정', ja: '新しい旅' },
        subtitle: { vi: 'Mô tả kỳ nghỉ tuyệt vời', en: 'Amazing vacation experience', zh: '难忘的度假体验', ko: '환상적인 휴가 경험', ja: '素晴らしい休暇体験' },
        ctaText: { vi: 'Khám Phá Ngay', en: 'Explore Now', zh: '立即探索', ko: '지금 탐색', ja: '今すぐ探す' },
        ctaLink: '/tours',
      }
    ]);
  };

  const handleRemoveSlide = (idx: number) => {
    if (slides.length <= 1) {
      toast.warning('Phải giữ lại ít nhất 1 slide.');
      return;
    }
    setSlides(slides.filter((_, i) => i !== idx));
  };

  const handleAddReview = () => {
    setReviews([
      ...reviews,
      { id: Date.now(), name: 'Khách hàng', role: 'Du khách', content: 'Dịch vụ rất tốt!', rating: 5 }
    ]);
  };

  const handleRemoveReview = (id: number) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  const handleReviewChange = (id: number, field: string, val: any) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Giao Diện & Bố Cục Trang Chủ</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tùy biến Banner Hero, các khối nội dung trang chủ, video nền và ảnh đại diện các trang con
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vi"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Xem Trang Chủ
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-600/25 transition-all cursor-pointer"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Đang Lưu...</>
            ) : (
              <><Save className="w-4 h-4" /> Lưu Giao Diện</>
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'hero', label: '1. Banner Hero Trang Chủ', icon: LayoutTemplate },
          { key: 'home_blocks', label: '2. Các Khối Nội Dung (Blocks)', icon: Layers },
          { key: 'testimonials', label: '3. Đánh Giá Khách Hàng', icon: Quote },
          { key: 'banners', label: '4. Banner Các Trang Con', icon: Video },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Hero Slider */}
      {activeTab === 'hero' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Danh Sách Slide Hero Trang Chủ</h2>
              <p className="text-slate-500 text-xs mt-0.5">Slider ảnh và khẩu hiệu xuất hiện đầu tiên khi khách vào website</p>
            </div>
            <button
              type="button"
              onClick={handleAddSlide}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm Slide Mới
            </button>
          </div>

          {/* Language Selector for Hero */}
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/60 w-fit">
            <span className="text-xs font-bold text-slate-500 px-2">Ngôn ngữ soạn thảo:</span>
            {[
              { code: 'vi', label: 'Tiếng Việt' },
              { code: 'en', label: 'English' },
              { code: 'zh', label: '中文' },
              { code: 'ko', label: '한국어' },
              { code: 'ja', label: '日本語' },
            ].map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLangTab(l.code as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  langTab === l.code ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {slides.map((slide, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    Slide #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlide(idx)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa Slide
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start text-xs">
                  <div className="md:col-span-4 space-y-2">
                    <label className="font-bold text-slate-700 block">Hình Ảnh Slide *</label>
                    <div className="h-40 bg-slate-900 rounded-xl overflow-hidden relative group shadow-inner">
                      <img src={slide.image} alt={slide.title?.vi || 'Slide'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="bg-white/95 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md hover:bg-white transition-colors">
                          {uploadingIndex === idx ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> Đang tải...</>
                          ) : (
                            <><Upload className="w-3.5 h-3.5 text-blue-600" /> Tải Ảnh Lên</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingIndex !== null}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                setUploadingIndex(idx);
                                const formData = new FormData();
                                formData.append('image', file);
                                const res: any = await api.post('/upload', formData);
                                const url = res.url || res.path || res.imageUrl;
                                const backendOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
                                handleSlideChange(idx, 'image', url.startsWith('http') ? url : `${backendOrigin}${url}`);
                              } catch (err: any) {
                                toast.error('Lỗi tải ảnh lên: ' + (err.response?.data?.message || err.message));
                              } finally {
                                setUploadingIndex(null);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <input
                      value={slide.image}
                      onChange={e => handleSlideChange(idx, 'image', e.target.value)}
                      placeholder="URL hình ảnh slide..."
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 text-xs font-mono bg-white"
                    />
                  </div>

                  <div className="md:col-span-8 space-y-3.5">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Tiêu Đề Lớn ({langTab.toUpperCase()}) *
                      </label>
                      <input
                        value={slide.title[langTab] || ''}
                        onChange={e => handleSlideLangChange(idx, 'title', langTab, e.target.value)}
                        placeholder="Tiêu đề hiển thị lớn trên banner..."
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Mô Tả Phụ ({langTab.toUpperCase()}) *
                      </label>
                      <textarea
                        rows={2}
                        value={slide.subtitle[langTab] || ''}
                        onChange={e => handleSlideLangChange(idx, 'subtitle', langTab, e.target.value)}
                        placeholder="Mô tả ngắn gọn thu hút du khách..."
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Tên Nút Bấm ({langTab.toUpperCase()})</label>
                        <input
                          value={slide.ctaText[langTab] || ''}
                          onChange={e => handleSlideLangChange(idx, 'ctaText', langTab, e.target.value)}
                          placeholder="VD: Khám Phá Tours"
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Đường Dẫn Khi Bấm (Link)</label>
                        <input
                          value={slide.ctaLink}
                          onChange={e => handleSlideChange(idx, 'ctaLink', e.target.value)}
                          placeholder="VD: /tours hoặc /hotels"
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Home Blocks */}
      {activeTab === 'home_blocks' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-6">
            <h2 className="text-sm font-bold text-slate-900">Các Khối Nội Dung Trên Trang Chủ</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Cấu hình danh sách Điểm đến nổi bật, Khối &quot;Tại sao chọn TimesGreen&quot; và Các chỉ số thống kê ấn tượng
            </p>
          </div>
          <HomeBlocksSettingsTab
            destinations={destinations}
            setDestinations={setDestinations}
            whyChooseUs={whyChooseUs}
            setWhyChooseUs={setWhyChooseUs}
            statsCounters={statsCounters}
            setStatsCounters={setStatsCounters}
          />
        </div>
      )}

      {/* Tab 3: Testimonials */}
      {activeTab === 'testimonials' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Đánh Giá Khách Hàng (Testimonials)</h2>
              <p className="text-slate-500 text-xs mt-0.5">Các phản hồi thực tế từ khách hàng hiển thị trang chủ</p>
            </div>
            <button
              type="button"
              onClick={handleAddReview}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm Đánh Giá
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => handleRemoveReview(r.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Xóa đánh giá"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tên khách hàng</label>
                    <input
                      value={r.name}
                      onChange={e => handleReviewChange(r.id, 'name', e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vai trò / Danh xưng</label>
                    <input
                      value={r.role}
                      onChange={e => handleReviewChange(r.id, 'role', e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nội dung nhận xét</label>
                  <textarea
                    rows={2}
                    value={r.content}
                    onChange={e => handleReviewChange(r.id, 'content', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 bg-white resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">Đánh giá số sao:</span>
                  <select
                    value={r.rating}
                    onChange={e => handleReviewChange(r.id, 'rating', Number(e.target.value))}
                    className="border border-slate-200 rounded-lg p-1 font-bold text-amber-600 bg-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 sao)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 sao)</option>
                    <option value={3}>⭐⭐⭐ (3 sao)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Subpages Banners & Background Videos */}
      {activeTab === 'banners' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Banner & Video Nền Các Trang Con</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Tùy biến hình ảnh poster tĩnh và URL video nền chạy tự động cho từng chuyên trang
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MediaBannerUploadCard
              label="1. Trang Danh Sách Tour (/tours)"
              imageValue={toursBanner}
              onImageChange={setToursBanner}
              videoValue={toursVideo}
              onVideoChange={setToursVideo}
            />

            <MediaBannerUploadCard
              label="2. Trang Khách Sạn (/hotels)"
              imageValue={hotelsBanner}
              onImageChange={setHotelsBanner}
              videoValue={hotelsVideo}
              onVideoChange={setHotelsVideo}
            />

            <MediaBannerUploadCard
              label="3. Trang Vé Máy Bay (/flights)"
              imageValue={flightsBanner}
              onImageChange={setFlightsBanner}
              videoValue={flightsVideo}
              onVideoChange={setFlightsVideo}
            />

            <MediaBannerUploadCard
              label="4. Trang Dịch Vụ Visa (/visa)"
              imageValue={visaBanner}
              onImageChange={setVisaBanner}
              videoValue={visaVideo}
              onVideoChange={setVisaVideo}
            />

            <MediaBannerUploadCard
              label="5. Trang Tin Tức & Cẩm Nang (/news)"
              imageValue={newsBanner}
              onImageChange={setNewsBanner}
              videoValue={newsVideo}
              onVideoChange={setNewsVideo}
            />

            <MediaBannerUploadCard
              label="6. Trang Đặc Sản Địa Phương (/specialties)"
              imageValue={specialtiesBanner}
              onImageChange={setSpecialtiesBanner}
              videoValue={specialtiesVideo}
              onVideoChange={setSpecialtiesVideo}
            />

            <MediaBannerUploadCard
              label="7. Trang Liên Hệ & Tư Vấn (/contact)"
              imageValue={contactBanner}
              onImageChange={setContactBanner}
              videoValue={contactVideo}
              onVideoChange={setContactVideo}
            />

            <MediaBannerUploadCard
              label="8. Trang Tra Cứu Mã Đơn (/booking-lookup)"
              imageValue={lookupBanner}
              onImageChange={setLookupBanner}
              videoValue={lookupVideo}
              onVideoChange={setLookupVideo}
            />
          </div>
        </div>
      )}
    </div>
  );
}
