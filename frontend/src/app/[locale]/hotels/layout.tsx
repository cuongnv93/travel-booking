import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đặt Phòng Khách Sạn & Resort 3-5 Sao Giá Tốt | Travel',
  description: 'Đặt phòng khách sạn, resort nghỉ dưỡng cao cấp tại Hà Nội, Đà Nẵng, Nha Trang, Phú Quốc. Giá ưu đãi tốt nhất, xác nhận tức thì.',
  openGraph: {
    title: 'Đặt Phòng Khách Sạn & Resort | Travel Booking',
    description: 'Nghỉ dưỡng đẳng cấp tại các khách sạn 5 sao tốt nhất.',
  }
};

export default function HotelsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
