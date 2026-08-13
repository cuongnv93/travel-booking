'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useUiStore } from '@/stores/uiStore';
import { NAV_ITEMS } from '@/lib/constants';

export default function MobileMenu() {
  const t = useTranslations();
  const locale = useParams().locale as string;
  const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-[999] xl:hidden backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-[1000] xl:hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6 text-slate-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    href={`/${locale}${item.path === '/' ? '' : item.path}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-4 rounded-xl text-lg font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {t(item.i18nKey)}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
