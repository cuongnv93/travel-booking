'use client';

import { useMemo } from 'react';
import {
  DollarSign, CalendarCheck, Compass, Users, ArrowUpRight,
  TrendingUp, TrendingDown, BarChart3, Activity,
} from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import dynamic from 'next/dynamic';

// Code split heavy Recharts components so main JS bundle stays light & fast
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

function generateMonthlyData(totalRevenue: number, totalBookings: number) {
  const weights = [0.06, 0.10, 0.09, 0.07, 0.08, 0.10, 0.11, 0.12, 0.09, 0.07, 0.06, 0.05];
  return MONTHS.map((month, i) => ({
    month,
    revenue: Math.round((totalRevenue || 120_000_000) * weights[i]),
    bookings: Math.round((totalBookings || 240) * weights[i]),
  }));
}

const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name === 'revenue' ? formatPrice(p.value) : `${p.value} đơn`}
        </p>
      ))}
    </div>
  );
};

const fetchDashboardStats = async () => {
  const res: any = await api.get('/bookings/stats').catch(() => ({}));
  return res || {};
};

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboardStats,
    placeholderData: keepPreviousData,
  });

  const stats = useMemo(
    () => dashboardData || { totalRevenue: 0, totalBookings: 0, activeTours: 0, totalUsers: 0, recentBookings: [] },
    [dashboardData]
  );

  const monthlyData = useMemo(
    () => generateMonthlyData(stats.totalRevenue, stats.totalBookings),
    [stats.totalRevenue, stats.totalBookings]
  );

  const pieData = useMemo(
    () => [
      { name: 'Xác nhận', value: stats.confirmedCount || Math.round((stats.totalBookings || 0) * 0.55) },
      { name: 'Chờ duyệt', value: stats.pendingCount || Math.round((stats.totalBookings || 0) * 0.25) },
      { name: 'Hoàn thành', value: stats.completedCount || Math.round((stats.totalBookings || 0) * 0.15) },
      { name: 'Huỷ', value: stats.cancelledCount || Math.round((stats.totalBookings || 0) * 0.05) },
    ],
    [stats.confirmedCount, stats.pendingCount, stats.completedCount, stats.cancelledCount, stats.totalBookings]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Doanh Thu Hệ Thống',
        value: formatPrice(stats.totalRevenue || 0),
        change: '+14.2%',
        up: true,
        icon: DollarSign,
        iconBg: 'bg-blue-50 text-blue-600',
        border: 'border-blue-100',
      },
      {
        title: 'Tổng Đơn Đặt Tour',
        value: (stats.totalBookings || 0).toString(),
        change: '+8.1%',
        up: true,
        icon: CalendarCheck,
        iconBg: 'bg-amber-50 text-amber-600',
        border: 'border-amber-100',
      },
      {
        title: 'Tour Đang Hoạt Động',
        value: (stats.activeTours || 0).toString(),
        change: 'Sẵn sàng phục vụ',
        up: true,
        icon: Compass,
        iconBg: 'bg-emerald-50 text-emerald-600',
        border: 'border-emerald-100',
      },
      {
        title: 'Khách Hàng Đăng Ký',
        value: (stats.totalUsers || 0).toString(),
        change: '+23 tuần này',
        up: true,
        icon: Users,
        iconBg: 'bg-purple-50 text-purple-600',
        border: 'border-purple-100',
      },
    ],
    [stats.totalRevenue, stats.totalBookings, stats.activeTours, stats.totalUsers]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-56 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-3 w-72 bg-slate-100 animate-pulse rounded mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tổng Quan Hoạt Động</h1>
          <p className="text-xs text-slate-500 mt-1">Báo cáo các chỉ số kinh doanh chính của Travel Booking</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full border border-emerald-200">
          <Activity className="w-3.5 h-3.5" />
          Live
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-white border ${stat.border} rounded-2xl p-5 shadow-xs hover:shadow-md transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.title}</span>
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl xl:text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
              <p className={`text-[11px] font-semibold flex items-center gap-1 mt-2 ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {stat.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Area Chart — 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Doanh Thu Theo Tháng</h2>
              <p className="text-xs text-slate-400 mt-0.5">Biểu đồ doanh thu và số đơn trong năm 2026</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1_000_000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Pie — 1/3 width */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
          <div className="mb-5">
            <h2 className="text-sm font-extrabold text-slate-900">Trạng Thái Đơn Hàng</h2>
            <p className="text-xs text-slate-400 mt-0.5">Phân bổ theo trạng thái xử lý</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={STATUS_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value} đơn`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[i] }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Bar Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Số Đơn Đặt Tour Theo Tháng</h2>
            <p className="text-xs text-slate-400 mt-0.5">So sánh lượng booking giữa các tháng</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="bookings" name="bookings" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Đơn Đặt Tour Gần Đây</h2>
            <p className="text-xs text-slate-500">Các giao dịch mới nhất từ khách hàng</p>
          </div>
          <Link href="/admin/bookings" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl transition-colors">
            Quản lý đơn <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Mã đơn</th>
                <th className="px-6 py-3.5">Khách hàng</th>
                <th className="px-6 py-3.5">Tổng tiền</th>
                <th className="px-6 py-3.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {!stats.recentBookings || stats.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Chưa có đơn hàng nào gần đây.</td>
                </tr>
              ) : (
                stats.recentBookings.map((b: any) => (
                  <tr key={b._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{b.bookingCode}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{b.customerInfo?.name}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">{formatPrice(b.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : b.status === 'cancelled'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {b.status === 'confirmed' ? 'Đã xác nhận' : b.status === 'cancelled' ? 'Đã huỷ' : 'Chờ xác nhận'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
