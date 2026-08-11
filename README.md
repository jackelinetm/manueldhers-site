# Sitio de Manuel D'Hers · Astro + Sveltia CMS

Sitio estático nuevo (reemplaza el WordPress infectado) con el **diseño Crema · nombre natural** aplicado y las **19 entradas** del blog importadas conservando sus URLs originales.

## Correr en local

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera /dist (lo que se publica)
```

## Estructura

```
src/
  consts.ts                 -> datos globales del sitio (título, nav, ORCID)
  content.config.ts         -> esquema de las colecciones (schemas Zod)
  content/
    blog/                   -> 19 entradas del WordPress (una por Markdown)
    publicaciones/          -> papers / ensayos / artículos académicos
    medios/                 -> "En otros medios" (prensa)
    pages/bio.md            -> texto de la Bio (editable en el panel)
  components/
    BaseHead.astro          -> TODO el SEO (title, OG, JSON-LD, sitemap)
    Header.astro            -> nav horizontal + hamburguesa móvil
    Footer.astro            -> footer navy con contacto y perfiles
  layouts/
    Base.astro              -> shell + sistema de diseño global + overlay móvil
    Post.astro              -> artículo con lede, byline, prose
  pages/
    index.astro             -> home (hero + escritos recientes + del blog)
    bio.astro               -> bio (dos columnas: prose + sidebar)
    publicaciones/index.astro -> lista con filtros + "En otros medios"
    blog/index.astro        -> lista de las 19 entradas
    [slug].astro            -> ruta dinámica que sirve cada entrada en /<slug>/
public/
  admin/                    -> Sveltia CMS (index.html + config.yml)
  uploads/                  -> imágenes y PDFs referenciados desde el contenido
  _redirects                -> 301s (Congresos → home, paginación vieja)
  robots.txt
```

## Sistema de diseño

- **Paleta**: crema `#F1ECDD`, navy `#0A2340`, terracota `#B84A2E`
- **Tipografía**: Inter (400/500/700/900) + JetBrains Mono (400/500) desde Google Fonts
- **Principios**: contenido primero, palabras enteras (sin cortes con guión), escala respiratoria, terracota como acento nunca como bloque

## Regla de oro

**Nunca cambies el campo `slug`** de una entrada ya publicada. Ese slug ES la URL (`manueldhers.com/<slug>/`). Para cualquier URL que deba cambiar, añade una línea a `public/_redirects`.

## Despliegue

Ver `DEPLOY.md` — guía paso a paso: GitHub → Cloudflare Pages → nameservers en Piensa → Sveltia CMS auth → panel de Manuel → Google Search Console.

## Datos del autor

- Manuel D'Hers Del Pozo — Doctor en Antropología y Comunicación (URV)
- ORCID: `0000-0002-5812-2612`
- Academia.edu: `urv.academia.edu/ManuelDHers`
- X: `@manuchente`
- Temas: reorganización social del cuidado, migración inmóvil, diáspora venezolana, cartografías postnacionales
