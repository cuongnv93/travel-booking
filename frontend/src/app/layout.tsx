import type { Metadata } from "next";
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-inter',
  weight: '100 900',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app'),
  title: "Travel - Nền Tảng Đặt Tour Du Lịch Hàng Đầu Việt Nam",
  description: "Khám phá các điểm đến hấp dẫn và trải nghiệm hành trình du lịch tuyệt vời cùng Travel.",
  openGraph: {
    title: "Travel - Nền Tảng Đặt Tour Du Lịch Hàng Đầu Việt Nam",
    description: "Khám phá các điểm đến hấp dẫn và trải nghiệm hành trình du lịch tuyệt vời cùng Travel.",
    url: "https://travel-booking-ruby.vercel.app",
    siteName: "Travel Booking",
    images: [
      {
        url: "https://travel-booking-ruby.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Travel Booking - Nền Tảng Đặt Tour Du Lịch Hàng Đầu Việt Nam",
      }
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel - Nền Tảng Đặt Tour Du Lịch Hàng Đầu Việt Nam",
    description: "Khám phá các điểm đến hấp dẫn và trải nghiệm hành trình du lịch tuyệt vời cùng Travel.",
    images: ["https://travel-booking-ruby.vercel.app/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
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
