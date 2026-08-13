---
name: performance-seo-optimization
description: >-
  Comprehensive Next.js, React 19, and Technical SEO performance guidelines. Enforces re-render prevention, image/file optimization, code splitting, bundle reduction, and search engine crawlability.
  Activates when building components, optimizing page speed, auditing bundle size, or enhancing SEO.
---

# Next.js & React Performance & SEO Optimization Skill

## Core Objective
Ensure the application achieves 100% Core Web Vitals (LCP < 2.5s, FID/INP < 100ms, CLS < 0.1), instantaneous client-side navigation, and flawless search engine indexing.

---

## 1. Next.js App Router Architecture & Root Layout Rules
*   **Single Root `<html>` & `<body>`**: Only `app/layout.tsx` (the top-level root layout) MUST contain `<html>` and `<body>` tags. Sub-layouts (e.g., `app/[locale]/layout.tsx`, `app/admin/layout.tsx`) MUST NOT render `<html>` or `<body>` to prevent full document rehydrations and client-side navigation delays.
*   **Font Optimization**: Use `next/font/local` or `next/font/google` with `display: 'swap'` to eliminate FOIT (Flash of Invisible Text).

---

## 2. Re-render Prevention & React State Hygiene
*   **State Colocation**: Keep transient UI state (e.g., modal visibility, input focus, hover tooltips) in local leaf components instead of global state stores (Redux, Zustand) or parent containers.
*   **Memoization & Stable References**:
    *   Use `useMemo` for heavy array filtering, sorting, or data transformations.
    *   Use `useCallback` for event handlers passed down to memoized child components (`React.memo`).
    *   Avoid creating inline object or array literals inside render loops (`items.map(x => <Component style={{ color: 'red' }} />)`).
*   **TanStack Query Best Practices**:
    *   Set appropriate `staleTime` (e.g., 5-10 minutes for static site settings, 1-2 minutes for tour listings) to prevent redundant API re-fetching on tab focus.
    *   Use `select` option in `useQuery` to transform server payloads into minimal, immutable client state.

---

## 3. Asset & Image Optimization
*   **Hero / Above-The-Fold Images**: Set `priority` attribute on the primary LCP image (`<Image priority ... />`).
*   **Below-The-Fold Images**: Use native lazy loading (`loading="lazy"`) and explicit responsive `sizes` attribute (`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`).
*   **Modern Image Formats**: Enforce WebP and AVIF image compression via `next.config.js` image optimization domains.
*   **Image Dimensions**: Always provide explicit `width` and `height` (or `fill` with relative container) to prevent Cumulative Layout Shift (CLS).

---

## 4. Code Splitting & Bundle Size Reduction
*   **Dynamic Imports**: Use `next/dynamic` with `ssr: false` for heavy client-only modals, rich text editors, or interactive map libraries.
*   **Tree-Shaking Icons & Helpers**: Import specific icon symbols directly (`import { Search, MapPin } from 'lucide-react'`) rather than importing entire library barrels.
*   **Package Auditing**: Avoid bloated legacy packages; prefer modern zero-dependency utilities.

---

## 5. SEO, Metadata & Structured Data (JSON-LD)
*   **Dynamic Metadata**: Implement `generateMetadata()` for dynamic routes (`/tours/[slug]`, `/hotels/[slug]`, `/news/[slug]`).
*   **Canonical URLs**: Set explicit `alternates.canonical` and hreflang links for multi-language locales (`/vi`, `/en`).
*   **Open Graph & Social Cards**: Include high-resolution OG images (`1200x630px`), titles, and localized descriptions for social sharing (Facebook, Zalo, Twitter).
*   **Structured Data (JSON-LD)**: Inject schema.org JSON-LD scripts (`TravelAgency`, `Product`, `TouristAttraction`, `Hotel`, `BreadcrumbList`) for rich search snippets in Google results.
