import type { Metadata } from 'next';
import TourDetailClient from '@/components/tours/TourDetailClient';
import { getI18nText } from '@/lib/utils';
import { prefetchTourBySlug } from '@/lib/serverApi';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const slug = resolved?.slug || '';
  const tour = await prefetchTourBySlug(slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  if (!tour) {
    return {
      title: 'Không tìm thấy tour | Travel Booking',
      description: 'Chuyến đi không tồn tại hoặc đã bị xóa.'
    };
  }

  const title = getI18nText(tour.title, locale);
  const description = getI18nText(tour.description, locale);
  const image = tour.images?.[0] || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200';

  return {
    title: `${title} | Tour Du Lịch Travel`,
    description: description.substring(0, 160),
    keywords: [tour.destination, tour.category, 'dat tour du lich', title],
    alternates: {
      canonical: `${baseUrl}/${locale}/tours/${slug}`,
      languages: {
        vi: `${baseUrl}/vi/tours/${slug}`,
        en: `${baseUrl}/en/tours/${slug}`,
        zh: `${baseUrl}/zh/tours/${slug}`,
        ko: `${baseUrl}/ko/tours/${slug}`,
        ja: `${baseUrl}/ja/tours/${slug}`,
        'x-default': `${baseUrl}/vi/tours/${slug}`,
      },
    },
    openGraph: {
      title: `${title} | Travel Booking`,
      description: description.substring(0, 160),
      url: `${baseUrl}/${locale}/tours/${slug}`,
      siteName: 'Travel Booking',
      type: 'article',
      images: [{ url: image, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
      images: [image],
    }
  };
}

export default async function TourDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string };
}) {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const slug = resolved?.slug || '';
  const tour = await prefetchTourBySlug(slug);

  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-20 mt-20 text-center">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">Không tìm thấy tour du lịch này</h1>
        <p className="text-slate-500">Chuyến đi này có thể đã bị xóa hoặc không còn khả dụng.</p>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const tourSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: getI18nText(tour.title, locale),
    description: getI18nText(tour.description, locale),
    image: tour.images || [],
    touristType: tour.category || 'Traveler',
    offers: {
      '@type': 'Offer',
      price: tour.price,
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/${locale}/tours/${slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tourSchema) }}
      />
      <TourDetailClient tour={tour} locale={locale} />
    </>
  );
}
