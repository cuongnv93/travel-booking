# Design System

## Stack
- framework: Next.js App Router
- styling: Tailwind CSS
- components: custom React components
- animation: Framer Motion
- icons: lucide-react

## Tokens
- brand: blue-600
- bg-base: slate-50
- text-primary: slate-900
- radius: 8px
- shadow: layered utility shadows
- font: local Geist variable font exposed as `--font-inter`

## Decisions
- 2026-08-12 - init: Next.js + Tailwind detected. Existing travel booking UI uses slate surfaces, blue actions, local app fonts, and custom UI primitives.
- 2026-08-12 - font: replaced Google-hosted Inter with bundled Geist font so production builds work without network access.

## Components
- Existing: Button, Card, Input, Modal, Skeleton, Toast, Header, Footer, MobileMenu, LanguageSwitcher, TourCard, TourBookingForm, TourDetailClient, home sections, admin shell.

## Non-Goals
- No Figma sync
- No image generation
