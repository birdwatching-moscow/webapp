import { prisma } from '@/lib/prisma'

export type ExpeditionCardRow = {
  id: string
  slug: string
  title: string
  description: string
  startsAt: Date
  endsAt: Date | null
  coverPhotoUrl: string
  spotsLeft: number
}

export async function getExpeditionTitle(slug: string): Promise<string | null> {
  const row = await prisma.expedition.findFirst({
    where: { slug, status: 'ACTIVE' },
    select: { title: true },
  })
  return row?.title ?? null
}

export async function getActiveExpeditions(options?: { limit?: number }): Promise<ExpeditionCardRow[]> {
  const rows = await prisma.expedition.findMany({
    where: { status: 'ACTIVE', startsAt: { gte: new Date() } },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
      coverPhotoUrl: true,
      spotsLeft: true,
    },
    orderBy: { startsAt: 'asc' },
    take: options?.limit,
  })

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    startsAt: r.startsAt,
    endsAt: r.endsAt,
    coverPhotoUrl: r.coverPhotoUrl,
    spotsLeft: r.spotsLeft,
  }))
}
