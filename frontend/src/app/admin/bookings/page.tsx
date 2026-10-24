'use client';

import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Building2,
  Compass,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  User,
  Plane,
  Download,
  RotateCcw,
  CheckSquare,
  Square,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, getI18nText } from '@/lib/utils';
import { AdminPagination } from '@/components/admin/common/AdminPagination';
import { exportToCsv } from '@/lib/exportCsv';
import { toast } from '@/stores/toastStore';

const fetchAdminBookings = async () => {
  const res: any = await api.get('/bookings');
  return Array.isArray(res) ? res : (res?.data || []);
};

const fetchBookingStats = async () => {
  try {
    const res: any = await api.get('/bookings/stats');
    return res;
  } catch {
    return null;
  }
};

interface BookingTableRowProps {
  booking: any;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onSelectBooking: (booking: any) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  isUpdating: boolean;
}

const BookingTableRow = memo(function BookingTableRow({
  booking: b,
  isSelected,
  onToggleSelect,
  onSelectBooking,
  onUpdateStatus,
  isUpdating,
}: BookingTableRowProps) {
  const isHotel = b.type === 'hotel';
  const isFlight = b.type === 'flight';
  const serviceTitle = isHotel
    ? `${getI18nText(b.hotelId?.name, 'vi', 'Khách sạn')}${b.roomName ? ` (${b.roomName})` : ''}`
    : isFlight
    ? (`Chuyến bay ${b.flightId?.flightNumber || ''} (${b.flightId?.from || ''} - ${b.flightId?.to || ''})`.trim() || 'Vé máy bay')
    : getI18nText(b.tourId?.title, 'vi', 'Tour du lịch');

  const travelDate = b.travelDate || b.checkIn;
  const formattedDate = travelDate ? new Date(travelDate).toLocaleDateString('vi-VN') : 'N/A';

  return (
    <tr className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
      <td className="px-4 py-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(b._id)}
          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
        />
      </td>
      <td className="px-5 py-3 font-mono font-bold text-blue-600 text-xs">
        {b.bookingCode}
      </td>
      <td className="px-5 py-3">
        {isHotel ? (
          <span className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-purple-200 inline-flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Hotel
          </span>
        ) : isFlight ? (
          <span className="bg-sky-50 text-sky-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-sky-200 inline-flex items-center gap-1">
            <Plane className="w-3 h-3" /> Flight
          </span>
        ) : (
          <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-200 inline-flex items-center gap-1">
            <Compass className="w-3 h-3" /> Tour
          </span>
        )}
      </td>
      <td className="px-5 py-3">
        <p className="font-semibold text-slate-900">{b.customerInfo?.name || 'Khách vãng lai'}</p>
        <p className="text-[11px] text-slate-400 font-mono">{b.customerInfo?.phone || 'N/A'}</p>
      </td>
      <td className="px-5 py-3 font-semibold text-slate-900 max-w-[220px] truncate" title={serviceTitle}>
        {serviceTitle}
      </td>
      <td className="px-5 py-3 font-medium text-slate-600">
        {formattedDate}
      </td>
      <td className="px-5 py-3 font-extrabold text-slate-900">
        {formatPrice(b.totalPrice)}
      </td>
      <td className="px-5 py-3">
        {b.status === 'confirmed' ? (
          <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã xác nhận
          </span>
        ) : b.status === 'completed' ? (
          <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Hoàn thành
          </span>
        ) : b.status === 'cancelled' ? (
          <span className="bg-red-50 text-red-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-red-200 inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-600" /> Đã hủy
          </span>
        ) : (
          <span className="bg-amber-50 text-amber-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Chờ xác nhận
          </span>
        )}
      </td>
      <td className="px-5 py-3 text-right space-x-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onSelectBooking(b)}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" /> Chi tiết
        </button>

        {b.status === 'pending' && (
          <>
            <button
              type="button"
              onClick={() => onUpdateStatus(b._id, 'confirmed')}
              disabled={isUpdating}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              Xác nhận
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(b._id, 'cancelled')}
              disabled={isUpdating}
              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
          </>
        )}

        {b.status === 'confirmed' && (
          <>
            <button
              type="button"
              onClick={() => onUpdateStatus(b._id, 'completed')}
              disabled={isUpdating}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hoàn thành
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(b._id, 'cancelled')}
              disabled={isUpdating}
              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
          </>
        )}

        {b.status === 'cancelled' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(b._id, 'pending')}
            disabled={isUpdating}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Khôi phục
          </button>
        )}
      </td>
    </tr>
  );
});

export default function BookingsAdminPage() {
  const queryClient = useQueryClient();

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_desc' | 'price_asc'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Row selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Close booking details modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBooking) {
        setSelectedBooking(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBooking]);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: fetchAdminBookings,
    placeholderData: keepPreviousData,
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-booking-stats'],
    queryFn: fetchBookingStats,
    placeholderData: keepPreviousData,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-booking-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('Đã cập nhật trạng thái đơn hàng!');
    },
    onError: (err: any) => {
      toast.error('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    },
  });

  const handleUpdateStatus = useCallback(
    (id: string, newStatus: string) => {
      updateStatusMutation.mutate({ id, status: newStatus });
    },
    [updateStatusMutation]
  );

  // Bulk status update
  const handleBulkUpdateStatus = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Xác nhận đổi trạng thái của ${selectedIds.length} đơn hàng sang "${newStatus}"?`)) return;

    try {
      await Promise.all(
        selectedIds.map((id) => api.patch(`/bookings/${id}/status`, { status: newStatus }))
      );
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-booking-stats'] });
      setSelectedIds([]);
      toast.success(`Đã cập nhật ${selectedIds.length} đơn hàng thành công!`);
    } catch (err: any) {
      toast.error('Lỗi cập nhật hàng loạt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSelectBooking = useCallback((booking: any) => {
    setSelectedBooking(booking);
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Compute counts for tabs
  const counts = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b: any) => b.status === 'pending').length;
    const confirmed = bookings.filter((b: any) => b.status === 'confirmed').length;
    const completed = bookings.filter((b: any) => b.status === 'completed').length;
    const cancelled = bookings.filter((b: any) => b.status === 'cancelled').length;
    return { total, pending, confirmed, completed, cancelled };
  }, [bookings]);

  // Filtered & Sorted Bookings
  const filteredBookings = useMemo(() => {
    const s = search.toLowerCase().trim();

    return bookings
      .filter((b: any) => {
        const codeMatch = !s || (b.bookingCode || '').toLowerCase().includes(s);
        const nameMatch = !s || (b.customerInfo?.name || '').toLowerCase().includes(s);
        const emailMatch = !s || (b.customerInfo?.email || '').toLowerCase().includes(s);
        const phoneMatch = !s || (b.customerInfo?.phone || '').toLowerCase().includes(s);

        const statusMatch = !statusFilter || b.status === statusFilter;
        const typeMatch = !typeFilter || b.type === typeFilter;

        // Date range filter
        const bookingDate = b.travelDate || b.checkIn || b.createdAt;
        let dateMatch = true;
        if (bookingDate) {
          const bTime = new Date(bookingDate).getTime();
          if (fromDate) {
            const fTime = new Date(fromDate).setHours(0, 0, 0, 0);
            if (bTime < fTime) dateMatch = false;
          }
          if (toDate) {
            const tTime = new Date(toDate).setHours(23, 59, 59, 999);
            if (bTime > tTime) dateMatch = false;
          }
        }

        return (codeMatch || nameMatch || emailMatch || phoneMatch) && statusMatch && typeMatch && dateMatch;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (sortBy === 'price_desc') {
          return (b.totalPrice || 0) - (a.totalPrice || 0);
        }
        if (sortBy === 'price_asc') {
          return (a.totalPrice || 0) - (b.totalPrice || 0);
        }
        // Default newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [bookings, search, statusFilter, typeFilter, fromDate, toDate, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Handle Select All on current page
  const isAllCurrentSelected = useMemo(() => {
    if (paginatedBookings.length === 0) return false;
    return paginatedBookings.every((b: any) => selectedIds.includes(b._id));
  }, [paginatedBookings, selectedIds]);

  const handleToggleSelectAll = () => {
    if (isAllCurrentSelected) {
      const pageIds = new Set(paginatedBookings.map((b: any) => b._id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...paginatedBookings.map((b: any) => b._id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  // Export to CSV
  const handleExportCsv = (onlySelected = false) => {
    const targetData = onlySelected
      ? bookings.filter((b: any) => selectedIds.includes(b._id))
      : filteredBookings;

    if (targetData.length === 0) {
      toast.warning('Không có dữ liệu đơn hàng để xuất!');
      return;
    }

    exportToCsv('danh_sach_don_hang', targetData, [
      { key: 'bookingCode', label: 'Mã Đơn' },
      { key: 'type', label: 'Loại Dịch Vụ', formatter: (b) => b.type === 'hotel' ? 'Khách sạn' : b.type === 'flight' ? 'Vé máy bay' : 'Tour du lịch' },
      {
        key: 'serviceTitle',
        label: 'Tên Dịch Vụ',
        formatter: (b) =>
          b.type === 'hotel'
            ? `${getI18nText(b.hotelId?.name, 'vi', 'Khách sạn')}${b.roomName ? ` (${b.roomName})` : ''}`
            : b.type === 'flight'
            ? b.flightId?.flightNumber || 'Vé máy bay'
            : getI18nText(b.tourId?.title, 'vi', 'Tour du lịch')
      },
      { key: 'customerName', label: 'Tên Khách Hàng', formatter: (b) => b.customerInfo?.name || '' },
      { key: 'customerPhone', label: 'Số Điện Thoại', formatter: (b) => b.customerInfo?.phone || '' },
      { key: 'customerEmail', label: 'Email', formatter: (b) => b.customerInfo?.email || '' },
      {
        key: 'travelDate',
        label: 'Ngày Khởi Hành / Checkin',
        formatter: (b) => (b.travelDate || b.checkIn ? new Date(b.travelDate || b.checkIn).toLocaleDateString('vi-VN') : '')
      },
      { key: 'totalPrice', label: 'Tổng Tiền (VNĐ)', formatter: (b) => b.totalPrice || 0 },
      {
        key: 'status',
        label: 'Trạng Thái Đơn',
        formatter: (b) =>
          b.status === 'confirmed'
            ? 'Đã xác nhận'
            : b.status === 'completed'
            ? 'Đã hoàn thành'
            : b.status === 'cancelled'
            ? 'Đã hủy'
            : 'Chờ xác nhận'
      },
      {
        key: 'paymentStatus',
        label: 'Thanh Toán',
        formatter: (b) => b.paymentStatus === 'paid' ? 'Đã thanh toán' : b.paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 'Chưa thanh toán'
      },
      { key: 'createdAt', label: 'Ngày Đặt', formatter: (b) => b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '' },
    ]);
  };

  if (isLoading) return <AdminTableSkeleton cols={8} rows={7} />;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Đơn Đặt Tour & Khách Sạn</h1>
          <p className="text-xs text-slate-500 mt-1">Theo dõi, kiểm tra thông tin khách hàng, phân loại và duyệt đơn nhanh</p>
        </div>

        <button
          type="button"
          onClick={() => handleExportCsv(false)}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Xuất Danh Sách CSV
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng Đơn</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Compass className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{stats?.totalBookings || counts.total}</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Chờ Duyệt</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold font-mono text-amber-600">{counts.pending}</p>
            {counts.pending > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
                Cần xử lý
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đã Xác Nhận</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{counts.confirmed}</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hoàn Thành</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600 mt-2">{counts.completed}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng Doanh Thu</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-bold font-mono text-emerald-600 mt-2">{formatPrice(stats?.totalRevenue || 0)}</p>
        </div>
      </div>

      {/* Quick Status Tabs (Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-2">
        <button
          type="button"
          onClick={() => {
            setStatusFilter('');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            statusFilter === ''
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Tất Cả
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFilter === '' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {counts.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('pending');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Chờ Xác Nhận
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
            {counts.pending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('confirmed');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            statusFilter === 'confirmed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Đã Xác Nhận
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFilter === 'confirmed' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            {counts.confirmed}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('completed');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            statusFilter === 'completed'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Đã Hoàn Thành
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFilter === 'completed' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
            {counts.completed}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('cancelled');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            statusFilter === 'cancelled'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Đã Hủy
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFilter === 'cancelled' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'}`}>
            {counts.cancelled}
          </span>
        </button>
      </div>

      {/* Search & Advanced Filters */}
      <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn (TRV-...), tên khách, số điện thoại, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Service Type Filter */}
          <div className="md:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="">Tất cả dịch vụ</option>
              <option value="tour">Tour Du Lịch</option>
              <option value="hotel">Khách Sạn & Resort</option>
              <option value="flight">Vé Máy Bay</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
              >
                <option value="newest">Mới nhất trước</option>
                <option value="oldest">Cũ nhất trước</option>
                <option value="price_desc">Giá cao nhất</option>
                <option value="price_asc">Giá thấp nhất</option>
              </select>
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="md:col-span-3 flex items-center gap-1.5">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              title="Từ ngày"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              title="Đến ngày"
            />
          </div>
        </div>

        {/* Active Filters Reset Bar if filtered */}
        {(search || fromDate || toDate || typeFilter || statusFilter) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Tìm thấy <strong className="text-slate-900 font-bold">{filteredBookings.length}</strong> đơn phù hợp
            </span>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setTypeFilter('');
                setFromDate('');
                setToDate('');
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold">đơn hàng đang được chọn</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkUpdateStatus('confirmed')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Xác nhận ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => handleBulkUpdateStatus('completed')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Hoàn thành ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => handleBulkUpdateStatus('cancelled')}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Hủy đơn ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => handleExportCsv(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" /> Xuất ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    title="Chọn tất cả trên trang này"
                  />
                </th>
                <th className="px-5 py-3.5">Mã Đơn</th>
                <th className="px-5 py-3.5">Loại</th>
                <th className="px-5 py-3.5">Khách Hàng</th>
                <th className="px-5 py-3.5">Dịch Vụ Đặt</th>
                <th className="px-5 py-3.5">Ngày Khởi Hành</th>
                <th className="px-5 py-3.5">Tổng Tiền</th>
                <th className="px-5 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    <Compass className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy đơn đặt tour/khách sạn nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b: any) => (
                  <BookingTableRow
                    key={b._id}
                    booking={b}
                    isSelected={selectedIds.includes(b._id)}
                    onToggleSelect={handleToggleSelect}
                    onSelectBooking={handleSelectBooking}
                    onUpdateStatus={handleUpdateStatus}
                    isUpdating={updateStatusMutation.isPending}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Component */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredBookings.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {/* Booking Inspector Modal */}
      {selectedBooking && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBooking(null);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-extrabold text-blue-600">{selectedBooking.bookingCode}</span>
                <h2 className="text-base font-bold text-slate-900">Chi Tiết Đơn Đặt Dịch Vụ</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <p className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
                  <User className="w-4 h-4 text-blue-600" /> Thông Tin Khách Hàng Liên Hệ
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <p><span className="font-semibold text-slate-500">Họ tên:</span> {selectedBooking.customerInfo?.name}</p>
                  <p><span className="font-semibold text-slate-500">SĐT:</span> {selectedBooking.customerInfo?.phone}</p>
                  <p className="col-span-2"><span className="font-semibold text-slate-500">Email:</span> {selectedBooking.customerInfo?.email}</p>
                  {selectedBooking.customerInfo?.address && (
                    <p className="col-span-2"><span className="font-semibold text-slate-500">Địa chỉ:</span> {selectedBooking.customerInfo.address}</p>
                  )}
                  {(selectedBooking.customerInfo?.notes || selectedBooking.customerInfo?.note) && (
                    <p className="col-span-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60 text-amber-900">
                      <span className="font-bold">Ghi chú:</span> {selectedBooking.customerInfo.notes || selectedBooking.customerInfo.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <p className="font-bold text-slate-800 border-b border-slate-100 pb-1.5">Thông Tin Dịch Vụ</p>
                <p className="font-bold text-sm text-slate-900">
                  {selectedBooking.type === 'hotel'
                    ? `${getI18nText(selectedBooking.hotelId?.name, 'vi', 'Khách sạn')}${selectedBooking.roomName ? ` - ${selectedBooking.roomName}` : ''}`
                    : selectedBooking.type === 'flight'
                    ? (`Chuyến bay ${selectedBooking.flightId?.flightNumber || ''} (${selectedBooking.flightId?.from || ''} - ${selectedBooking.flightId?.to || ''})`.trim() || 'Vé máy bay')
                    : getI18nText(selectedBooking.tourId?.title, 'vi', 'Tour du lịch')}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                  <p><span className="font-semibold text-slate-500">Ngày đi / Checkin:</span> {selectedBooking.travelDate || selectedBooking.checkIn ? new Date(selectedBooking.travelDate || selectedBooking.checkIn).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  {selectedBooking.checkOut && (
                    <p><span className="font-semibold text-slate-500">Ngày Checkout:</span> {new Date(selectedBooking.checkOut).toLocaleDateString('vi-VN')}</p>
                  )}
                  <p><span className="font-semibold text-slate-500">Số khách / phòng:</span> {selectedBooking.guests?.adults || 1} người lớn, {selectedBooking.guests?.children || 0} trẻ em</p>
                  {selectedBooking.couponCode && (
                    <p className="col-span-2">
                      <span className="font-semibold text-slate-500">Voucher / Giảm giá:</span>{' '}
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {selectedBooking.couponCode} (-{formatPrice(selectedBooking.discount || 0)})
                      </span>
                    </p>
                  )}
                  <p><span className="font-semibold text-slate-500">Thanh toán:</span> <span className="font-semibold text-slate-800">{selectedBooking.paymentStatus === 'paid' ? 'Đã thanh toán' : selectedBooking.paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 'Chưa thanh toán'}</span></p>
                  <p><span className="font-semibold text-slate-500">Tổng thanh toán:</span> <span className="font-bold text-blue-600 text-sm">{formatPrice(selectedBooking.totalPrice)}</span></p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Đổi trạng thái:</span>
                {selectedBooking.status !== 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, 'confirmed');
                      setSelectedBooking({ ...selectedBooking, status: 'confirmed' });
                    }}
                    disabled={updateStatusMutation.isPending}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Xác nhận
                  </button>
                )}
                {selectedBooking.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, 'completed');
                      setSelectedBooking({ ...selectedBooking, status: 'completed' });
                    }}
                    disabled={updateStatusMutation.isPending}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Hoàn thành
                  </button>
                )}
                {selectedBooking.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, 'cancelled');
                      setSelectedBooking({ ...selectedBooking, status: 'cancelled' });
                    }}
                    disabled={updateStatusMutation.isPending}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Hủy đơn
                  </button>
                )}
                {selectedBooking.status === 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, 'pending');
                      setSelectedBooking({ ...selectedBooking, status: 'pending' });
                    }}
                    disabled={updateStatusMutation.isPending}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Về Chờ xử lý
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
