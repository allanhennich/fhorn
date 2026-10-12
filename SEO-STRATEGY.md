# Fhorn Storage — SEO Strategy

## Target Keywords

### Primary
- Guarda móveis Florianópolis
- Self storage Florianópolis
- Aluguel de box
- Box para alugar

### Secondary
- Guarda móveis para mudança
- Guarda móveis para reforma
- Armazenamento de estoque
- Guarda documentos
- Calculadora de espaço self storage

## URL Structure

| URL | Target Keyword | Page Type |
|-----|---------------|-----------|
| / | Self storage Florianópolis | Homepage |
| /como-funciona/ | Como funciona self storage | Informational |
| /boxes/ | Aluguel de box / Box para alugar | Category |
| /boxes/[slug]/ | [Box name] self storage | Product |
| /guarda-moveis-florianopolis/ | Guarda móveis Florianópolis | Service |
| /self-storage-para-empresas/ | Self storage empresas | Service |
| /armazenamento-de-estoque/ | Armazenamento de estoque | Service |
| /guarda-documentos/ | Guarda documentos | Service |
| /simulador-de-espaco/ | Calculadora espaço self storage | Tool |
| /sobre/ | Fhorn self storage | Institutional |
| /contato/ | - | Contact |
| /blog/ | - | Content Hub |

## Technical SEO Checklist

- [x] Unique title per page (via titleTemplate)
- [x] Meta description per page
- [x] Canonical URLs
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Semantic HTML (h1-h3 hierarchy)
- [x] Breadcrumbs on all inner pages
- [x] JSON-LD LocalBusiness on homepage
- [x] Sitemap XML via @astrojs/sitemap
- [x] robots.txt
- [x] llms.txt
- [x] 404 page
- [x] Alt text on images
- [x] Internal linking between related pages
- [x] Clean URLs with trailing slashes

## Structured Data

### Implemented
- LocalBusiness (homepage)

### To Implement
- FAQPage (como-funciona)
- BlogPosting (blog posts)
- BreadcrumbList (all pages)
- Product (box detail pages) — when pricing is confirmed

## Content Strategy

### Blog Topics (Published)
1. Quanto custa guardar móveis
2. Onde guardar móveis durante uma reforma
3. Como calcular espaço para armazenar móveis
4. Como organizar estoque em self storage

### Future Topics
- Self storage vs. guarda-móveis: diferenças
- Checklist para preparar móveis antes de armazenar
- Vantagens do self storage para e-commerce
- Como escolher o tamanho de box ideal

## Migration Plan (Wix → Astro)

### Current Wix URLs to Map
- Homepage → /
- /nossos-serviços → /boxes/ + service pages
- /contato → /contato/

### Redirects
A 301 redirect map will be prepared before production deployment.
Redirects should be configured at the server level (Apache/Nginx on Plesk).

## Monitoring
- Google Search Console: to be configured post-deploy
- GA4: tracking snippet to be added post-deploy
- Core Web Vitals: target LCP < 2.5s, CLS < 0.1, INP < 200ms
