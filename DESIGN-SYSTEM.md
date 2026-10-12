# Fhorn Storage — Design System

## Brand Colors

### Primary (Brand Blue)
- `--color-brand-900`: #0c2340 (darkest, footer/header bg)
- `--color-brand-700`: #163d73 (primary actions)
- `--color-brand-500`: #2563a8 (links, accents)
- `--color-brand-100`: #daeaf9 (light backgrounds)
- `--color-brand-50`: #edf5fc (subtle tints)

### Accent (Warm Orange)
- `--color-accent-500`: #dd6b20 (CTA buttons)
- `--color-accent-400`: #ed8936 (hover states, highlights)

### Neutral
Full scale from `--color-neutral-950` (#0a0a0b) to `--color-neutral-50` (#fafafa)

## Typography

### Font Stack
- **Display/Headings**: Plus Jakarta Sans (600, 700, 800)
- **Body**: Inter (400, 500, 600, 700)
- **Mono**: JetBrains Mono (code blocks)

### Scale
- Display: 3.5rem (desktop h1)
- H1: 2.75rem
- H2: 2rem
- H3: 1.5rem
- H4: 1.25rem
- Body large: 1.125rem
- Body: 1rem
- Small: 0.875rem
- XS: 0.75rem

## Spacing
- Section padding: 6rem (desktop), 4rem (mobile)
- Container max-width: 1200px with 1.25rem/2rem padding

## Components

### Buttons
- `.btn-primary`: Accent orange, white text
- `.btn-secondary`: Brand blue, white text
- `.btn-outline`: Transparent with white border (on dark)
- `.btn-ghost`: Transparent with brand text
- `.btn-lg`: Larger padding variant

### Cards
- White background, 1px neutral-200 border
- radius-lg (0.75rem)
- Hover: translateY(-4px) + shadow
- No excessive shadows at rest

### Section Labels
- Uppercase, xs text, brand-500 color, letter-spacing 0.1em

## Design Principles
1. **No generic AI look**: Avoid uniform gradients, identical cards, excessive shadows
2. **Typography-driven**: Hierarchy through size, weight, and spacing
3. **Restrained motion**: Subtle hover transitions, respect reduced-motion
4. **Content-first**: Real information over decorative elements
5. **Mobile-first**: All layouts start from single column
