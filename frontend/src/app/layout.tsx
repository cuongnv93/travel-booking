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
