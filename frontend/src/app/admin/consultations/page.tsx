'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import {
  PhoneCall, CheckCircle2, Clock, XCircle, Search, Filter,
  Trash2, Mail, Phone, Calendar, Globe, User, RefreshCw, MessageSquare
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface ConsultationItem {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  country?: string;
  travelDate?: string;
  guests?: number | string;
  type: 'visa' | 'tour' | 'hotel' | 'general';
  notes?: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  createdAt: string;
}

const ConsultationRow = memo(function ConsultationRow({
  item,
  onUpdateStatus,
  onDelete,
  isUpdating,
}: {
  item: ConsultationItem;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}) {
  const statusBadge = {
    pending: { label: 'Chờ xử lý', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    contacted: { label: 'Đã liên hệ', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
    completed: { label: 'Hoàn thành', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    cancelled: { label: 'Đã hủy', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
  }[item.status] || { label: item.status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

  const typeBadge = {
    visa: { label: 'Visa Du Lịch', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    tour: { label: 'Tour', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
    hotel: { label: 'Khách sạn', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    general: { label: 'Liên hệ chung', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
  }[item.type] || { label: item.type, bg: 'bg-slate-50 text-slate-700 border-slate-200' };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
      <td className="px-6 py-4">
        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
        <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
          <Calendar className="w-3 h-3" />
          <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="space-y-1">
          <a
            href={`tel:${item.phone}`}
            className="flex items-center gap-1.5 font-bold text-blue-600 hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{item.phone}</span>
          </a>
          {item.email && (
            <a
              href={`mailto:${item.email}`}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{item.email}</span>
            </a>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full font-bold border text-[11px] inline-flex items-center gap-1 ${typeBadge.bg}`}>
          {item.type === 'visa' && <Globe className="w-3 h-3" />}
          {typeBadge.label}
        </span>
        {item.country && (
          <div className="text-slate-800 font-semibold mt-1">
            Mục tiêu: <span className="text-purple-700">{item.country}</span>
          </div>
        )}
        {item.travelDate && (
          <div className="text-slate-500 text-[11px]">
            Ngày đi: {item.travelDate}
          </div>
        )}
      </td>

      <td className="px-6 py-4 max-w-xs">
        {item.notes ? (
          <div className="text-slate-700 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-3">
            {item.notes}
          </div>
        ) : (
          <span className="text-slate-400 italic">Không có ghi chú thêm</span>
        )}
      </td>

      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full font-bold border text-[11px] inline-block ${statusBadge.bg}`}>
          {statusBadge.label}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <select
            value={item.status}
            disabled={isUpdating}
            onChange={(e) => onUpdateStatus(item._id, e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="pending">Chờ xử lý</option>
            <option value="contacted">Đã liên hệ</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Hủy bỏ</option>
          </select>
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            title="Xóa yêu cầu"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function AdminConsultationsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-consultations', filterType, filterStatus, searchTerm],
    queryFn: async () => {
      const res: any = await api.get('/consultations', {
        params: {
          type: filterType,
          status: filterStatus,
          search: searchTerm,
        },
      });
      return res;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-consultations-stats'],
    queryFn: async () => {
      const res: any = await api.get('/consultations/stats');
      return res;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/consultations/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-consultations-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/consultations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-consultations-stats'] });
    },
  });

  const handleUpdateStatus = useCallback((id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  }, [updateStatusMutation]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu tư vấn này?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const items: ConsultationItem[] = useMemo(() => {
    return data?.items || [];
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-600" />
            <span>Yêu Cầu Tư Vấn & Liên Hệ</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Quản lý tất cả khách hàng gửi form đăng ký tư vấn Visa và form liên hệ hỗ trợ từ website
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-medium shadow-2xs transition-colors w-fit cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Tổng Yêu Cầu</div>
          <div className="text-2xl font-bold font-mono text-slate-900">{stats?.total ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Chờ Xử Lý</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">{stats?.pending ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Đã Liên Hệ</span>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600">{stats?.contacted ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Hoàn Thành</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{stats?.completed ?? 0}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, quốc gia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tất cả dịch vụ</option>
              <option value="visa">Visa Du Lịch</option>
              <option value="general">Liên hệ chung</option>
              <option value="tour">Tour Du Lịch</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="contacted">Đã liên hệ</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Đang tải danh sách tư vấn...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            Không tìm thấy yêu cầu tư vấn nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Khách Hàng</th>
                  <th className="px-6 py-3.5">Thông Tin Liên Hệ</th>
                  <th className="px-6 py-3.5">Dịch Vụ & Mục Tiêu</th>
                  <th className="px-6 py-3.5">Nội Dung / Ghi Chú</th>
                  <th className="px-6 py-3.5">Trạng Thái</th>
                  <th className="px-6 py-3.5">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <ConsultationRow
                    key={item._id}
                    item={item}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                    isUpdating={updateStatusMutation.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
