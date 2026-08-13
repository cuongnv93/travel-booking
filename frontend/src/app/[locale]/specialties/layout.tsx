import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đặc Sản 3 Miền Việt Nam - Tinh Hoa Ẩm Thực | Travel',
  description: 'Khám phá văn hóa ẩm thực và danh sách các món ăn đặc sản ngon nhất tại Bắc - Trung - Nam Việt Nam.',
};

export default function SpecialtiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
