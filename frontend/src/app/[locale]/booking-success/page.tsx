import type { Metadata } from 'next';
import { Suspense } from 'react';
import BookingSuccessClient from './BookingSuccessClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';

  const titles: Record<string, string> = {
    vi: 'Đặt Chỗ Thành Công | Cảm Ơn Quý Khách',
    en: 'Booking Confirmed | Thank You',
    zh: '预订成功 | 感谢您的选择',
    ko: '예약 완료 | 이용해 주셔서 감사합니다',
    ja: 'ご予約完了 | ありがとうございます',
  };

  return {
    title: titles[locale] || titles.vi,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-16 px-4 mt-16 flex items-center justify-center bg-slate-50">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center text-slate-500">
          Đang tải thông tin đơn đặt chỗ...
        </div>
      </div>
    }>
      <BookingSuccessClient />
    </Suspense>
  );
}
