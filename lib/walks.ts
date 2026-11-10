import { prisma } from '@/lib/prisma'

export type PastWalkRow = {
  id: string
  slug: string
  title: string
  startsAt: Date
  endsAt: Date | null
}

export async function getPastWalksForUser(userId: string): Promise<PastWalkRow[]> {
  const tickets = await prisma.ticket.findMany({
    where: {
      userId,
      walk: { startsAt: { lt: new Date() } },
    },
    select: {
      walk: {
        select: { id: true, slug: true, title: true, startsAt: true, endsAt: true },
      },
    },
    orderBy: { walk: { startsAt: 'desc' } },
    distinct: ['walkId'],
  })

  return tickets.map((t) => t.walk)
}

export type WalkTableRow = {
  id: string
  slug: string
  title: string
  startsAt: Date
  endsAt: Date | null
  priceKopecks: number
  minPriceKopecks: number
  ticketTypeCount: number
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
      endsAt: true,
      priceKopecks: true,
      capacity: true,
      _count: { select: { tickets: true } },
      ticketTypes: { select: { priceKopecks: true } },
    },
    orderBy: { startsAt: 'asc' },
    take: options?.limit,
  })

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    startsAt: r.startsAt,
    endsAt: r.endsAt,
    priceKopecks: r.priceKopecks,
    minPriceKopecks: r.ticketTypes.length > 0
      ? Math.min(...r.ticketTypes.map((t) => t.priceKopecks ?? 0))
      : r.priceKopecks,
    ticketTypeCount: r.ticketTypes.length,
    capacity: r.capacity,
    ticketsSold: r._count.tickets,
  }))
}
