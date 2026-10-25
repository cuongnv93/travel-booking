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
