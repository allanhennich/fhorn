# Fhorn Self Storage — Projeto Web

## Stack
- **Framework**: Astro 7 (static build)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` + CSS custom properties
- **Interactivity**: React Islands (calculator only)
- **Icons**: Lucide React (React components), inline SVGs (Astro components)
- **Content**: Astro Content Collections (blog)

## Development

```bash
npm run dev -- --host 127.0.0.1 --port 4321
npm run build
npm run preview
```

## Project Structure
```
src/
  components/    # UI components organized by feature area
  layouts/       # Base page layout (BaseLayout.astro)
  pages/         # File-based routing
  data/          # TypeScript data files (storageUnits, calculatorItems, navigation)
  content/       # Markdown content (blog posts)
  config/        # Site configuration (site.ts)
  styles/        # Global CSS and design tokens (global.css)
  lib/           # Utility functions
public/
  images/        # Static images
  videos/        # Hero video files (to be provided)
  icons/         # Static icon assets
```

## Key Files
- `src/config/site.ts` — All site-wide configuration (contact, address, SEO defaults)
- `src/data/storageUnits.ts` — Storage box definitions with TypeScript types
- `src/data/calculatorItems.ts` — Calculator object definitions and volumes
- `src/data/navigation.ts` — All navigation structures
- `src/styles/global.css` — Design tokens and base styles

## Conventions
- All box data is demonstrative (`isDemonstrative: true`)
- No fictitious pricing, reviews, or certifications
- WhatsApp number from site config; fallback to contact page if not configured
- Portuguese (pt-BR) throughout
- WCAG 2.2 AA compliance target
- prefers-reduced-motion respected

## SEO
- Each page has unique title, description, canonical
- JSON-LD LocalBusiness on homepage
- Sitemap via @astrojs/sitemap
- robots.txt and llms.txt in public/
- Blog using Content Collections with frontmatter metadata

## Future Backend
- PHP 8.2+ / MariaDB / Plesk
- Frontend is decoupled; data layer ready for API migration
- No external database services (no Supabase, Firebase)

## Documentation

Full Astro documentation: https://docs.astro.build

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Components](https://docs.astro.build/en/basics/astro-components/)
- [Framework Components](https://docs.astro.build/en/guides/framework-components/)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling](https://docs.astro.build/en/guides/styling/)
