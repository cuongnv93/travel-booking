import { DEFAULT_NEWS } from '@/lib/defaultNews';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';
  const locales = ['vi', 'en', 'zh', 'ko', 'ja'];
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
    },
  ];

  for (const loc of locales) {
    for (const page of pages) {
      staticRoutes.push({
        url: `${baseUrl}/${loc}${page.path}`,
        lastModified: new Date().toISOString(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  // Attempt to fetch dynamic routes for Tours, Hotels, News
  const dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // Tours
    const toursRes = await fetch(`${apiBase}/tours?limit=50`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    }).catch(() => null);
    if (toursRes?.ok) {
      const data = await toursRes.json();
      const tours = Array.isArray(data) ? data : (data?.data || []);
      for (const t of tours) {
        if (t?.slug) {
          for (const loc of locales) {
            dynamicRoutes.push({
              url: `${baseUrl}/${loc}/tours/${t.slug}`,
              lastModified: t.updatedAt || new Date().toISOString(),
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        }
      }
    }

    // Hotels
    const hotelsRes = await fetch(`${apiBase}/hotels?limit=50`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    }).catch(() => null);
    if (hotelsRes?.ok) {
      const data = await hotelsRes.json();
      const hotels = Array.isArray(data) ? data : (data?.data || []);
      for (const h of hotels) {
        if (h?.slug) {
          for (const loc of locales) {
            dynamicRoutes.push({
              url: `${baseUrl}/${loc}/hotels/${h.slug}`,
              lastModified: h.updatedAt || new Date().toISOString(),
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        }
      }
    }

    // News with automatic fallback to DEFAULT_NEWS
    let news: any[] = [];
    const newsRes = await fetch(`${apiBase}/news?limit=50`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    }).catch(() => null);

    if (newsRes?.ok) {
      const data = await newsRes.json();
      news = Array.isArray(data) ? data : (data?.data || []);
    }

    if (!news || news.length === 0) {
      news = DEFAULT_NEWS;
    }

    for (const n of news) {
      if (n?.slug) {
        for (const loc of locales) {
          dynamicRoutes.push({
            url: `${baseUrl}/${loc}/news/${n.slug}`,
            lastModified: n.updatedAt || n.publishedAt || n.createdAt || new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.75,
          });
        }
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return [...staticRoutes, ...dynamicRoutes];
}
