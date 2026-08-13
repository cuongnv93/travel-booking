'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock, CheckCircle2, XCircle, ShoppingBag, Eye, X,
  Building2, Compass, PhoneCall, ShieldAlert, ArrowLeft
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const fetchUserBookings = async () => {
  try {
    const res: any = await api.get('/bookings/my');
    return Array.isArray(res) ? res : (res?.data || []);
  } catch {
    return [];
  }
};

export default function UserBookingsPage() {
  const locale = useParams().locale as string;
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: fetchUserBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      alert('Đã hủy đơn thành công');
      setSelectedBooking(null);
    },
    onError: (err: any) => {
      alert('Lỗi hủy đơn: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleCancelBooking = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn đặt này?')) return;
    cancelMutation.mutate(id);
  };

  const filteredBookings = bookings.filter((b: any) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="container mx-auto px-4 py-12 mt-20 max-w-4xl">
      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link href={`/${locale}/profile`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Trở về Hồ sơ cá nhân
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lịch Sử Đơn Đặt Dịch Vụ</h1>
          <p className="text-slate-500 text-sm mt-0.5">Theo dõi chi tiết trạng thái và lịch trình các chuyến đi của bạn</p>
        </div>
        <Link
          href={`/${locale}/tours`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md shrink-0"
        >
          + Khám Phá Tour Mới
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200">
        {[
          { key: 'all', label: 'Tất Cả Đơn', count: bookings.length },
          { key: 'pending', label: 'Chờ Xác Nhận', count: bookings.filter((b: any) => b.status === 'pending').length },
          { key: 'confirmed', label: 'Đã Xác Nhận', count: bookings.filter((b: any) => b.status === 'confirmed').length },
          { key: 'cancelled', label: 'Đã Hủy', count: bookings.filter((b: any) => b.status === 'cancelled').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              statusFilter === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-extrabold text-slate-800 mb-2">Chưa có đơn đặt nào ở mục này</h3>
          <p className="text-slate-500 text-sm mb-6">Hãy chọn cho mình một trải nghiệm hành trình mới tuyệt vời cùng Travel!</p>
          <Link
            href={`/${locale}/tours`}
            className="inline-block bg-blue-600 text-white font-extrabold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm"
          >
            Xem Danh Sách Tours
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b: any) => {
            const isHotel = b.type === 'hotel';
            const title = isHotel
              ? (b.hotelId?.name?.vi || b.hotelId?.name || 'Khách Sạn & Resort')
              : (b.tourId?.title?.vi || b.tourId?.title || 'Tour Du Lịch');

            const thumb = isHotel
              ? (b.hotelId?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800')
              : (b.tourId?.images?.[0] || 'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=800');

            const travelDate = b.travelDate || b.checkIn;
            const formattedDate = travelDate ? new Date(travelDate).toLocaleDateString('vi-VN') : 'N/A';

            return (
              <div
                key={b._id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex gap-4 items-center min-w-0 flex-1">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 shrink-0 overflow-hidden relative">
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {isHotel ? 'Hotel' : 'Tour'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                        {b.bookingCode}
                      </span>
                      <span className="text-xs text-slate-400">| {formattedDate}</span>
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 line-clamp-1">{title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Số khách: <span className="font-bold text-slate-700">{b.guests?.adults || 1} người lớn, {b.guests?.children || 0} trẻ em</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Tổng tiền</span>
                    <span className="text-xl font-extrabold text-orange-600">{formatPrice(b.totalPrice)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'confirmed' ? (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đã xác nhận
                      </span>
                    ) : b.status === 'cancelled' ? (
                      <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-red-200">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        Đã hủy
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Chờ xác nhận
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-extrabold text-blue-600">MÃ: {selectedBooking.bookingCode}</span>
                <h2 className="text-lg font-bold text-slate-900">Thông Tin Đơn Đặt</h2>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Service Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <p className="text-[11px] font-extrabold uppercase text-blue-600 tracking-wider">Dịch vụ đã đặt</p>
                <p className="font-extrabold text-base text-slate-900">
                  {selectedBooking.type === 'hotel'
                    ? (selectedBooking.hotelId?.name?.vi || selectedBooking.hotelId?.name)
                    : (selectedBooking.tourId?.title?.vi || selectedBooking.tourId?.title)}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                  <p><span className="text-slate-500 font-semibold">Ngày đi:</span> {new Date(selectedBooking.travelDate || selectedBooking.checkIn).toLocaleDateString('vi-VN')}</p>
                  <p><span className="text-slate-500 font-semibold">Số khách:</span> {selectedBooking.guests?.adults || 1} người lớn, {selectedBooking.guests?.children || 0} trẻ em</p>
                  <p className="col-span-2"><span className="text-slate-500 font-semibold">Tổng tiền thanh toán:</span> <span className="text-base font-extrabold text-orange-600">{formatPrice(selectedBooking.totalPrice)}</span></p>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="p-4 border border-slate-200 rounded-2xl space-y-1.5 text-slate-700">
                <p className="font-bold text-slate-900 mb-1">Thông tin liên hệ nhận vé</p>
                <p><span className="text-slate-500">Họ tên:</span> {selectedBooking.customerInfo?.name}</p>
                <p><span className="text-slate-500">Số điện thoại:</span> {selectedBooking.customerInfo?.phone}</p>
                <p><span className="text-slate-500">Email:</span> {selectedBooking.customerInfo?.email}</p>
              </div>

              {/* Status Notice */}
              {selectedBooking.status === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 space-y-2">
                  <p className="font-bold text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" /> Đơn hàng đang chờ bộ phận CSKH xác nhận!
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Bạn có thể gọi tới hotline <strong>1800 646 888</strong> để hỗ trợ kiểm tra tình trạng giữ chỗ nhanh nhất.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {selectedBooking.status === 'pending' ? (
                <button
                  onClick={() => handleCancelBooking(selectedBooking._id)}
                  disabled={cancelMutation.isPending}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  Hủy Đơn Này
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
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
