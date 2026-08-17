/**
 * serverApi.ts — Server-side data fetching helpers for Next.js Server Components.
 *
 * Uses native fetch() with Vercel ISR cache (revalidate: 60s).
 * This runs on the Vercel Edge/Node.js runtime — NOT in the browser.
 * Server → Backend is a direct internal call, much faster than Browser → Backend.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function serverFetch<T>(path: string, revalidate = 60): Promise<T> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      next: { revalidate },
      headers: { 'Content-Type': 'application/json' },
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
  return serverFetch<any[]>(`/news${qs}`);
}

export async function prefetchSettings(): Promise<any[]> {
  return serverFetch<any[]>('/settings', 300);
}
