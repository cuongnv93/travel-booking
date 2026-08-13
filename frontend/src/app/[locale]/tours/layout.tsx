import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Danh Sách Tour Du Lịch Trong & Ngoài Nước | Travel',
  description: 'Tổng hợp danh sách các gói tour du lịch hấp dẫn, giá tốt nhất. Tìm kiếm tour theo điểm đến, loại hình du lịch và thời gian phù hợp.',
  openGraph: {
    title: 'Danh Sách Tour Du Lịch | Travel Booking',
    description: 'Tìm kiếm và đặt tour du lịch tốt nhất với hàng ngàn ưu đãi.',
  }
};

export default function ToursLayout({ children }: { children: React.ReactNode }) {
  return children;
}
