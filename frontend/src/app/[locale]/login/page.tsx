'use client';

import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, Phone, AlertCircle, ShieldAlert, Sparkles, Compass } from 'lucide-react';
import api from '@/lib/api';

function UserLoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = (useParams()?.locale as string) || 'vi';
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';
  const login = useAuthStore(state => state.login);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res: any = await api.post('/auth/login', { email, password });
        login(res.user, res.accessToken);
        if (res.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(`/${locale}`);
        }
      } else {
        const res: any = await api.post('/auth/register', { name, email, password, phone });
        login(res.user, res.accessToken);
        router.push(`/${locale}`);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || t('loginError') || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Image Side */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 p-12 items-center justify-center relative overflow-hidden group">
        <img
          src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&auto=format&fit=crop"
          alt="Du lịch Việt Nam - Vịnh Hạ Long"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />

        <div className="relative z-10 text-white max-w-lg space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
            {t('heroTitle')}
          </h1>

          <p className="text-base text-blue-100/90 leading-relaxed drop-shadow-sm font-medium">
            {t('heroDesc')}
          </p>

          <div className="pt-4 flex items-center gap-4 text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <Compass className="w-4 h-4 text-amber-300" /> {t('badgeProvinces')}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-amber-300" /> {t('badgeQuality')}
            </span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? t('login') : t('register')}
            </h2>
            <p className="text-slate-500">{t('welcome')}</p>
          </div>

          {isExpired && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{t('sessionExpired')}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  icon={<User className="w-5 h-5" />}
                  placeholder={t('name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  icon={<Phone className="w-5 h-5" />}
                  placeholder={t('phone')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </>
            )}
            <Input
              type="email"
              icon={<Mail className="w-5 h-5" />}
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" size="lg" isLoading={loading} className="w-full h-12 rounded-xl mt-4">
              {isLogin ? t('loginBtn') : t('registerBtn')}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            {isLogin ? t('noAccount') : t('hasAccount')}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-blue-600 font-semibold hover:underline"
            >
              {isLogin ? t('register') : t('login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">Đang tải...</div>}>
      <UserLoginForm />
    </Suspense>
  );
}
