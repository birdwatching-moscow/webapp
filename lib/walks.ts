import { prisma } from '@/lib/prisma'

export type WalkTableRow = {
  id: string
  slug: string
  title: string
  startsAt: Date
  duration: string | null
  priceKopecks: number
  capacity: number
  ticketsSold: number
}

export async function getActiveWalks(options?: { limit?: number }): Promise<WalkTableRow[]> {
  const rows = await prisma.walk.findMany({
    where: { status: 'ACTIVE', startsAt: { gte: new Date() } },
    select: {
      id: true,
      slug: true,
      title: true,
      startsAt: true,
      duration: true,
      priceKopecks: true,
      capacity: true,
      _count: { select: { tickets: true } },
    },
    orderBy: { startsAt: 'asc' },
    take: options?.limit,
  })

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    startsAt: r.startsAt,
    duration: r.duration,
    priceKopecks: r.priceKopecks,
    capacity: r.capacity,
    ticketsSold: r._count.tickets,
  }))
}
