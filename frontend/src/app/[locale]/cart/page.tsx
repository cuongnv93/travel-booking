import type { Metadata } from 'next';
import CartClient from './CartClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';

  const titles: Record<string, string> = {
    vi: 'Giỏ Hàng & Xác Nhận Đặt Chỗ',
    en: 'Shopping Cart & Booking Checkout',
    zh: '购物车与预订结算',
    ko: '장바구니 및 예약 결제',
    ja: 'カート・予約手続き',
  };

  return {
    title: titles[locale] || titles.vi,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CartPage() {
  return <CartClient />;
}
