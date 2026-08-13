'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User as UserIcon, Menu, LogOut, Shield, ChevronDown } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { useUiStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations();
  const locale = useParams().locale as string;
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Prefetch on hover — routes are pre-fetched when user hovers nav links
  const handleNavHover = useCallback((path: string) => {
    const href = `/${locale}${path === '/' ? '' : path}`;
    router.prefetch(href);
  }, [locale, router]);

  const { toggleMobileMenu, toggleSearch } = useUiStore();
  const cartItems = useCartStore((state) => state.items);
  const cartItemsCount = cartItems.reduce(
    (total, item) => total + item.guests.adults + item.guests.children,
    0
  );
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.includes('/login') || pathname?.includes('/register')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    router.push(`/${locale}`);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-[background-color,padding,box-shadow] duration-300',
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between flex-nowrap gap-2 md:gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0" prefetch={true}>
            <span className={cn(
              "text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500",
              !isScrolled && pathname === `/${locale}` ? "text-white drop-shadow-md bg-none" : ""
            )}>
              Travel
            </span>
          </Link>

          {/* Desktop Nav — prefetch on hover for instant transitions */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 shrink-0">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={`/${locale}${item.path === '/' ? '' : item.path}`}
                prefetch={false}
                onMouseEnter={() => handleNavHover(item.path)}
                onFocus={() => handleNavHover(item.path)}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-blue-600 whitespace-nowrap',
                  !isScrolled && pathname === `/${locale}` ? 'text-white/90 hover:text-white' : 'text-slate-700'
                )}
              >
                {t(item.i18nKey)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <LanguageSwitcher isScrolled={isScrolled} isHome={pathname === `/${locale}`} />

            {/* Auth Dropdown or Login Button */}
            {isAuthenticated && user ? (
              <div className="relative hidden sm:block shrink-0">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={cn(
                    'flex items-center gap-2 py-1.5 px-3 rounded-full text-sm font-medium transition-colors border border-transparent',
                    !isScrolled && pathname === `/${locale}`
                      ? 'text-white bg-white/10 hover:bg-white/20'
                      : 'text-slate-800 bg-slate-100 hover:bg-slate-200'
                  )}
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[90px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 text-sm text-slate-700 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-blue-50 text-blue-600 font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        {t('nav.admin')}
                      </Link>
                    )}

                    <Link
                      href={`/${locale}/cart`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 text-slate-500" />
                      {t('nav.myCart')}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                prefetch={true}
                className={cn(
                  'p-2 rounded-full transition-colors hover:bg-slate-100 hidden sm:flex shrink-0',
                  !isScrolled && pathname === `/${locale}` ? 'text-white hover:bg-white/20' : 'text-slate-700'
                )}
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}

            <Link
              href={`/${locale}/cart`}
              prefetch={true}
              className={cn(
                'p-2 rounded-full transition-colors hover:bg-slate-100 relative shrink-0',
                !isScrolled && pathname === `/${locale}` ? 'text-white hover:bg-white/20' : 'text-slate-700'
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleMobileMenu}
              className={cn(
                'p-2 rounded-full transition-colors hover:bg-slate-100 xl:hidden shrink-0',
                !isScrolled && pathname === `/${locale}` ? 'text-white hover:bg-white/20' : 'text-slate-700'
              )}
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
