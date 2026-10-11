import type { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';

  const titles: Record<string, string> = {
    vi: 'Thông Tin Cá Nhân & Cài Đặt Tài Khoản',
    en: 'Personal Profile & Account Settings',
    zh: '个人资料与账户设置',
    ko: '회원 프로필 및 계정 설정',
    ja: 'プロフィール＆アカウント設定',
  };

  return {
    title: titles[locale] || titles.vi,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function ProfilePage() {
  return <ProfileClient />;
}
