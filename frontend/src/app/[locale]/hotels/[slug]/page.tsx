import type { Metadata } from 'next';
import HotelDetailClient from './HotelDetailClient';
import { getI18nText } from '@/lib/utils';
import { prefetchHotelBySlug } from '@/lib/serverApi';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const slug = resolved?.slug || '';
  const hotel = await prefetchHotelBySlug(slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  if (!hotel) {
    return {
      title: 'Không tìm thấy khách sạn | Travel Booking',
      description: 'Khách sạn hoặc khu nghỉ dưỡng không tồn tại hoặc đã ngừng hoạt động.'
    };
  }

  const name = getI18nText(hotel.name, locale);
  const description = getI18nText(hotel.description, locale) || `${name} - Đặt phòng khách sạn cao cấp, view đẹp, tiện nghi chuẩn 3-5 sao giá ưu đãi tại Travel Booking.`;
  const image = hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200';

  return {
    title: `${name} | Đặt Phòng Khách Sạn & Resort`,
    description: description.substring(0, 160),
    keywords: [hotel.city || '', hotel.address || '', 'dat phong khach san', name, 'resort nghi duong'],
    alternates: {
      canonical: `${baseUrl}/${locale}/hotels/${slug}`,
      languages: {
        vi: `${baseUrl}/vi/hotels/${slug}`,
        en: `${baseUrl}/en/hotels/${slug}`,
        zh: `${baseUrl}/zh/hotels/${slug}`,
        ko: `${baseUrl}/ko/hotels/${slug}`,
        ja: `${baseUrl}/ja/hotels/${slug}`,
        'x-default': `${baseUrl}/vi/hotels/${slug}`,
      },
    },
    openGraph: {
      title: `${name} | Travel Booking`,
      description: description.substring(0, 160),
      url: `${baseUrl}/${locale}/hotels/${slug}`,
      siteName: 'Travel Booking',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: name }]
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: description.substring(0, 160),
      images: [image],
    }
  };
}

export default async function HotelDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string };
}) {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const slug = resolved?.slug || '';
  const hotel = await prefetchHotelBySlug(slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const hotelSchema = hotel ? {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: getI18nText(hotel.name, locale),
    description: getI18nText(hotel.description, locale),
    image: hotel.images || [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: hotel.city || hotel.location || 'Việt Nam',
      streetAddress: hotel.address || hotel.location || '',
      addressCountry: 'VN',
    },
    starRating: {
      '@type': 'Rating',
      ratingValue: hotel.stars || 5,
    },
    priceRange: hotel.pricePerNight ? `${hotel.pricePerNight} VND` : undefined,
    url: `${baseUrl}/${locale}/hotels/${slug}`,
  } : null;

  return (
    <>
      {hotelSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
        />
      )}
      <HotelDetailClient />
    </>
  );
}
