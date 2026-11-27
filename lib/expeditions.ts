import { prisma } from '@/lib/prisma'
import { EventStatus, Prisma } from '@/generated/prisma/client'

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

export type ExpeditionGalleryItem  = { url: string; info: string }
export type ExpeditionChecklistItem = { title: string; text: string }

export type ExpeditionDayRow = {
  id: string
  dayNumber: number
  title: string
  description: string
  photoUrl: string | null
  photoCredit: string | null
}

export type ExpeditionGuideRow = {
  name: string
  photoUrl: string
  education: string | null
  achievements: string | null
  profileLinks: string[]
}

export type ExpeditionTicketTypeRow = {
  id: number
  name: string
  priceKopecks: number | null
  capacity: number
  sortOrder: number
}

export type ExpeditionPageRow = {
  id: string
  title: string
  description: string
  startsAt: Date
  endsAt: Date | null
  coverPhotoUrl: string
  coverPhotoCredit: string | null
  durationDays: number | null
  totalSpots: number
  spotsLeft: number
  difficulty: number | null
  aboutTitle: string | null
  aboutText: string | null
  galleryItems: ExpeditionGalleryItem[]
  checklistItems: ExpeditionChecklistItem[]
  includedItems: string[]
  excludedItems: string[]
  guides: ExpeditionGuideRow[]
  days: ExpeditionDayRow[]
  ticketTypes: ExpeditionTicketTypeRow[]
}

export async function getExpeditionTitle(slug: string): Promise<string | null> {
  const row = await prisma.expedition.findFirst({
    where: { slug, status: EventStatus.ACTIVE },
    select: { title: true },
  })
  return row?.title ?? null
}

export async function getActiveExpeditions(options?: { limit?: number }): Promise<ExpeditionCardRow[]> {
  const rows = await prisma.expedition.findMany({
    where: { status: EventStatus.ACTIVE, startsAt: { gte: new Date() } },
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

export async function getExpeditionBySlug(slug: string): Promise<ExpeditionPageRow | null> {
  const row = await prisma.expedition.findFirst({
    where: { slug, status: EventStatus.ACTIVE },
    select: {
      id: true,
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
      coverPhotoUrl:    true,
      coverPhotoCredit: true,
      durationDays:     true,
      totalSpots: true,
      spotsLeft: true,
      difficulty: true,
      aboutTitle: true,
      aboutText: true,
      galleryItems: true,
      checklistItems: true,
      includedItems: true,
      excludedItems: true,
      guides: {
        select: { name: true, photoUrl: true, education: true, achievements: true, profileLinks: true },
        orderBy: { sortOrder: 'asc' },
      },
      days: {
        select: { id: true, dayNumber: true, title: true, description: true, photoUrl: true, photoCredit: true },
        orderBy: { dayNumber: 'asc' },
      },
      ticketTypes: {
        select: { id: true, name: true, priceKopecks: true, capacity: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!row) return null

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    coverPhotoUrl:    row.coverPhotoUrl,
    coverPhotoCredit: row.coverPhotoCredit,
    durationDays:     row.durationDays,
    totalSpots: row.totalSpots,
    spotsLeft: row.spotsLeft,
    difficulty: row.difficulty,
    aboutTitle: row.aboutTitle,
    aboutText: row.aboutText,
    galleryItems:   (row.galleryItems as Prisma.JsonArray).map(g => g as ExpeditionGalleryItem),
    checklistItems: (row.checklistItems as Prisma.JsonArray).map(c => c as ExpeditionChecklistItem),
    includedItems: row.includedItems,
    excludedItems: row.excludedItems,
    guides: row.guides.map(g => ({
      name: g.name,
      photoUrl: g.photoUrl,
      education: g.education,
      achievements: g.achievements,
      profileLinks: g.profileLinks,
    })),
    days: row.days.map(d => ({
      id: d.id,
      dayNumber: d.dayNumber,
      title: d.title,
      description: d.description,
      photoUrl: d.photoUrl,
      photoCredit: d.photoCredit,
    })),
    ticketTypes: row.ticketTypes.map(t => ({
      id: t.id,
      name: t.name,
      priceKopecks: t.priceKopecks,
      capacity: t.capacity,
      sortOrder: t.sortOrder,
    })),
  }
}
