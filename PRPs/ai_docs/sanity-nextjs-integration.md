# Sanity CMS + Next.js 16 Integration Guide

**Created**: January 6, 2026
**Purpose**: Reference documentation for integrating Sanity CMS with Next.js 16 App Router in Turborepo monorepo

---

## Installation

```bash
# In app directory (apps/newhomeshow)
npm install next-sanity @sanity/image-url @sanity/visual-editing

# In monorepo root (optional separate Sanity studio)
npm create sanity@latest -- --project-id <id> --dataset production --template clean
```

## Package Structure

```
packages/
├── sanity/                    # Shared Sanity config (new package)
│   ├── src/
│   │   ├── client.ts          # Sanity client instance
│   │   ├── schemas/           # Document schemas
│   │   │   ├── builderProject.ts
│   │   │   ├── productType.ts
│   │   │   └── index.ts
│   │   ├── queries/           # GROQ queries
│   │   │   └── projects.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
```

## Sanity Client Setup

```typescript
// packages/sanity/src/client.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})

// For preview/draft content
export const previewClient = createClient({
  ...client.config(),
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
```

## Schema Definition Pattern

```typescript
// packages/sanity/src/schemas/builderProject.ts
import { defineType, defineField } from 'sanity'

export const builderProject = defineType({
  name: 'builderProject',
  title: 'Builder Project',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Project Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Coming Soon', value: 'coming-soon' },
          { title: 'Now Selling', value: 'selling' },
          { title: 'Sold Out', value: 'sold-out' }
        ]
      }
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }]
    }),
    defineField({
      name: 'intersection',
      title: 'Intersection',
      type: 'string',
      description: 'e.g., "Whitevale Rd. & Brock Rd."'
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string'
    }),
    defineField({
      name: 'startingPrice',
      title: 'Starting Price',
      type: 'number'
    }),
    defineField({
      name: 'productTypes',
      title: 'Product Types',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'productType' }] }]
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    })
  ]
})
```

## GROQ Query Patterns

```typescript
// packages/sanity/src/queries/projects.ts
import { groq } from 'next-sanity'

export const allProjectsQuery = groq`
  *[_type == "builderProject"] | order(status asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    status,
    intersection,
    city,
    startingPrice,
    "featuredImage": featuredImage.asset->url,
    productTypes[]-> {
      name,
      priceRange
    }
  }
`

export const projectBySlugQuery = groq`
  *[_type == "builderProject" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    status,
    intersection,
    city,
    startingPrice,
    description,
    features,
    "featuredImage": featuredImage.asset->url,
    "gallery": gallery[].asset->url,
    productTypes[]-> {
      name,
      priceRange,
      features
    }
  }
`
```

## Data Fetching in Next.js 16

```typescript
// apps/newhomeshow/lib/projects.ts
import { client } from '@repo/sanity'
import { allProjectsQuery, projectBySlugQuery } from '@repo/sanity/queries'
import type { BuilderProject } from '@repo/types'

export async function getAllProjects(): Promise<BuilderProject[]> {
  return client.fetch(allProjectsQuery, {}, {
    next: { tags: ['projects'] }
  })
}

export async function getProjectBySlug(slug: string): Promise<BuilderProject | null> {
  return client.fetch(projectBySlugQuery, { slug }, {
    next: { tags: [`project-${slug}`] }
  })
}
```

## Revalidation with Webhooks

```typescript
// apps/newhomeshow/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

export async function POST(req: Request) {
  try {
    const { body, isValidSignature } = await parseBody(
      req,
      process.env.SANITY_WEBHOOK_SECRET
    )

    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
    }

    const { _type, slug } = body

    if (_type === 'builderProject') {
      revalidateTag('projects')
      if (slug?.current) {
        revalidateTag(`project-${slug.current}`)
      }
    }

    return NextResponse.json({ revalidated: true })
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
```

## Image Optimization

```typescript
// packages/sanity/src/image.ts
import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Usage in components
// urlFor(project.featuredImage).width(800).height(600).url()
```

## Environment Variables

```bash
# Required for Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production

# Optional for preview/mutations
SANITY_API_TOKEN=sk...

# For webhook revalidation
SANITY_WEBHOOK_SECRET=your-webhook-secret
```

## TypeGen for Type Safety

```bash
# Generate TypeScript types from Sanity schema
npx sanity schema extract
npx sanity typegen generate
```

This creates typed query helpers and ensures type safety between Sanity schema and TypeScript.

---

## References

- [next-sanity Documentation](https://github.com/sanity-io/next-sanity)
- [Sanity TypeGen](https://www.sanity.io/docs/sanity-typegen)
- [GROQ Cheat Sheet](https://www.sanity.io/docs/groq-cheat-sheet)
- [Next.js ISR with Sanity](https://www.sanity.io/docs/nextjs-integration)
