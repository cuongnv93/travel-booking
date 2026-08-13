---
name: admin-ui-stability
description: Strict guidelines for Admin CMS UI components to prevent unstyled pages, build errors, syntax crashes, and invalid App Router exports.
---

# Admin CMS UI Stability Rules & Best Practices

## Mandatory Rules for Admin CMS Code Changes:

1. **Import `globals.css` in Admin Layout**:
   - `src/app/admin/layout.tsx` must explicitly import `import '../globals.css';` at line 2. This prevents any CSS loss if routing or layout hydration fails.

2. **Never Export Non-Component Symbols from App Router `page.tsx`**:
   - Files matching `src/app/admin/**/page.tsx` must ONLY export `default function PageComponent()`.
   - Never export helper functions, type definitions, or constants from `page.tsx` as Next.js App Router enforces strict page export constraints.

3. **Strict JSX Balancing & Lucide Icon Imports**:
   - Before modifying any file in `src/app/admin/`, verify that all JSX opening `<div...>` tags match their closing `</div>` tags.
   - Verify every Lucide icon used in the component (e.g. `FileText`, `Flame`, `Building2`, `Users`, etc.) is explicitly imported from `'lucide-react'`.

4. **Always Run `npm run lint` Verification**:
   - After modifying ANY file in `src/app/admin/` or `src/components/`, execute `cmd /c npm run lint` in `frontend` to verify 0 syntax warnings or build errors before delivering to the user.

5. **Provide Error Boundary**:
   - `src/app/admin/error.tsx` must exist and render a styled fallback with Tailwind CSS styling so that runtime errors never revert to unstyled 500 pages.
