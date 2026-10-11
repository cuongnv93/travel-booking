'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * useBookingLookup: Cache booking lookup results by booking code.
 * Prevents redundant server queries when user inspects their booking details.
 * 
 * - staleTime: 5 minutes
 * - gcTime: 30 minutes
 */
export function useBookingLookup(code: string) {
  const normalizedCode = code?.trim().toUpperCase();

  return useQuery({
    queryKey: ['bookings', 'lookup', normalizedCode],
    queryFn: async () => {
      if (!normalizedCode) return null;
      const res: any = await api.get(`/bookings/lookup?code=${encodeURIComponent(normalizedCode)}`);
      return res;
    },
    enabled: Boolean(normalizedCode),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 30,    // 30 minutes retention
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
