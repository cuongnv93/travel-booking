import type { Metadata } from 'next';
import ProfileBookingsClient from './ProfileBookingsClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';

  const titles: Record<string, string> = {
    vi: 'Lịch Sử Đặt Tour & Quản Lý Đơn Hàng',
    en: 'Booking History & Reservation Management',
    zh: '预订历史记录与订单管理',
    ko: '예약 내역 및 주문 관리',
    ja: '予約履歴＆予約管理',
  };

  return {
    title: titles[locale] || titles.vi,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function UserBookingsPage() {
  return <ProfileBookingsClient />;
}
