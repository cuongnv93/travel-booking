import type { Metadata } from 'next';
import { Suspense } from 'react';
import BookingLookupClient from './BookingLookupClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';

  const titles: Record<string, string> = {
    vi: 'Tra Cứu Mã Đặt Chỗ & Trạng Thái Đơn Hàng',
    en: 'Booking Code Lookup & Reservation Status',
    zh: '查询预订编号与订单处理进度',
    ko: '예약 번호 조회 및 주문 상태 확인',
    ja: '予約番号検索＆ご予約状況確認',
  };

  return {
    title: titles[locale] || titles.vi,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function BookingLookupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50/50 pb-20 pt-28 flex items-center justify-center">
        <div className="h-64 rounded-3xl bg-slate-200 animate-pulse w-full max-w-4xl mx-4" />
      </div>
    }>
      <BookingLookupClient />
    </Suspense>
  );
}
