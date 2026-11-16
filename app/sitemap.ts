import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://birdwatching.moscow'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE_URL,                                   priority: 1.0,  changeFrequency: 'weekly'  },
  { url: `${BASE_URL}/walks`,                        priority: 0.9,  changeFrequency: 'daily'   },
  { url: `${BASE_URL}/expeditions`,                  priority: 0.9,  changeFrequency: 'weekly'  },
  { url: `${BASE_URL}/birdid`,                       priority: 0.8,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/about`,                        priority: 0.7,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/partners`,                     priority: 0.6,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/media`,                        priority: 0.6,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/faq`,                          priority: 0.5,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/private-walks`,                priority: 0.7,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/private-consultations`,        priority: 0.6,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/private-lectures`,             priority: 0.6,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/private-events`,               priority: 0.6,  changeFrequency: 'monthly' },
  { url: `${BASE_URL}/oferta`,                       priority: 0.3,  changeFrequency: 'yearly'  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [walks, expeditions] = await Promise.all([
    prisma.walk.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, publishedAt: true },
    }),
    prisma.expedition.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, publishedAt: true },
    }),
  ])

  const walkRoutes: MetadataRoute.Sitemap = walks.map(({ slug, publishedAt }) => ({
    url: `${BASE_URL}/walks/${slug}`,
    lastModified: publishedAt ?? undefined,
    priority: 0.8,
    changeFrequency: 'weekly',
  }))

  const expeditionRoutes: MetadataRoute.Sitemap = expeditions.map(({ slug, publishedAt }) => ({
    url: `${BASE_URL}/expeditions/${slug}`,
    lastModified: publishedAt ?? undefined,
    priority: 0.8,
    changeFrequency: 'weekly',
  }))

  return [...staticRoutes, ...walkRoutes, ...expeditionRoutes]
}
