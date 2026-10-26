import { DEFAULT_NEWS } from '@/lib/defaultNews';
import { MetadataRoute } from 'next';

const FALLBACK_TOUR_SLUGS = [
  'ha-long-bay',
  'da-nang-ba-na-hills',
  'phu-quoc-paradise',
  'sapa-fansipan',
  'nha-trang-diving',
  'saigon-mekong-delta',
  'hue-culture-tour',
  'ban-gioc-cao-bang',
  'ho-guom-hanoi',
];

const FALLBACK_HOTEL_SLUGS = [
  'danang-ocean-resort',
  'phu-quoc-paradise-resort',
  'halong-bay-heritage-hotel',
  'hanoi-luxury-hotel',
  'sapa-mountain-lodge',
  'dalat-palace-heritage-hotel',
  'hoian-memories-resort-spa',
  'nha-trang-marriott-resort',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';
  const locales = ['vi', 'en', 'zh', 'ko', 'ja'];

  const buildAlternates = (subpath: string) => ({
    languages: {
      vi: `${baseUrl}/vi${subpath}`,
      en: `${baseUrl}/en${subpath}`,
      zh: `${baseUrl}/zh${subpath}`,
      ko: `${baseUrl}/ko${subpath}`,
      ja: `${baseUrl}/ja${subpath}`,
      'x-default': `${baseUrl}/vi${subpath}`,
    },
  });

  const pages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/tours', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/hotels', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/flights', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/visa', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/news', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/specialties', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: buildAlternates(''),
    },
  ];

  for (const loc of locales) {
    for (const page of pages) {
      staticRoutes.push({
        url: `${baseUrl}/${loc}${page.path}`,
        lastModified: new Date().toISOString(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: buildAlternates(page.path),
      });
    }
  }

  // Attempt to fetch dynamic routes for Tours, Hotels, News
  const dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Tours
    let tourSlugs: string[] = [];
    const toursRes = await fetch(`${apiBase}/tours?limit=100`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    }).catch(() => null);

    if (toursRes?.ok) {
      const data = await toursRes.json();
      const tours = Array.isArray(data) ? data : (data?.data || []);
      tourSlugs = tours.map((t: any) => t?.slug).filter(Boolean);
    }
    if (tourSlugs.length === 0) {
      tourSlugs = FALLBACK_TOUR_SLUGS;
    }

    for (const slug of tourSlugs) {
      const subpath = `/tours/${slug}`;
      const alternates = buildAlternates(subpath);
      for (const loc of locales) {
        dynamicRoutes.push({
          url: `${baseUrl}/${loc}${subpath}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates,
        });
      }
    }

    // Hotels
    let hotelSlugs: string[] = [];
    const hotelsRes = await fetch(`${apiBase}/hotels?limit=100`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    }).catch(() => null);

    if (hotelsRes?.ok) {
      const data = await hotelsRes.json();
      const hotels = Array.isArray(data) ? data : (data?.data || []);
      hotelSlugs = hotels.map((h: any) => h?.slug).filter(Boolean);
    }
    if (hotelSlugs.length === 0) {
      hotelSlugs = FALLBACK_HOTEL_SLUGS;
    }

    for (const slug of hotelSlugs) {
      const subpath = `/hotels/${slug}`;
      const alternates = buildAlternates(subpath);
      for (const loc of locales) {
        dynamicRoutes.push({
          url: `${baseUrl}/${loc}${subpath}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates,
        });
      }
    }

    // News
    let newsItems: any[] = [];
    const newsRes = await fetch(`${apiBase}/news?limit=100`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    }).catch(() => null);

    if (newsRes?.ok) {
      const data = await newsRes.json();
      newsItems = Array.isArray(data) ? data : (data?.data || []);
    }
    if (!newsItems || newsItems.length === 0) {
      newsItems = DEFAULT_NEWS;
    }

    for (const n of newsItems) {
      if (n?.slug) {
        const subpath = `/news/${n.slug}`;
        const alternates = buildAlternates(subpath);
        const lastMod = n.updatedAt || n.publishedAt || n.createdAt || new Date().toISOString();
        for (const loc of locales) {
          dynamicRoutes.push({
            url: `${baseUrl}/${loc}${subpath}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.75,
            alternates,
          });
        }
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return [...staticRoutes, ...dynamicRoutes];
}
