'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, AlertCircle, ShieldAlert, ArrowLeft, Info } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('admin@travel.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res: any = await api.post('/auth/login', { email, password });
      
      if (res.user?.role !== 'admin') {
        setError('Tài khoản này không có quyền quản trị viên (Admin). Vui lòng dùng tài khoản Admin.');
        setLoading(false);
        return;
      }

      login(res.user, res.accessToken);
      window.location.href = '/admin';
    } catch (err: any) {
      console.error('Admin Auth error:', err);
      setError(err.response?.data?.message || 'Đăng nhập Admin thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white relative">
      {/* Top Back Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/vi" 
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" /> Quay lại trang chủ
        </Link>
      </div>

      <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-xl p-7 shadow-xs space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="relative w-16 h-16 mx-auto mb-2 drop-shadow-md">
            <Image
              src="/timesgreen-logo.png"
              alt="TimesGreen Admin Logo"
              width={64}
              height={64}
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-black tracking-tight pt-1 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">
            TimesGreen
          </h1>
          <p className="text-xs text-slate-500 font-medium">Control Panel & Quản Trị Dịch Vụ</p>
        </div>

        {/* Expired Warning */}
        {isExpired && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập tài khoản Admin.</span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Email Quản Trị</label>
            <Input
              type="email"
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              placeholder="admin@travel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 h-10 text-xs font-medium rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Mật Khẩu</label>
            <Input
              type="password"
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 h-10 text-xs font-medium rounded-lg"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors mt-4"
          >
            Đăng Nhập CMS
          </Button>
        </form>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Demo mặc định: </span>
          <span className="font-mono font-semibold text-slate-800">admin@travel.com</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 text-slate-500 flex items-center justify-center text-xs">Đang tải trang đăng nhập Admin...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
