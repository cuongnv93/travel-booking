'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, Shield, AlertCircle, ShieldAlert, ArrowLeft, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

function AdminLoginForm() {
  const router = useRouter();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50/30 to-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Back Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/vi" 
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" /> Quay lại trang chủ Travel
        </Link>
      </div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-2xl shadow-blue-500/10 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            T
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2 pt-2">
            Admin CMS Login <Shield className="w-5 h-5 text-blue-600" />
          </h1>
          <p className="text-xs text-slate-500">Đăng nhập vào Hệ Thống Quản Trị Travel Control Panel</p>
        </div>

        {/* Expired Warning */}
        {isExpired && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5 shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập tài khoản Admin.</span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Email Admin</label>
            <Input
              type="email"
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              placeholder="admin@travel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-50/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 h-11 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Mật khẩu Admin</label>
            <Input
              type="password"
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-50/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 h-11 text-xs font-medium"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all mt-6"
          >
            Đăng Nhập Quản Trị CMS
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Tài khoản demo mặc định: </span>
          <span className="font-mono font-bold text-slate-800">admin@travel.com</span>
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
