'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchVietnamProvinces, VIETNAM_PROVINCES } from '@/lib/provinces';

/**
 * useVietnamProvinces: Cached lookup of Vietnam's 63 provinces and cities.
 * This is static administrative data that practically never changes.
 * 
 * - staleTime: 7 days
 * - gcTime: 14 days
 */
export function useVietnamProvinces(initialData?: string[]) {
  return useQuery({
    queryKey: ['provinces', 'vietnam'],
    queryFn: fetchVietnamProvinces,
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days fresh
    gcTime: 1000 * 60 * 60 * 24 * 14,   // 14 days cache retention (safe for 32-bit int setTimeout)
    initialData: initialData && initialData.length > 0 ? initialData : VIETNAM_PROVINCES,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
