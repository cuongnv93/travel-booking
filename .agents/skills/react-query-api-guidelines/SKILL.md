---
name: react-query-api-guidelines
description: >-
  Best practices and mandatory rules for client-side data fetching and mutations using TanStack Query (React Query).
  Use whenever writing client-side API calls, custom data fetching hooks, or mutations in React and Next.js applications.
---

# ⚡ React Query (TanStack Query) API Guidelines

Always use **TanStack Query (React Query)** for client-side data fetching, caching, synchronization, and state mutations in React and Next.js. Avoid raw `useEffect` + `useState` fetching patterns.

---

## 🎯 Core Principles

1. **No Ad-Hoc `useEffect` Fetching**:
   - Never use `useEffect` + `useState` + `axios/fetch` manually for client component data loading.
   - Always wrap client API calls with `useQuery` or `useMutation`.

2. **Structured Query Keys**:
   - Always use array-based query keys with scope and filter parameters:
     ```ts
     // Good
     queryKey: ['tours', { destination, category, page }]
     queryKey: ['tours', slug]
     queryKey: ['user', 'profile']
     ```

3. **Feature Custom Hooks**:
   - Encapsulate queries and mutations into clean, reusable custom hooks in `@/hooks/` or co-located with features:
     ```ts
     export function useTours(filters: TourFilters) {
       return useQuery({
         queryKey: ['tours', filters],
         queryFn: () => fetchTours(filters),
         staleTime: 1000 * 60 * 5, // 5 minutes
       });
     }
     ```

4. **Cache Invalidation & Optimistic Updates**:
   - On successful `useMutation`, invalidate affected query keys so UI auto-refreshes:
     ```ts
     const queryClient = useQueryClient();

     export function useCreateBooking() {
       return useMutation({
         mutationFn: createBookingApi,
         onSuccess: () => {
           queryClient.invalidateQueries({ queryKey: ['bookings'] });
         },
       });
     }
     ```

5. **Loading & Error Handling**:
   - Leverage `isLoading`, `isPending`, `isError`, and `error` states directly from query results to render UI feedback cleanly.

---

## 💻 Standard Implementation Pattern

```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// 1. API Fetcher
const fetchTours = async (category?: string) => {
  const { data } = await api.get('/tours', { params: { category } });
  return data;
};

// 2. Custom Query Hook
export function useTours(category?: string) {
  return useQuery({
    queryKey: ['tours', category],
    queryFn: () => fetchTours(category),
    enabled: true,
  });
}

// 3. Custom Mutation Hook
export function useCreateTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTourData: any) => api.post('/tours', newTourData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    },
  });
}
```
