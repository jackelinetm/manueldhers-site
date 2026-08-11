import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
        .enum(['Diario de Campo', 'Migración Inmóvil', 'Cuidados', 'Crisis venezolana', 'Venezuela'])
        .optional(),
      categories: z.array(z.string()).optional(),
      description: z.string().optional(),
      cover: image().optional(),
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
    venue: z.string().optional(),          // revista / editorial / medio
    url: z.string().url().optional(),      // enlace al texto
    doi: z.string().optional(),
    citation: z.string().optional(),       // "Cómo citar"
    downloads: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
    order: z.number().optional(),
  }),
});

// EN OTROS MEDIOS: se fusionó en 'publicaciones' con tipo='Prensa'.
// (Colección legacy; se removió del sistema en v2 del diseño.)

// PAGES: textos editables de páginas fijas (bio / home).
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Campos para la home (src/content/pages/home.md):
    eyebrow: z.string().optional(),   // "Antropología · Cuidado · Venezuela ◆ 2026"
    role: z.string().optional(),      // "Doctor en Antropología · URV"
    // Campos para la bio (src/content/pages/bio.md):
    formacion: z.array(z.object({
      degree: z.string(),
      detail: z.string(),
    })).optional(),
    ubicacion: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional(),
    perfiles: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
      display: z.string(),
    })).optional(),
    topics: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, publicaciones, pages };
