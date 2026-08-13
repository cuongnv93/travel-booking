import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:3000';

  const routes = [
    '',
    '/vi',
    '/en',
    '/vi/tours',
    '/en/tours',
    '/vi/hotels',
    '/en/hotels',
    '/vi/news',
    '/en/news',
    '/vi/specialties',
    '/en/specialties',
    '/vi/flights',
    '/en/flights',
    '/vi/visa',
    '/en/visa',
    '/vi/contact',
    '/en/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/vi' ? 1.0 : 0.8,
  }));

  return routes;
}
