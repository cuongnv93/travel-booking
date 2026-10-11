'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const DEFAULT_HOTEL_LOCATIONS = [
  'Đà Nẵng', 'Hội An', 'Nha Trang', 'Phú Quốc', 'Hà Nội', 'TP. Hồ Chí Minh', 'Sa Pa', 'Quy Nhơn', 'Đà Lạt', 'Phan Thiết'
];

/**
 * useHotelLocations: Cached catalog of distinct hotel cities/destinations.
 * Changes very infrequently (only when hotels in new cities are added).
 * 
 * - staleTime: 30 minutes
 * - gcTime: 24 hours
 */
export function useHotelLocations(initialLocations?: string[]) {
  return useQuery({
    queryKey: ['hotels', 'locations'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/hotels/locations');
        const list = Array.isArray(res) ? res : (res?.data || []);
        return list.length > 0 ? list : DEFAULT_HOTEL_LOCATIONS;
      } catch {
        return DEFAULT_HOTEL_LOCATIONS;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours in cache
    initialData: initialLocations && initialLocations.length > 0 ? initialLocations : DEFAULT_HOTEL_LOCATIONS,
    refetchOnWindowFocus: false,
  });
}
