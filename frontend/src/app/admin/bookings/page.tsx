'use client';

import { useState } from 'react';
import {
  CheckCircle2, XCircle, Clock, Search, Filter, Eye,
  Building2, Compass, DollarSign, Calendar, Phone, Mail, User, ShieldAlert
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils';

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

export default function BookingsAdminPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

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
    },
    onError: (err: any) => {
      alert('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    },
  });

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const filteredBookings = bookings.filter((b: any) => {
    const codeMatch = (b.bookingCode || '').toLowerCase().includes(search.toLowerCase());
    const nameMatch = (b.customerInfo?.name || '').toLowerCase().includes(search.toLowerCase());
    const emailMatch = (b.customerInfo?.email || '').toLowerCase().includes(search.toLowerCase());
    const phoneMatch = (b.customerInfo?.phone || '').toLowerCase().includes(search.toLowerCase());
    const statusMatch = !statusFilter || b.status === statusFilter;
    const typeMatch = !typeFilter || (typeFilter === 'hotel' ? b.type === 'hotel' : b.type !== 'hotel');
    return (codeMatch || nameMatch || emailMatch || phoneMatch) && statusMatch && typeMatch;
  });

  if (isLoading) return <AdminTableSkeleton cols={5} rows={7} />;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Đơn Đặt Tour & Khách Sạn</h1>
        <p className="text-xs text-slate-500 mt-1">Theo dõi, kiểm tra thông tin khách hàng và phê duyệt đơn đặt chỗ</p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Tổng số đơn</p>
            <p className="text-xl font-bold text-slate-900">{stats?.totalBookings || bookings.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Chờ xác nhận</p>
            <p className="text-xl font-bold text-amber-600">{stats?.pendingCount ?? bookings.filter((b: any) => b.status === 'pending').length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Đã xác nhận</p>
            <p className="text-xl font-bold text-emerald-600">{stats?.confirmedCount ?? bookings.filter((b: any) => b.status === 'confirmed').length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Tổng doanh thu</p>
            <p className="text-xl font-bold text-purple-600">{formatPrice(stats?.totalRevenue || 0)}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã booking, tên khách, số điện thoại, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="">Tất cả dịch vụ</option>
            <option value="tour">Tour Du Lịch</option>
            <option value="hotel">Khách Sạn & Resort</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận (Pending)</option>
            <option value="confirmed">Đã xác nhận (Confirmed)</option>
            <option value="cancelled">Đã hủy (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Mã Đơn</th>
                <th className="px-6 py-3.5">Loại</th>
                <th className="px-6 py-3.5">Khách Hàng</th>
                <th className="px-6 py-3.5">Dịch Vụ Đặt</th>
                <th className="px-6 py-3.5">Ngày Khởi Hành</th>
                <th className="px-6 py-3.5">Tổng Tiền</th>
                <th className="px-6 py-3.5">Trạng Thái</th>
                <th className="px-6 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-slate-400">Đang tải danh sách đơn hàng...</td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-slate-400">Chưa có đơn đặt tour/khách sạn nào.</td>
                </tr>
              ) : (
                filteredBookings.map((b: any) => {
                  const isHotel = b.type === 'hotel';
                  const serviceTitle = isHotel
                    ? (b.hotelId?.name?.vi || b.hotelId?.name || 'Khách sạn')
                    : (b.tourId?.title?.vi || b.tourId?.title || 'Tour du lịch');

                  const travelDate = b.travelDate || b.checkIn;
                  const formattedDate = travelDate ? new Date(travelDate).toLocaleDateString('vi-VN') : 'N/A';

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-blue-600">{b.bookingCode}</td>
                      <td className="px-6 py-3.5">
                        {isHotel ? (
                          <span className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-purple-200 flex items-center gap-1 w-fit">
                            <Building2 className="w-3 h-3" /> Hotel
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1 w-fit">
                            <Compass className="w-3 h-3" /> Tour
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-slate-900">{b.customerInfo?.name}</p>
                        <p className="text-[11px] text-slate-400">{b.customerInfo?.phone}</p>
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-900 max-w-xs truncate" title={serviceTitle}>
                        {serviceTitle}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-600">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-3.5 font-extrabold text-slate-900">
                        {formatPrice(b.totalPrice)}
                      </td>
                      <td className="px-6 py-3.5">
                        {b.status === 'confirmed' ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã xác nhận
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
                      <td className="px-6 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Chi tiết
                        </button>

                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'confirmed')}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md transition-colors disabled:opacity-50"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-md transition-colors disabled:opacity-50"
                            >
                              Hủy
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Inspector Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-extrabold text-blue-600">{selectedBooking.bookingCode}</span>
                <h2 className="text-base font-bold text-slate-900">Chi Tiết Đơn Đặt Dịch Vụ</h2>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 font-bold">
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
                  {selectedBooking.customerInfo?.note && (
                    <p className="col-span-2 bg-amber-50 p-2 rounded-lg border border-amber-200/60 text-amber-900">
                      <span className="font-bold">Ghi chú:</span> {selectedBooking.customerInfo.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <p className="font-bold text-slate-800 border-b border-slate-100 pb-1.5">Thông Tin Dịch Vụ</p>
                <p className="font-bold text-sm text-slate-900">
                  {selectedBooking.type === 'hotel'
                    ? (selectedBooking.hotelId?.name?.vi || selectedBooking.hotelId?.name)
                    : (selectedBooking.tourId?.title?.vi || selectedBooking.tourId?.title)}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                  <p><span className="font-semibold text-slate-500">Ngày đi / Checkin:</span> {new Date(selectedBooking.travelDate || selectedBooking.checkIn).toLocaleDateString('vi-VN')}</p>
                  {selectedBooking.checkOut && (
                    <p><span className="font-semibold text-slate-500">Ngày Checkout:</span> {new Date(selectedBooking.checkOut).toLocaleDateString('vi-VN')}</p>
                  )}
                  <p><span className="font-semibold text-slate-500">Số khách / phòng:</span> {selectedBooking.guests?.adults || 1} người lớn, {selectedBooking.guests?.children || 0} trẻ em</p>
                  <p><span className="font-semibold text-slate-500">Tổng thanh toán:</span> <span className="font-bold text-blue-600 text-sm">{formatPrice(selectedBooking.totalPrice)}</span></p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
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