/**
 * serverApi.ts — Server-side data fetching helpers for Next.js Server Components.
 *
 * Uses native fetch() with Vercel ISR cache (revalidate: 60s).
 * This runs on the Vercel Edge/Node.js runtime — NOT in the browser.
 * Server → Backend is a direct internal call, much faster than Browser → Backend.
 */

import { DEFAULT_NEWS } from './defaultNews';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function serverFetch<T>(path: string, revalidate = 60): Promise<T> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      next: { revalidate },
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [] as unknown as T;
    const json = await res.json();
    return (Array.isArray(json) ? json : (json?.data ?? [])) as T;
  } catch {
    return [] as unknown as T;
  }
}

export async function prefetchTours(params?: Record<string, string>): Promise<any[]> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '?limit=24';
  return serverFetch<any[]>(`/tours${qs}`);
}

export async function prefetchHotels(params?: Record<string, string>): Promise<any[]> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return serverFetch<any[]>(`/hotels${qs}`);
}

export async function prefetchHotelLocations(): Promise<string[]> {
  return serverFetch<string[]>('/hotels/locations', 300);
}

export async function prefetchSpecialties(): Promise<any[]> {
  return serverFetch<any[]>('/specialties');
}

export async function prefetchNews(category?: string): Promise<any[]> {
  const qs = category ? `?category=${category}&limit=20` : '?limit=20';
  const list = await serverFetch<any[]>(`/news${qs}`);
  if (Array.isArray(list) && list.length > 0) return list;
  if (category) {
    return DEFAULT_NEWS.filter((item) => item.category === category);
  }
  return DEFAULT_NEWS;
}

export async function prefetchSettings(): Promise<any[]> {
  return serverFetch<any[]>('/settings', 300);
}

export async function prefetchTourBySlug(slug: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/tours/${slug}`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function prefetchHotelBySlug(slug: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/hotels/${slug}`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function prefetchNewsBySlug(slug: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/news/${slug}`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data._id || data.slug)) return data;
    }
  } catch {
    // fallback
  }
  return DEFAULT_NEWS.find((item) => item.slug === slug) || null;
}
