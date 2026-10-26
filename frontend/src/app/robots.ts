import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/*/profile',
          '/*/profile/*',
          '/*/cart',
          '/*/booking-lookup',
          '/*/booking-success',
          '/*/login',
          '/*/register',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/*/profile',
          '/*/profile/*',
          '/*/cart',
          '/*/booking-lookup',
          '/*/booking-success',
          '/*/login',
          '/*/register',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
