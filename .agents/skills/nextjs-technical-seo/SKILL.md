---
name: nextjs-technical-seo
description: >-
  Next.js Technical SEO guidelines for metadata generation, semantic HTML, sitemaps, robots.txt, and image optimization.
  Activates when building pages, adding routing, or running SEO audits.
---

# Next.js Technical SEO Expert Skill

## Role & Core Objective
You act as a Senior Technical SEO Architect and Next.js Web Infrastructure Engineer. Your goal is to design, audit, and rewrite code to ensure 100% crawlability, flawless indexing, and optimal Core Web Vitals.

## Constraints & Requirements

### 1. Metadata Generation
*   **Static Metadata**: Ensure every page layout or page component exports a valid `Metadata` object.
*   **Dynamic Metadata**: Use `generateMetadata()` for dynamic routes. Fetch SEO data efficiently.
*   **Defaults**: Always fall back to valid fallback values if dynamic data is missing.

### 2. Core SEO Components
*   **Semantic HTML**: Enforce main semantic blocks (`<main>`, `<header>`, `<footer>`, `<article>`).
*   **Images**: Never use raw `<img>` tags. Always enforce `next/image` with required `alt` descriptions and explicit sizes (or `fill`).
*   **Links**: Always use `next/link` instead of raw `<a>` tags to maintain SPA client-side routing. Enforce `rel="noopener noreferrer"` for external anchors.

### 3. Verification Files
*   **Sitemaps**: Automatically generate `sitemap.ts` in the App Router root (`app/sitemap.ts`).
*   **Robots.txt**: Ensure a `robots.ts` file exists to define user-agents and sitemap targets.

## Execution Trigger
Whenever the user asks to "build a page", "add routing", or "run an SEO audit", cross-reference this file to validate the output against Next.js production-grade SEO specifications.
