import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';

  const titles: Record<string, string> = {
    vi: 'Đăng Nhập & Đăng Ký Tài Khoản Khách Hàng',
    en: 'Customer Account Login & Registration',
    zh: '会员登录与注册',
    ko: '고객 로그인 및 회원가입',
    ja: 'ログイン＆新規会員登録',
  };

  return {
    title: titles[locale] || titles.vi,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LoginPage() {
  return <LoginClient />;
}
