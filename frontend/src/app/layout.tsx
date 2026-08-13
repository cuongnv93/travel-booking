import type { Metadata } from "next";
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-inter',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: "Travel - Khám phá thế giới",
  description: "Nền tảng đặt tour du lịch hàng đầu Việt Nam",
  openGraph: {
    title: "Travel - Khám phá thế giới",
    description: "Nền tảng đặt tour du lịch hàng đầu Việt Nam. Khám phá hàng ngàn khách sạn, tour du lịch và chuyến bay với giá ưu đãi nhất.",
    url: "https://travel-booking-9oxn.onrender.com", // Fallback URL, should ideally be the vercel domain
    siteName: "Travel Booking",
    images: [
      {
        url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Travel Booking Thumbnail",
      }
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel - Khám phá thế giới",
    description: "Nền tảng đặt tour du lịch hàng đầu Việt Nam",
    images: ["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: 'https://cdn-icons-png.flaticon.com/512/2060/2060284.png', type: 'image/png' },
    ],
    apple: [
      { url: 'https://cdn-icons-png.flaticon.com/512/2060/2060284.png', sizes: '180x180', type: 'image/png' },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} font-sans antialiased bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900`}>
        {children}
      </body>
    </html>
  );
}
