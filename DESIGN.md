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
- Header (`src/components/layout/Header.tsx`)
- Footer (`src/components/layout/Footer.tsx`)

## Non-Goals
- No Figma sync
- No image generation
