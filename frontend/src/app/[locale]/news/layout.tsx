import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cẩm Nang & Kinh Nghiệm Du Lịch Mới Nhất | Travel News',
  description: 'Cập nhật các bài viết cẩm nang du lịch, kinh nghiệm phượt, danh lam thắng cảnh và ẩm thực 3 miền Việt Nam.',
  openGraph: {
    title: 'Tin Tức & Cẩm Nang Du Lịch | Travel',
    description: 'Bí kíp du lịch và những điểm đến hấp dẫn không thể bỏ qua.',
  }
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
