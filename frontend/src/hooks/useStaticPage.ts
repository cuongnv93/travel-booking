'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * useStaticPage: Cached static CMS page content (e.g. 'about', 'visa').
 * Static informational pages change only when edited in Admin CMS.
 * 
 * - staleTime: 60 minutes
 * - gcTime: 24 hours
 */
export function useStaticPage(slug: string, initialData?: any) {
  return useQuery({
    queryKey: ['pages', slug],
    queryFn: async () => {
      try {
        const res: any = await api.get(`/pages/${slug}`);
        return res?.data || res || null;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // 60 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours retention
    initialData,
    enabled: Boolean(slug),
    refetchOnWindowFocus: false,
  });
}
