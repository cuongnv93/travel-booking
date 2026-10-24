'use client';

import '../globals.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { NextIntlClientProvider } from 'next-intl';
import viMessages from '@/messages/vi.json';
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  Users,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Newspaper,
  Building2,
  Utensils,
  Settings,
  Plane,
  ExternalLink,
  FileText,
  Tag,
  PhoneCall,
  Loader2,
  LayoutTemplate,
  Palette,
} from 'lucide-react';
import { Providers } from '../[locale]/providers';
import { AdminToastContainer } from '@/components/admin/common/AdminToastContainer';

const NAV_GROUPS = [
  {
    label: 'Kinh doanh & Đặt chỗ',
    items: [
      { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
      { label: 'Đơn Đặt Dịch Vụ', href: '/admin/bookings', icon: CalendarCheck },
      { label: 'Đăng Ký Tư Vấn', href: '/admin/consultations', icon: PhoneCall },
      { label: 'Mã Giảm Giá', href: '/admin/coupons', icon: Tag },
    ]
  },
  {
    label: 'Sản phẩm & Dịch vụ',
    items: [
      { label: 'Quản lý Tours', href: '/admin/tours', icon: Compass },
      { label: 'Khách Sạn & Resort', href: '/admin/hotels', icon: Building2 },
      { label: 'Vé Máy Bay', href: '/admin/flights', icon: Plane },
      { label: 'Đặc Sản Địa Phương', href: '/admin/specialties', icon: Utensils },
    ]
  },
  {
    label: 'Giao diện & Nội dung',
    items: [
      { label: 'Giao Diện & Trang Chủ', href: '/admin/appearance', icon: LayoutTemplate },
      { label: 'Trang Tĩnh (Pages)', href: '/admin/pages', icon: FileText },
      { label: 'Tin Tức & Bài Viết', href: '/admin/news', icon: Newspaper },
    ]
  },
  {
    label: 'Cấu hình hệ thống',
    items: [
      { label: 'Cài Đặt Hệ Thống', href: '/admin/settings', icon: Settings },
      { label: 'Tài Khoản Users', href: '/admin/users', icon: Users },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    try {
      const authData = localStorage.getItem('auth-storage');
      const parsed = authData ? JSON.parse(authData) : null;
      const token = parsed?.state?.accessToken;
      const savedUser = parsed?.state?.user;

      if (!token || !savedUser || savedUser.role !== 'admin') {
        setIsAuthorized(false);
        window.location.href = '/admin/login?expired=true';
        return;
      }
      setIsAuthorized(true);
    } catch {
      setIsAuthorized(false);
      window.location.href = '/admin/login?expired=true';
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-xs font-medium text-slate-400">Đang xác thực quyền quản trị...</p>
        </div>
      </div>
    );
  }

  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const currentNav = allItems.find(item => item.href === pathname) || allItems[0];

  return (
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <Providers>
        <div className="flex h-screen overflow-hidden bg-slate-50/70 antialiased font-sans text-slate-800">
          {/* Dark Sidebar */}
          <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 text-slate-300 select-none z-30">
            {/* Brand Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-xs">
                  <Image
                    src="/timesgreen-logo.png"
                    alt="TimesGreen Logo"
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400">TimesGreen</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-mono font-medium">CMS</span>
                  </div>
                  <span className="block text-[10px] text-slate-500 font-medium font-mono">Control Center</span>
                </div>
              </div>
            </div>

            {/* Navigation Groups */}
            <div className="px-3 py-4 flex-1 space-y-5 overflow-y-auto">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={true}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                            isActive
                              ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-blue-500'
                              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 font-medium'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Shortcuts & Logout */}
            <div className="p-3 border-t border-slate-800/80 space-y-0.5">
              <Link
                href="/vi"
                target="_blank"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                Xem website chính
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="text-slate-400">Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-900 font-semibold">{currentNav.label}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm trong CMS..."
                    className="w-64 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
                  />
                </div>

                <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative border border-slate-200 cursor-pointer">
                  <Bell className="w-4 h-4 text-slate-600" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5" />
                </button>

                <div className="h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center ring-1 ring-slate-800">
                    {user?.name ? user.name[0].toUpperCase() : 'A'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'Administrator'}</p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{user?.email || 'admin@travel.com'}</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Scrollable Canvas */}
            <main className="flex-1 overflow-auto p-8 bg-slate-50/60">
              <div className="max-w-7xl mx-auto space-y-6">
                {children}
              </div>
            </main>
          </div>
          <AdminToastContainer />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
