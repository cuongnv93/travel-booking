'use client';

import '../globals.css';
import { useEffect } from 'react';
import Link from 'next/link';
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
  ShieldCheck,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { Providers } from '../[locale]/providers';

const NAV_GROUPS = [
  {
    label: 'Quản lý hệ thống',
    items: [
      { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
      { label: 'Quản lý Tours', href: '/admin/tours', icon: Compass },
      { label: 'Quản lý Bookings', href: '/admin/bookings', icon: CalendarCheck },
    ]
  },
  {
    label: 'Nội dung',
    items: [
      { label: 'Trang Tĩnh (Pages)', href: '/admin/pages', icon: FileText },
      { label: 'Tin Tức & Bài Viết', href: '/admin/news', icon: Newspaper },
      { label: 'Khách Sạn', href: '/admin/hotels', icon: Building2 },
      { label: 'Vé Máy Bay', href: '/admin/flights', icon: Plane },
      { label: 'Đặc Sản', href: '/admin/specialties', icon: Utensils },
    ]
  },
  {
    label: 'Hệ thống',
    items: [
      { label: 'Tài khoản Users', href: '/admin/users', icon: Users },
      { label: 'Cài Đặt', href: '/admin/settings', icon: Settings },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  useEffect(() => {
    if (pathname === '/admin/login') return;

    try {
      const authData = localStorage.getItem('auth-storage');
      const parsed = authData ? JSON.parse(authData) : null;
      const token = parsed?.state?.accessToken;
      const savedUser = parsed?.state?.user;

      if (!token || !savedUser || savedUser.role !== 'admin') {
        window.location.href = '/admin/login?expired=true';
      }
    } catch {
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

  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const currentNav = allItems.find(item => item.href === pathname) || allItems[0];

  return (
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <Providers>
        <div className="flex h-screen overflow-hidden bg-slate-50/70 antialiased font-sans text-slate-800">
          {/* Dark Sidebar */}
          <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 text-slate-300 select-none z-30">
            {/* Brand Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-black text-lg flex items-center justify-center">
                  T
                </div>
                <div>
                  <span className="font-extrabold text-white tracking-tight text-sm flex items-center gap-1">
                    Travel CMS <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  </span>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Control Panel</span>
                </div>
              </div>
            </div>

            {/* Navigation Groups */}
            {/* FIX: transition-colors instead of transition-all — prevents layout recalc on hover */}
            <div className="px-3.5 py-5 flex-1 space-y-6 overflow-y-auto">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={true}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Shortcuts & Logout */}
            <div className="p-3.5 border-t border-slate-800 space-y-0.5">
              <Link
                href="/vi"
                target="_blank"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                Xem trang web chính
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* FIX: Removed backdrop-blur-md — expensive GPU op causing frame drops. Using solid bg instead */}
            <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="text-slate-400">Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-900 font-bold">{currentNav.label}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm trong CMS..."
                    className="w-60 bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors relative border border-slate-200">
                  <Bell className="w-4 h-4 text-slate-600" />
                  <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-1.5 right-1.5" />
                </button>

                <div className="h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 text-white font-black text-xs flex items-center justify-center">
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
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
