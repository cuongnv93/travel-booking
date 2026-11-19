import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
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
    const tMeta = await getTranslations({ locale, namespace: 'tourDetail' });
    return {
      title: `${tMeta('tourNotFound')} | Travel Booking`,
      description: tMeta('tourNotFoundDesc')
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

  const t = await getTranslations({ locale, namespace: 'tourDetail' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  if (!tour) {
    return (
      <main id="main-content" className="flex-grow">
        <div className="container mx-auto px-4 py-20 mt-20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-slate-800">{t('tourNotFound')}</h1>
          <p className="text-slate-500 mb-6">{t('tourNotFoundDesc')}</p>
          <Link href={`/${locale}/tours`} className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors">
            {t('viewOtherTours')}
          </Link>
        </div>
      </main>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const tourTitle = getI18nText(tour.title, locale);
  const tourDesc = getI18nText(tour.description, locale);
  const tourSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['TouristTrip', 'Product'],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: tour.rating || 4.9,
          reviewCount: tour.reviewsCount || tour.numReviews || 28,
          bestRating: 5,
          worstRating: 1,
        },
        '@id': `${baseUrl}/${locale}/tours/${slug}#trip`,
        name: tourTitle,
        description: tourDesc,
        image: tour.images || [],
        touristType: tour.category || 'Traveler',
        provider: {
          '@type': 'TravelAgency',
          name: 'Travel Booking',
          url: baseUrl,
        },
        offers: {
          '@type': 'Offer',
          price: tour.price,
          priceCurrency: 'VND',
          availability: 'https://schema.org/InStock',
          url: `${baseUrl}/${locale}/tours/${slug}`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: tNav('home'),
            item: `${baseUrl}/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: tNav('tours'),
            item: `${baseUrl}/${locale}/tours`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tourTitle,
            item: `${baseUrl}/${locale}/tours/${slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tourSchema) }}
      />
      <main id="main-content" className="flex-grow">
        <TourDetailClient tour={tour} locale={locale} />
      </main>
    </>
  );
}
