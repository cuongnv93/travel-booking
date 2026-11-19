'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Globe, Phone, Mail, MapPin, Share2, CreditCard,
  Save, CheckCircle2, Loader2, LayoutTemplate,
  Plane, Award, Building2, ShieldAlert, RefreshCw, AlertTriangle, ExternalLink
} from 'lucide-react';
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

const fetchSettings = async () => {
  const res: any = await api.get('/settings');
  return Array.isArray(res) ? res : (res?.data || []);
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'general' | 'branches' | 'payment' | 'policies' | 'flights' | 'visa' | 'social'
  >('general');
  const [successMsg, setSuccessMsg] = useState('');
  const [langTab, setLangTab] = useState<'vi' | 'en' | 'zh' | 'ko' | 'ja'>('vi');

  // Master Dynamic CMS States
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

  // General Settings
  const [siteName, setSiteName] = useState('Travel Booking');
  const [hotline, setHotline] = useState('1800 646 888');
  const [email, setEmail] = useState('support@travel.com');
  const [address, setAddress] = useState<MultiLang>(DEFAULT_ADDRESS);

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

  // Populate from DB
  useEffect(() => {
    if (settings.length > 0) {
      settings.forEach((s: any) => {
        if (s.key === 'site_info') {
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
      toast.success('Đã lưu cấu hình cài đặt hệ thống & Toàn bộ dữ liệu Master thành công!');
      setSuccessMsg('Đã lưu cấu hình cài đặt hệ thống & Toàn bộ dữ liệu Master thành công!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => toast.error('Lỗi lưu cài đặt: ' + (err.response?.data?.message || err.message)),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) {
      toast.error('Tên Website / Thương hiệu không được để trống!');
      setActiveTab('general');
      return;
    }
    if (!hotline.trim()) {
      toast.error('Hotline tư vấn không được để trống!');
      setActiveTab('general');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Email hỗ trợ không hợp lệ!');
      setActiveTab('general');
      return;
    }
    if (!address.vi.trim()) {
      toast.error('Địa chỉ trụ sở (Tiếng Việt) không được để trống!');
      setActiveTab('general');
      setLangTab('vi');
      return;
    }
    saveMutation.mutate();
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
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cài Đặt Hệ Thống & Cấu Hình Website</h1>
          <p className="text-xs text-slate-500 mt-1">Cấu hình thông tin doanh nghiệp, cổng thanh toán, chi nhánh và thông tin liên hệ</p>
        </div>
        <div className="flex items-center gap-2">
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
              Slider Hero, Video nền, khối Điểm đến nổi bật và Đánh giá khách hàng được quản lý tập trung tại module Giao Diện
            </p>
          </div>
        </div>
        <Link
          href="/admin/appearance"
          className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold px-4 py-2 rounded-xl border border-blue-200 shadow-2xs transition-all shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
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
          <div className="space-y-5 animate-in fade-in duration-200 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Thông Tin Chuyển Khoản Ngân Hàng & Thanh Toán</h2>

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

            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <div>
                <div className="font-semibold text-slate-800">Cho Phép Đặt Dịch Vụ Trực Tuyến</div>
                <div className="text-[11px] text-slate-500">Bật hoặc tắt tính năng đặt chỗ và thanh toán trên toàn website</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBooking}
                  onChange={(e) => setEnableBooking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
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
    </div>
  );
}
