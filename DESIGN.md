# Design System

## Stack
- framework: Next.js 14 (App Router)
- styling: Tailwind CSS 3.4
- components: Custom React components, Lucide React icons
- animation: Framer Motion
- icons: lucide-react

## Tokens
- brand: #2563eb (Blue 600) / #0d9488 (Teal 600)
- bg-base: #f8fafc (Slate 50) / #0f172a (Slate 900)
- text-primary: #0f172a (Slate 900) / #f8fafc (Slate 50)
- radius: 12px / 16px / 24px (rounded-xl, rounded-2xl, rounded-3xl)
- shadow: layered, smooth ambient shadows (`shadow-sm`, `shadow-md`, `shadow-xl`, `shadow-2xl`)

## Decisions
- 2026-10-10 — init: Next.js 14 + Tailwind CSS detected. `next-tailwind` preset applied.
- 2026-10-10 — responsive & layout synchronization: Landing page responsive layout audit and anti-CLS optimization.
- 2026-10-24 — landing & detail views audit: Fixed mojibake in DestinationsSection, enabled server initialData hydration in HotelDetailClient, added isFeatured/limit backend query filtering for hotels, cleaned next-intl fallback warnings, and standardized search param handling across listings.
- 2026-10-25 — NewsSection editorial bento upgrade: Refactored home news section to an asymmetrical Bento Grid (60% hero spotlight + 40% trending ranking list), real-time category filtering tabs with spring animations, reading time calculation, and zero-CLS skeleton loader.
- 2026-10-25 — News Listing page editorial upgrade (Phase 2): Added real-time instant search bar with clear button, interactive hot destination tags (#Đà Lạt, #Phú Quốc, #Đà Nẵng...), grid vs list view mode switcher, sort filter, reading time badges, client-side bookmarking, and VIP travel newsletter subscription box.
- 2026-10-25 — News search refinement: Removed default emojis/icons in search & category tabs, replaced destination pills with circular avatar photos matching QuickSearch home component design.
- 2026-10-25 — Tour card aspect ratio standardization: Standardized tour, flash sale, destination, and hotel card images to a unified `aspect-[16/10]` ratio, eliminating distorted square vs wide rectangular inconsistencies across variable grid columns.
- 2026-10-26 — 6-item home grid layout: Upgraded FeaturedTours and FeaturedHotels to display 6 balanced items (2 rows of 3 columns), added 4 new 5-star hotels (Ha Long, Da Lat, Hoi An, Nha Trang) and automatic backfill fallback logic.
- 2026-10-26 — Testimonials spacing optimization: Harmonized excessive top/bottom spacing around "Đánh Giá Từ Khách Hàng". Removed redundant nested `py-16` and full-width background clash, converted Testimonials to `container mx-auto px-4 md:px-6 relative` matching the unified section rhythm, tightened Swiper bottom padding from `!pb-12` to `!pb-6`, and optimized `WhyChooseUs` vertical padding from `py-20` to `py-12 sm:py-16`.
- 2026-10-26 — News hot destinations & i18n audit: Eliminated horizontal scrollbar in popular destinations filter by reducing list to the top 6 premier destinations (Đà Lạt, Phú Quốc, Đà Nẵng, Hà Nội, Sa Pa, Hạ Long) and switching to natural `flex-wrap` wrapping. Resolved hardcoded strings across NewsClient and NewsSection by adding 15 new translation keys to all 5 supported locales (VI, EN, ZH, KO, JA).
- 2026-10-26 — Google Technical SEO Audit & 100% Score Optimization: Enforced strict HTML5 landmarks (exactly one `<main id="main-content">` enclosing `<h1>` on every route, zero nested `<main>` tags), eliminated 4 redundant dummy layouts overriding localized metadata with static strings, synchronized `document.documentElement.lang` on dynamic locale shifts, added Google multilingual `xhtml:link` alternates to `sitemap.xml` (184KB+ sitemap), expanded `robots.txt` disallows for auth/cart/checkout routes, added `aggregateRating` and `Product` rich snippet schemas for Google search star rating results, added descriptive image `alt` tags and lazy loading to all thumbnail components, and exported Next.js `viewport` with theme-color.

## Components
- HeroBanner (`src/components/home/HeroBanner.tsx`)
- SearchTabs (`src/components/home/SearchTabs.tsx`)
- FlashSaleSection (`src/components/home/FlashSaleSection.tsx`)
- DestinationsSection (`src/components/home/DestinationsSection.tsx`)
- FeaturedTours (`src/components/home/FeaturedTours.tsx`)
- FeaturedHotels (`src/components/home/FeaturedHotels.tsx`)
- WhyChooseUs (`src/components/home/WhyChooseUs.tsx`)
- Testimonials (`src/components/home/Testimonials.tsx`)
- NewsSection (`src/components/home/NewsSection.tsx`)
- TourDetailClient (`src/components/tours/TourDetailClient.tsx`)
- TourBookingForm (`src/components/tours/TourBookingForm.tsx`)
- HotelDetailClient (`src/app/[locale]/hotels/[slug]/HotelDetailClient.tsx`)
- Header (`src/components/layout/Header.tsx`)
- Footer (`src/components/layout/Footer.tsx`)

## Non-Goals
- No Figma sync
- No image generation
