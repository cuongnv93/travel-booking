'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, AlertCircle, ShieldAlert, ArrowLeft, UserCircle2, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';
  const login = useAuthStore((state) => state.login);
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCurrentMember = Boolean(currentUser && currentUser.role !== 'admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res: any = await api.post('/auth/login', {
        email,
        password,
        roleRequired: 'admin',
      });
      
      if (res.user?.role !== 'admin') {
        setError('Tài khoản của bạn là tài khoản thành viên, không có quyền truy cập trang quản trị CMS. Vui lòng đăng nhập tại website khách hàng.');
        setLoading(false);
        return;
      }

      login(res.user, res.accessToken);
      window.location.href = '/admin';
    } catch (err: any) {
      console.error('Admin Auth error:', err);
      const backendMsg = err.response?.data?.message;
      setError(
        backendMsg ||
        'Đăng nhập Admin thất bại. Vui lòng kiểm tra lại email và mật khẩu tài khoản quản trị.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white relative">
      {/* Top Back Link */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
        <Link 
          href="/vi" 
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" /> Quay lại trang chủ
        </Link>
        <Link 
          href="/vi/login" 
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-500" /> Đăng nhập khách hàng
        </Link>
      </div>

      <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-xl p-7 shadow-xs space-y-5 relative z-10">
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
            TimesGreen CMS
          </h1>
          <p className="text-xs text-slate-500 font-medium">Cổng Quản Trị Hệ Thống (Chỉ Dành Cho Quản Trị Viên)</p>
        </div>

        {/* Notice if logged in as regular member */}
        {isCurrentMember && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <UserCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Đang đăng nhập tài khoản Thành viên:</p>
                <p className="text-blue-700 font-mono text-[11px] truncate">{currentUser?.email}</p>
                <p className="text-[11px] text-blue-800/80 mt-1">
                  Trang CMS chỉ cấp phép cho Quản trị viên (Admin). Bạn có thể quay lại trang khách hàng hoặc đăng xuất để đổi tài khoản.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-blue-200/60">
              <Link
                href="/vi"
                className="flex-1 text-center py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 transition-colors"
              >
                Về website khách hàng
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {/* Expired Warning */}
        {isExpired && !isCurrentMember && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập tài khoản Quản trị viên.</span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {error.includes('thành viên') && (
              <Link
                href="/vi/login"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 underline hover:text-rose-950"
              >
                Chuyển sang trang đăng nhập khách hàng <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            )}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Email Quản Trị Viên</label>
            <Input
              type="email"
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 h-10 text-xs font-medium rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Mật Khẩu Quản Trị</label>
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
            className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors mt-4 cursor-pointer"
          >
            Đăng Nhập CMS
          </Button>
        </form>

        <div className="text-center text-[11px] text-slate-400">
          Chỉ Quản Trị Viên (Admin) mới có quyền truy cập khu vực này.
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
