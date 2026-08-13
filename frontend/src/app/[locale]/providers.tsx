'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Singleton QueryClient — created once per session, never recreated on re-render
let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // stale-while-revalidate: serve cached data immediately, revalidate in background
        // 5 minutes = navigating back to a page shows data instantly, no loading flash
        staleTime: 5 * 60 * 1000,
        // Keep data in memory for 10 minutes after component unmounts
        gcTime: 10 * 60 * 1000,
        // Don't refetch on window focus — prevents jarring re-renders when switching tabs
        refetchOnWindowFocus: false,
        // Only retry once — prevents blocking UI for 3 retries on bad network
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new client
    return makeQueryClient();
  }
  // Browser: reuse singleton so cache persists across navigations
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
