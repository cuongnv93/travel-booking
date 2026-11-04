'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

// Re-export all default fallbacks from single source of truth
export {
  DEFAULT_DESTINATIONS,
  DEFAULT_WHY_CHOOSE_US,
  DEFAULT_STATS_COUNTERS,
  DEFAULT_AIRPORTS,
  DEFAULT_AIRLINES,
  DEFAULT_BRANCHES,
  DEFAULT_WORKING_HOURS,
  DEFAULT_TOUR_POLICIES,
  DEFAULT_HOTEL_AMENITIES,
  DEFAULT_BUSINESS_LICENSE,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_PAGE_BANNERS,
  DEFAULT_SITE_INFO,
  DEFAULT_HERO_SLIDES,
  DEFAULT_TESTIMONIALS,
  DEFAULT_PAYMENT_INFO,
} from '@/lib/constants/defaultSettings';

import {
  DEFAULT_DESTINATIONS,
  DEFAULT_WHY_CHOOSE_US,
  DEFAULT_STATS_COUNTERS,
  DEFAULT_AIRPORTS,
  DEFAULT_AIRLINES,
  DEFAULT_BRANCHES,
  DEFAULT_WORKING_HOURS,
  DEFAULT_TOUR_POLICIES,
  DEFAULT_HOTEL_AMENITIES,
  DEFAULT_BUSINESS_LICENSE,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_PAGE_BANNERS,
  DEFAULT_SITE_INFO,
  DEFAULT_HERO_SLIDES,
  DEFAULT_TESTIMONIALS,
  DEFAULT_PAYMENT_INFO,
} from '@/lib/constants/defaultSettings';

// ==========================================
// Base React Query Settings Hook (Cached 30m)
// ==========================================

export function useSetting<T>(key: string, fallback: T): { data: T; isLoading: boolean; isError: boolean } {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings', key],
    queryFn: async () => {
      try {
        const res: any = await api.get(`/settings/${key}`);
        if (!res) return fallback;
        const val = res.value !== undefined ? res.value : res;
        return val ?? fallback;
      } catch {
        return fallback;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes fresh (infrequently changing master settings)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache retention in memory
    refetchOnWindowFocus: false,
  });

  return {
    data: (data ?? fallback) as T,
    isLoading,
    isError,
  };
}

// ==========================================
// Feature-Specific Convenience Hooks
// ==========================================

export function useFeaturedDestinations() {
  return useSetting('home_featured_destinations', DEFAULT_DESTINATIONS);
}

export function useWhyChooseUs() {
  return useSetting('home_why_choose_us', DEFAULT_WHY_CHOOSE_US);
}

export function useHomeStatsCounters() {
  return useSetting('home_stats_counters', DEFAULT_STATS_COUNTERS);
}

export function useAirportsCatalog() {
  return useSetting('flight_airports', DEFAULT_AIRPORTS);
}

export function useAirlinesCatalog() {
  return useSetting('flight_airlines', DEFAULT_AIRLINES);
}

export function useVisaCountriesCatalog() {
  return useSetting('visa_countries_catalog', []);
}

export function useVisaProcessSteps() {
  return useSetting('visa_process_steps', []);
}

export function useVisaStatsBadges() {
  return useSetting('visa_stats_badges', []);
}

export function useCompanyBranches() {
  return useSetting('company_branches', DEFAULT_BRANCHES);
}

export function useWorkingHours() {
  return useSetting('working_hours', DEFAULT_WORKING_HOURS);
}

export function useTourDefaultPolicies() {
  return useSetting('tour_default_inclusions_exclusions', DEFAULT_TOUR_POLICIES);
}

export function useHotelAmenitiesMaster() {
  return useSetting('hotel_amenities_master', DEFAULT_HOTEL_AMENITIES);
}

export function useBusinessLicense() {
  return useSetting('layout_business_license', DEFAULT_BUSINESS_LICENSE);
}

export function useSocialLinks() {
  return useSetting('layout_social_links', DEFAULT_SOCIAL_LINKS);
}

export function usePageBanners() {
  return useSetting('page_banners', DEFAULT_PAGE_BANNERS);
}

export function useSiteInfo() {
  return useSetting('site_info', DEFAULT_SITE_INFO);
}

export function useHeroBanners() {
  return useSetting('hero_banners', DEFAULT_HERO_SLIDES);
}

export function useTestimonials() {
  return useSetting('testimonials', DEFAULT_TESTIMONIALS);
}

export function usePaymentInfo() {
  return useSetting('payment_info', DEFAULT_PAYMENT_INFO);
}
