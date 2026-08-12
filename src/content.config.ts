import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Nota sobre .nullish() vs .optional():
//   .optional()  -> acepta undefined (o campo ausente en el YAML)
//   .nullish()   -> acepta undefined Y null
// Sveltia CMS a veces escribe `campo: null` en el YAML cuando dejas un
// campo opcional vacío, y eso rompe .optional(). Por eso usamos .nullish()
// en todos los campos opcionales — así el build nunca se rompe por dejar
// algo en blanco desde el panel.

// BLOG: las entradas viven en la RAIZ del dominio con su slug legacy.
// El campo `slug` es la URL exacta y NO debe cambiarse en entradas ya publicadas.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      slug: z.string(), // ruta exacta: manueldhers.com/<slug>/
      category: z
        .enum(['Diario de Campo', 'Migración Inmóvil', 'Cuidados', 'Crisis venezolana', 'Venezuela', 'Opinión'])
        .nullish(),
      categories: z.array(z.string()).nullish(),
      description: z.string().nullish(),
      cover: image().nullish(),
      draft: z.boolean().default(false),
    }),
});

// PUBLICACIONES: papers, ensayos y artículos académicos.
const publicaciones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publicaciones' }),
  schema: z.object({
    title: z.string(),
    authors: z.string().default("D'Hers, M."),
    year: z.number(),
    tipo: z.enum(['Prensa', 'Artículos', 'Trabajos académicos']).default('Artículos'),
    venue: z.string().nullish(),           // revista / editorial / medio
    url: z.string().url().nullish(),       // enlace al texto
    doi: z.string().nullish(),
    citation: z.string().nullish(),        // "Cómo citar"
    downloads: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
    order: z.number().nullish(),
  }),
});

// EN OTROS MEDIOS: se fusionó en 'publicaciones' con tipo='Prensa'.
// (Colección legacy; se removió del sistema en v2 del diseño.)

// PAGES: textos editables de páginas fijas (bio / home).
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullish(),
    // Campos para la home (src/content/pages/home.md):
    eyebrow: z.string().nullish(),   // "Antropología · Cuidado · Venezuela ◆ 2026"
    role: z.string().nullish(),      // "Doctor en Antropología · URV"
    // Campos para la bio (src/content/pages/bio.md):
    formacion: z.array(z.object({
      degree: z.string(),
      detail: z.string(),
    })).nullish(),
    ubicacion: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).nullish(),
    perfiles: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
      display: z.string(),
    })).nullish(),
    topics: z.array(z.string()).nullish(),
  }),
});

export const collections = { blog, publicaciones, pages };
