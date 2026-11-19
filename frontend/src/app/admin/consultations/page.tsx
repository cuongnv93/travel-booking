'use client';

import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import {
  PhoneCall,
  Search,
  Filter,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Globe,
  RefreshCw,
  MessageSquare,
  FileSpreadsheet,
  Eye,
  Copy,
  X,
  User,
  Users,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminPagination } from '@/components/admin/common/AdminPagination';
import { AdminConfirmModal } from '@/components/admin/common/AdminConfirmModal';
import { exportToCsv } from '@/lib/exportCsv';
import { toast } from '@/stores/toastStore';

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
  onView,
  isUpdating,
}: {
  item: ConsultationItem;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onView: (item: ConsultationItem) => void;
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
        {item.guests && (
          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3" />
            <span>{item.guests} khách</span>
          </div>
        )}
      </td>

      <td className="px-6 py-4 max-w-sm">
        {item.notes ? (
          <div
            onClick={() => onView(item)}
            className="group relative cursor-pointer text-slate-700 leading-relaxed bg-slate-50 hover:bg-blue-50/50 p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 max-h-32 overflow-y-auto whitespace-pre-wrap text-xs transition-colors"
            title="Nhấn để mở cửa sổ xem toàn bộ nội dung"
          >
            {item.notes}
            <div className="mt-1 text-[10px] text-blue-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-3 h-3" /> Xem chi tiết tin nhắn
            </div>
          </div>
        ) : (
          <span className="text-slate-400 italic text-xs">Không có ghi chú</span>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={item.status}
          disabled={isUpdating}
          onChange={(e) => onUpdateStatus(item._id, e.target.value)}
          className={`px-3 py-1.5 rounded-xl font-bold border text-xs focus:outline-none cursor-pointer ${statusBadge.bg}`}
        >
          <option value="pending">Chờ xử lý</option>
          <option value="contacted">Đã liên hệ</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </td>

      <td className="px-6 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onView(item)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Xem chi tiết yêu cầu & toàn bộ tin nhắn"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item._id)}
            disabled={isUpdating}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa yêu cầu"
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewingConsultation, setViewingConsultation] = useState<ConsultationItem | null>(null);

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
      toast.success('Đã cập nhật trạng thái tư vấn!');
    },
    onError: (err: any) => {
      toast.error('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/consultations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-consultations-stats'] });
      toast.success('Đã xóa yêu cầu tư vấn thành công!');
    },
    onError: (err: any) => {
      toast.error('Lỗi xóa yêu cầu: ' + (err.response?.data?.message || err.message));
    },
  });

  const handleUpdateStatus = useCallback((id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  }, [updateStatusMutation]);

  const handleDelete = useCallback((id: string) => {
    setDeleteTargetId(id);
  }, []);

  const handleView = useCallback((item: ConsultationItem) => {
    setViewingConsultation(item);
  }, []);

  const items: ConsultationItem[] = useMemo(() => {
    return data?.items || [];
  }, [data]);

  // Pagination slice
  const totalPages = Math.ceil(items.length / pageSize) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  // Export to CSV
  const handleExportCsv = () => {
    if (items.length === 0) {
      toast.warning('Không có dữ liệu yêu cầu tư vấn để xuất!');
      return;
    }

    exportToCsv('danh_sach_tu_van_khach_hang', items, [
      { key: 'name', label: 'Tên Khách Hàng' },
      { key: 'phone', label: 'Số Điện Thoại' },
      { key: 'email', label: 'Email' },
      {
        key: 'type',
        label: 'Loại Dịch Vụ',
        formatter: (item) =>
          item.type === 'visa' ? 'Visa' : item.type === 'tour' ? 'Tour' : item.type === 'hotel' ? 'Khách sạn' : 'Chung'
      },
      { key: 'country', label: 'Quốc Gia / Điểm Đến' },
      { key: 'travelDate', label: 'Ngày Đi Dự Kiến' },
      { key: 'notes', label: 'Ghi Chú Yêu Cầu' },
      {
        key: 'status',
        label: 'Trạng Thái',
        formatter: (item) =>
          item.status === 'pending'
            ? 'Chờ xử lý'
            : item.status === 'contacted'
            ? 'Đã liên hệ'
            : item.status === 'completed'
            ? 'Hoàn thành'
            : 'Đã hủy'
      },
      {
        key: 'createdAt',
        label: 'Thời Gian Gửi',
        formatter: (item) => item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''
      },
    ]);
  };

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất CSV
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-medium shadow-2xs transition-colors w-fit cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Làm Mới</span>
          </button>
        </div>
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

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-2">
        {[
          { id: 'all', label: 'Tất Cả' },
          { id: 'pending', label: 'Chờ Xử Lý' },
          { id: 'contacted', label: 'Đã Liên Hệ' },
          { id: 'completed', label: 'Hoàn Thành' },
          { id: 'cancelled', label: 'Đã Hủy' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setFilterStatus(tab.id);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, quốc gia..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="all">Tất cả dịch vụ</option>
              <option value="visa">Visa Du Lịch</option>
              <option value="general">Liên hệ chung</option>
              <option value="tour">Tour Du Lịch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Đang tải danh sách tư vấn...
          </div>
        ) : paginatedItems.length === 0 ? (
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
                  <th className="px-6 py-3.5 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <ConsultationRow
                    key={item._id}
                    item={item}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                    onView={handleView}
                    isUpdating={updateStatusMutation.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {/* Consultation Detail & Long Notes Modal */}
      {viewingConsultation && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingConsultation(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Chi Tiết Yêu Cầu Tư Vấn
                  </h3>
                  <p className="text-xs text-slate-500">
                    Khách hàng: <span className="font-bold text-slate-800">{viewingConsultation.name}</span> • Gửi lúc {new Date(viewingConsultation.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingConsultation(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Contact info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">Số Điện Thoại:</div>
                  <a
                    href={`tel:${viewingConsultation.phone}`}
                    className="font-bold text-sm text-blue-600 hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{viewingConsultation.phone}</span>
                  </a>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">Email:</div>
                  {viewingConsultation.email ? (
                    <a
                      href={`mailto:${viewingConsultation.email}`}
                      className="font-bold text-sm text-slate-800 hover:text-blue-600 hover:underline flex items-center gap-1.5 truncate"
                    >
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{viewingConsultation.email}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Chưa cung cấp email</span>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">Loại Dịch Vụ & Mục Tiêu:</div>
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <span className="capitalize">{viewingConsultation.type}</span>
                    {viewingConsultation.country && (
                      <span className="text-purple-700 font-semibold">({viewingConsultation.country})</span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">Ngày Đi Dự Kiến & Số Khách:</div>
                  <div className="font-bold text-xs text-slate-800">
                    {viewingConsultation.travelDate || 'Chưa định ngày'} {viewingConsultation.guests ? `• ${viewingConsultation.guests} khách` : ''}
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs">
                <span className="font-bold text-blue-900">Trạng Thái Xử Lý:</span>
                <select
                  value={viewingConsultation.status}
                  disabled={updateStatusMutation.isPending}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    handleUpdateStatus(viewingConsultation._id, newStatus);
                    setViewingConsultation((prev) => prev ? { ...prev, status: newStatus as any } : null);
                  }}
                  className="px-3 py-1.5 rounded-xl font-bold border border-blue-200 bg-white text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="contacted">Đã liên hệ</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              {/* Full Message / Notes Scrollable Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nội Dung Yêu Cầu / Ghi Chú Đầy Đủ</span>
                  </label>
                  {viewingConsultation.notes && (
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator?.clipboard?.writeText) {
                          navigator.clipboard.writeText(viewingConsultation.notes || '');
                          toast.success('Đã sao chép nội dung tin nhắn!');
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Sao chép tin nhắn</span>
                    </button>
                  )}
                </div>

                <div className="max-h-[38vh] overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap select-text">
                  {viewingConsultation.notes ? (
                    viewingConsultation.notes
                  ) : (
                    <span className="text-slate-400 italic">Khách hàng không để lại ghi chú bổ sung.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  const id = viewingConsultation._id;
                  setViewingConsultation(null);
                  handleDelete(id);
                }}
                className="px-3 py-1.5 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa yêu cầu</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingConsultation(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) {
            await deleteMutation.mutateAsync(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Xác nhận xóa yêu cầu tư vấn"
        message="Bạn có chắc chắn muốn xóa yêu cầu tư vấn này khỏi hệ thống? Hành động này không thể hoàn tác."
        confirmText="Xác nhận xóa"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
