'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Globe, Phone, Mail, MapPin, Share2, CreditCard,
  Save, CheckCircle2, Loader2, Image as ImageIcon, Plus, Trash2,
  Upload, LayoutTemplate, FileText, Quote,
  Plane, Award, Building2, ShieldAlert, RefreshCw, AlertTriangle, Layers, Video, ExternalLink
} from 'lucide-react';
import { HomeBlocksSettingsTab, DestinationItem, WhyChooseUsItem, StatCounterItem } from '@/components/admin/settings/HomeBlocksSettingsTab';
import { FlightsSettingsTab, AirportItem, AirlineItem } from '@/components/admin/settings/FlightsSettingsTab';
import { VisaSettingsTab, VisaCountryItem, VisaProcessStepItem, VisaStatBadgeItem } from '@/components/admin/settings/VisaSettingsTab';
import { BranchesSettingsTab, BranchItem, WorkingHoursConfig, CoreValueItem } from '@/components/admin/settings/BranchesSettingsTab';
import { PoliciesSettingsTab, TourDefaultPolicies, BusinessLicenseConfig } from '@/components/admin/settings/PoliciesSettingsTab';
import { toast } from '@/stores/toastStore';

type MultiLang = { vi: string; en: string; zh: string; ko: string; ja: string };

const DEFAULT_ADDRESS: MultiLang = {
  vi: '168 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng',
  en: '168 Nguyen Van Linh, Thanh Khe, Da Nang',
  zh: '岘港市清溪郡阮文灵路168号',
  ko: '다낭시 탄케구 응우옌반린 168번지',
  ja: 'ダナン市タケー区グエンバンリン168番地',
};

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

function MediaBannerUploadCard({
  label,
  imageValue,
  onImageChange,
  videoValue,
  onVideoChange,
  imagePlaceholder,
  videoPlaceholder,
}: {
  label: string;
  imageValue: string;
  onImageChange: (val: string) => void;
  videoValue: string;
  onVideoChange: (val: string) => void;
  imagePlaceholder: string;
  videoPlaceholder: string;
}) {
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
          <img src={imageValue} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'general' | 'branches' | 'payment' | 'policies' | 'flights' | 'visa' | 'social'
  >('general');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [langTab, setLangTab] = useState<'vi' | 'en' | 'zh' | 'ko' | 'ja'>('vi');
  const [showReseedConfirm, setShowReseedConfirm] = useState(false);

  // Master Dynamic CMS States
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUsItem[]>([]);
  const [statsCounters, setStatsCounters] = useState<StatCounterItem[]>([]);
  const [airports, setAirports] = useState<AirportItem[]>([]);
  const [airlines, setAirlines] = useState<AirlineItem[]>([]);
  const [visaCountries, setVisaCountries] = useState<VisaCountryItem[]>([]);
  const [visaProcessSteps, setVisaProcessSteps] = useState<VisaProcessStepItem[]>([]);
  const [visaStatsBadges, setVisaStatsBadges] = useState<VisaStatBadgeItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHoursConfig>({
    weekdays: { vi: '', en: '' },
    weekend: { vi: '', en: '' },
    hotlineNote: { vi: '', en: '' },
  });
  const [coreValues, setCoreValues] = useState<CoreValueItem[]>([]);
  const [tourPolicies, setTourPolicies] = useState<TourDefaultPolicies>({
    inclusions: [],
    exclusions: [],
    importantNotes: [],
  });
  const [hotelAmenities, setHotelAmenities] = useState<string[]>([]);
  const [businessLicense, setBusinessLicense] = useState<BusinessLicenseConfig>({
    taxCode: '',
    issuedBy: '',
    internationalLicense: '',
    hotlineComplaints: '',
  });

  // Testimonials State
  const [reviews, setReviews] = useState<Array<{ id: number; name: string; role: string; content: string; rating: number }>>([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      role: 'Khách hàng thân thiết',
      content: 'Chuyến đi tuyệt vời! Hướng dẫn viên rất nhiệt tình và chu đáo.',
      rating: 5
    },
  ]);

  // Page Banners State (Subpages + Background Videos)
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

  // Pages Content
  const [visaContent, setVisaContent] = useState('');
  const [aboutContent, setAboutContent] = useState('');

  // Hero Slides state
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);

  // General Settings
  const [siteName, setSiteName] = useState('Travel Booking');
  const [hotline, setHotline] = useState('1800 646 888');
  const [email, setEmail] = useState('support@travel.com');
  const [address, setAddress] = useState<MultiLang>(normalizeMultiLang('168 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng'));

  // Social Links
  const [facebook, setFacebook] = useState('https://facebook.com/travel');
  const [zalo, setZalo] = useState('https://zalo.me/0912345678');
  const [youtube, setYoutube] = useState('https://youtube.com/@travel');

  // Payment Info
  const [bankName, setBankName] = useState('MB Bank');
  const [bankAccount, setBankAccount] = useState('999988887777');
  const [bankHolder, setBankHolder] = useState('CÔNG TY TNHH DU LỊCH TRAVEL');
  const [enableBooking, setEnableBooking] = useState(true);

  const { data: settings = [] } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
  });

  const { data: pagesData } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      const [visaRes, aboutRes]: any = await Promise.all([
        api.get('/pages/visa').catch(() => ({})),
        api.get('/pages/about').catch(() => ({}))
      ]);
      return {
        rawVisa: visaRes || {},
        rawAbout: aboutRes || {},
        visa: visaRes?.content?.vi || '',
        about: aboutRes?.content?.vi || ''
      };
    }
  });

  useEffect(() => {
    if (pagesData) {
      setVisaContent(pagesData.visa);
      setAboutContent(pagesData.about);
    }
  }, [pagesData]);

  // Populate from DB
  useEffect(() => {
    if (settings.length > 0) {
      settings.forEach((s: any) => {
        if (s.key === 'hero_banners' && Array.isArray(s.value) && s.value.length > 0) {
          setSlides(s.value.map((slide: any, idx: number) => {
            const def = DEFAULT_SLIDES[idx] || DEFAULT_SLIDES[0];
            return {
              ...slide,
              title: normalizeMultiLang(slide.title, def?.title),
              subtitle: normalizeMultiLang(slide.subtitle, def?.subtitle),
              ctaText: normalizeMultiLang(slide.ctaText, def?.ctaText),
            };
          }));
        } else if (s.key === 'page_banners') {
          if (s.value?.toursBanner) setToursBanner(s.value.toursBanner);
          if (s.value?.toursVideo) setToursVideo(s.value.toursVideo);
          if (s.value?.hotelsBanner) setHotelsBanner(s.value.hotelsBanner);
          if (s.value?.hotelsVideo) setHotelsVideo(s.value.hotelsVideo);
          if (s.value?.flightsBanner) setFlightsBanner(s.value.flightsBanner);
          if (s.value?.flightsVideo) setFlightsVideo(s.value.flightsVideo);
          if (s.value?.visaBanner) setVisaBanner(s.value.visaBanner);
          if (s.value?.visaVideo) setVisaVideo(s.value.visaVideo);
          if (s.value?.newsBanner) setNewsBanner(s.value.newsBanner);
          if (s.value?.newsVideo) setNewsVideo(s.value.newsVideo);
          if (s.value?.specialtiesBanner) setSpecialtiesBanner(s.value.specialtiesBanner);
          if (s.value?.specialtiesVideo) setSpecialtiesVideo(s.value.specialtiesVideo);
          if (s.value?.contactBanner) setContactBanner(s.value.contactBanner);
          if (s.value?.contactVideo) setContactVideo(s.value.contactVideo);
          if (s.value?.lookupBanner) setLookupBanner(s.value.lookupBanner);
          if (s.value?.lookupVideo) setLookupVideo(s.value.lookupVideo);
        } else if (s.key === 'testimonials' && Array.isArray(s.value) && s.value.length > 0) {
          setReviews(s.value);
        } else if (s.key === 'site_info') {
          setSiteName(s.value?.siteName || 'Travel Booking');
          setHotline(s.value?.hotline || '1800 646 888');
          setEmail(s.value?.email || 'support@travel.com');
          setAddress(normalizeMultiLang(s.value?.address, DEFAULT_ADDRESS));
        } else if (s.key === 'social_links') {
          setFacebook(s.value?.facebook || '');
          setZalo(s.value?.zalo || '');
          setYoutube(s.value?.youtube || '');
        } else if (s.key === 'payment_info') {
          setBankName(s.value?.bankName || 'MB Bank');
          setBankAccount(s.value?.bankAccount || '999988887777');
          setBankHolder(s.value?.bankHolder || 'CÔNG TY TNHH DU LỊCH TRAVEL');
          setEnableBooking(s.value?.enableBooking !== false);
        } else if (s.key === 'home_featured_destinations' && Array.isArray(s.value)) {
          setDestinations(s.value);
        } else if (s.key === 'home_why_choose_us' && Array.isArray(s.value)) {
          setWhyChooseUs(s.value);
        } else if (s.key === 'home_stats_counters' && Array.isArray(s.value)) {
          setStatsCounters(s.value);
        } else if (s.key === 'flight_airports' && Array.isArray(s.value)) {
          setAirports(s.value);
        } else if (s.key === 'flight_airlines' && Array.isArray(s.value)) {
          setAirlines(s.value);
        } else if (s.key === 'visa_countries_catalog' && Array.isArray(s.value)) {
          setVisaCountries(s.value);
        } else if (s.key === 'visa_process_steps' && Array.isArray(s.value)) {
          setVisaProcessSteps(s.value);
        } else if (s.key === 'visa_stats_badges' && Array.isArray(s.value)) {
          setVisaStatsBadges(s.value);
        } else if (s.key === 'company_branches' && Array.isArray(s.value)) {
          setBranches(s.value);
        } else if (s.key === 'working_hours' && s.value) {
          setWorkingHours(s.value);
        } else if (s.key === 'about_core_values' && Array.isArray(s.value)) {
          setCoreValues(s.value);
        } else if (s.key === 'tour_default_inclusions_exclusions' && s.value) {
          setTourPolicies(s.value);
        } else if (s.key === 'hotel_amenities_master' && Array.isArray(s.value)) {
          setHotelAmenities(s.value);
        } else if (s.key === 'layout_business_license' && s.value) {
          setBusinessLicense(s.value);
        }
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        api.put('/settings/site_info', {
          group: 'general',
          value: { siteName, hotline, email, address },
        }),
        api.put('/settings/social_links', {
          group: 'social',
          value: { facebook, zalo, youtube },
        }),
        api.put('/settings/payment_info', {
          group: 'payment',
          value: { bankName, bankAccount, bankHolder, enableBooking },
        }),
        // Batch atomic save for all Master Dynamic CMS modules
        api.put('/settings/batch/update', {
          settings: [
            { key: 'flight_airports', group: 'flights', value: airports },
            { key: 'flight_airlines', group: 'flights', value: airlines },
            { key: 'visa_countries_catalog', group: 'visa', value: visaCountries },
            { key: 'visa_process_steps', group: 'visa', value: visaProcessSteps },
            { key: 'visa_stats_badges', group: 'visa', value: visaStatsBadges },
            { key: 'company_branches', group: 'contact', value: branches },
            { key: 'working_hours', group: 'contact', value: workingHours },
            { key: 'about_core_values', group: 'about', value: coreValues },
            { key: 'tour_default_inclusions_exclusions', group: 'policy', value: tourPolicies },
            { key: 'hotel_amenities_master', group: 'policy', value: hotelAmenities },
            { key: 'layout_business_license', group: 'layout', value: businessLicense },
          ],
        }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['setting'] });
      setSuccessMsg('Đã lưu cấu hình cài đặt hệ thống & Toàn bộ dữ liệu Master thành công!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => toast.error('Lỗi lưu cài đặt: ' + (err.response?.data?.message || err.message)),
  });

  const reseedMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/settings/seed-master?force=true');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['setting'] });
      queryClient.invalidateQueries({ queryKey: ['hero-banners-setting'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials-setting'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-page'] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      setShowReseedConfirm(false);
      setSuccessMsg('Đã khôi phục và nạp lại toàn bộ dữ liệu mẫu master thành công!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setShowReseedConfirm(false);
      toast.error('Lỗi nạp dữ liệu mẫu: ' + (err.response?.data?.message || err.message));
    },
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

  const handleSlideLangChange = (index: number, field: 'title' | 'subtitle' | 'ctaText', lang: keyof MultiLang, val: string) => {
    const updated = [...slides];
    updated[index] = {
      ...updated[index],
      [field]: {
        ...updated[index][field],
        [lang]: val
      }
    };
    setSlides(updated);
  };

  const handleAddSlide = () => {
    setSlides([
      ...slides,
      {
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600',
        title: normalizeMultiLang('Tiêu Đề Slide Mới'),
        subtitle: normalizeMultiLang('Mô tả ngắn gọn cho slide mới trên trang chủ'),
        ctaText: normalizeMultiLang('Khám Phá Ngay'),
        ctaLink: '/tours',
      },
    ]);
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.warning('Cần giữ lại ít nhất 1 slide cho Hero Banner');
      return;
    }
    setSlides(slides.filter((_, i) => i !== index));
  };

  const renderLangSelector = () => (
    <div className="flex gap-2 mb-4 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-fit">
      {[
        { code: 'vi', label: '🇻🇳 Tiếng Việt' },
        { code: 'en', label: '🇬🇧 English' },
        { code: 'zh', label: '🇨🇳 中文' },
        { code: 'ko', label: '🇰🇷 한국어' },
        { code: 'ja', label: '🇯🇵 日本語' },
      ].map(l => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLangTab(l.code as any)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            langTab === l.code ? 'bg-white shadow-sm text-blue-600 border border-slate-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cài Đặt Hệ Thống & Banner Các Trang</h1>
          <p className="text-xs text-slate-500 mt-1">Cấu hình Slide Hero, Banner các trang con, thông tin website và thanh toán</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReseedConfirm(true)}
            disabled={reseedMutation.isPending}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Khôi phục hoặc nạp lại dữ liệu danh mục ban đầu"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${reseedMutation.isPending ? 'animate-spin' : ''}`} />
            <span>Nạp Dữ Liệu Mẫu (Seeds)</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Đang lưu...</>
            ) : (
              <><Save className="w-3.5 h-3.5" />Lưu Tất Cả Cấu Hình</>
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Quick Navigation Banner to Appearance */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Cấu hình Giao Diện & Bố Cục Trang Chủ</h3>
            <p className="text-[11px] text-slate-500">
              Slider Hero, Video nền và các khối nội dung trang chủ được quản lý tập trung tại module riêng biệt
            </p>
          </div>
        </div>
        <Link
          href="/admin/appearance"
          className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold px-4 py-2 rounded-xl border border-blue-200 shadow-2xs transition-all shrink-0 inline-flex items-center gap-1.5"
        >
          <span>Mở Giao Diện & Trang Chủ</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Streamlined Tabs Bar */}
      <div className="bg-slate-100/90 border border-slate-200/80 rounded-xl p-1 flex gap-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`py-2 px-3.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeTab === 'general' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> 1. Thông Tin Doanh Nghiệp
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`py-2 px-3.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeTab === 'social' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" /> 2. Mạng Xã Hội
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          className={`py-2 px-3.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeTab === 'branches' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> 3. Chi Nhánh & Giờ Làm ({branches.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`py-2 px-3.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeTab === 'payment' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> 4. Cổng Thanh Toán & VietQR
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`py-2 px-3.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeTab === 'policies' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> 5. Chính Sách & Giấy Phép
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('flights')}
          className={`py-2 px-3.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeTab === 'flights' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
          }`}
        >
          <Plane className="w-3.5 h-3.5" /> 6. Hàng Không ({airports.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('visa')}
          className={`py-2 px-3.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeTab === 'visa' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
          }`}
        >
          <Award className="w-3.5 h-3.5" /> 7. Visa & Thủ Tục ({visaCountries.length})
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        {/* Tab: General */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Thông Tin Website & Liên Hệ</h2>
            </div>
            
            {renderLangSelector()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên Website / Thương hiệu *</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hotline tư vấn *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    value={hotline}
                    onChange={e => setHotline(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email hỗ trợ *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Địa chỉ trụ sở *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    value={address[langTab]}
                    onChange={e => setAddress(prev => ({ ...prev, [langTab]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Social */}
        {activeTab === 'social' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Liên Kết Mạng Xã Hội</h2>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Facebook Fanpage URL</label>
              <input
                value={facebook}
                onChange={e => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Zalo Official / SĐT Zalo</label>
              <input
                value={zalo}
                onChange={e => setZalo(e.target.value)}
                placeholder="https://zalo.me/..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">YouTube Channel URL</label>
              <input
                value={youtube}
                onChange={e => setYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Tab: Payment */}
        {activeTab === 'payment' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Thông Tin Chuyển Khoản Ngân Hàng</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên Ngân Hàng</label>
                <input
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="MB Bank"
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số Tài Khoản</label>
                <input
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value)}
                  placeholder="999988887777"
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chủ Tài Khoản</label>
                <input
                  value={bankHolder}
                  onChange={e => setBankHolder(e.target.value)}
                  placeholder="CÔNG TY DU LỊCH TRAVEL"
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Flights Master Settings */}
        {activeTab === 'flights' && (
          <div className="animate-in fade-in duration-200">
            <FlightsSettingsTab
              airports={airports}
              setAirports={setAirports}
              airlines={airlines}
              setAirlines={setAirlines}
            />
          </div>
        )}

        {/* Tab: Visa Master Settings */}
        {activeTab === 'visa' && (
          <div className="animate-in fade-in duration-200">
            <VisaSettingsTab
              countries={visaCountries}
              setCountries={setVisaCountries}
              processSteps={visaProcessSteps}
              setProcessSteps={setVisaProcessSteps}
              statsBadges={visaStatsBadges}
              setStatsBadges={setVisaStatsBadges}
            />
          </div>
        )}

        {/* Tab: Branches & Working Hours Master Settings */}
        {activeTab === 'branches' && (
          <div className="animate-in fade-in duration-200">
            <BranchesSettingsTab
              branches={branches}
              setBranches={setBranches}
              workingHours={workingHours}
              setWorkingHours={setWorkingHours}
              coreValues={coreValues}
              setCoreValues={setCoreValues}
            />
          </div>
        )}

        {/* Tab: Policies & Amenities Master Settings */}
        {activeTab === 'policies' && (
          <div className="animate-in fade-in duration-200">
            <PoliciesSettingsTab
              tourPolicies={tourPolicies}
              setTourPolicies={setTourPolicies}
              hotelAmenities={hotelAmenities}
              setHotelAmenities={setHotelAmenities}
              businessLicense={businessLicense}
              setBusinessLicense={setBusinessLicense}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal for Master Data Reseeding */}
      {showReseedConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">Khôi Phục Dữ Liệu Master Ban Đầu?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thao tác này sẽ gọi API nạp lại toàn bộ 15 danh mục dữ liệu mẫu chuẩn (Điểm đến nổi bật, Sân bay, Hãng bay, Danh mục Visa, Quy trình 4 bước, Chi nhánh, Điều khoản tour, Tiện ích khách sạn...).
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReseedConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => reseedMutation.mutate()}
                disabled={reseedMutation.isPending}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                {reseedMutation.isPending ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Đang nạp dữ liệu...</>
                ) : (
                  <><RefreshCw className="w-3.5 h-3.5" />Xác Nhận Nạp Lại</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
