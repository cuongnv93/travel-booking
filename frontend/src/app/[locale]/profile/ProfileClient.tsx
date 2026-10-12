'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getLocalizedError } from '@/lib/errorUtils';

export default function ProfileClient() {
  const router = useRouter();
  const locale = useParams().locale as string;
  const t = useTranslations('profile');
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login?expired=true`);
      return;
    }
    if (user) {
      setName(user.name || '');
      setPhone((user as any).phone || '');
      setAddress((user as any).address || '');
    }
  }, [user, isAuthenticated, router, locale]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const res: any = await api.put('/auth/profile', { name, phone, address });
      if (res) {
        setUser(res);
        setSuccess(true);
      }
    } catch (err: any) {
      setError(getLocalizedError(err, locale, t('updateError')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="container mx-auto px-4 py-12 mt-20 max-w-4xl"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-500 text-sm">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/profile/bookings`}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          {t('viewBookings')}
        </Link>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{t('successUpdate')}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('nameLabel')}</label>
              <Input
                icon={<User className="w-4 h-4 text-slate-400" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('emailLabel')}</label>
              <Input
                disabled
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                value={user?.email || ''}
                className="bg-slate-50 opacity-70"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('phoneLabel')}</label>
              <Input
                icon={<Phone className="w-4 h-4 text-slate-400" />}
                placeholder="0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('roleLabel')}</label>
              <div className="h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>{user?.role === 'admin' ? t('roleAdmin') : t('roleCustomer')}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('addressLabel')}</label>
            <Input
              icon={<MapPin className="w-4 h-4 text-slate-400" />}
              placeholder={t('addressPlaceholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" isLoading={loading} className="px-8 h-12 rounded-xl gap-2 font-bold">
              <Save className="w-4 h-4" />
              {t('saveBtn')}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
