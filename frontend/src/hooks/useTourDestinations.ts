'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const DEFAULT_TOUR_DESTINATIONS = [
  'Đà Nẵng', 'Hà Nội', 'Hội An', 'Phú Quốc', 'Sa Pa', 'Nha Trang', 'Hạ Long', 'Quy Nhơn', 'Đà Lạt', 'TP. Hồ Chí Minh'
];

/**
 * useTourDestinations: Cached catalog of distinct tour destinations.
 * Master catalog changes rarely.
 * 
 * - staleTime: 30 minutes
 * - gcTime: 24 hours
 */
export function useTourDestinations(initialDestinations?: string[]) {
  return useQuery({
    queryKey: ['tours', 'destinations'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/tours/destinations');
        const list = Array.isArray(res) ? res : (res?.data || []);
        return list.length > 0 ? list : DEFAULT_TOUR_DESTINATIONS;
      } catch {
        return DEFAULT_TOUR_DESTINATIONS;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours in cache
    initialData: initialDestinations && initialDestinations.length > 0 ? initialDestinations : DEFAULT_TOUR_DESTINATIONS,
    refetchOnWindowFocus: false,
  });
}
