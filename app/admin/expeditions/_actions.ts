'use server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/permissions'
import { ensureUniqueSlug } from '@/lib/admin/slug'
import { EventStatus, Prisma } from '@/generated/prisma/client'

const MAX_EXPEDITION_GALLERY = 3

async function requireAdmin() {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) throw new Error('Недостаточно прав')
  return session
}

type DayInput = { clientId: string; dayNumber: number; title: string; description: string }
export type ChecklistItem = { title: string; text: string }
export type GalleryItem = { url: string; info: string }
export type TicketTypeInput = { name: string; priceKopecks: number | null; capacity: number }

type ExpeditionInput = {
  type: 'EXPEDITION'
  title: string
  description: string
  startsAt: string
  endsAt?: string
  coverPhotoUrl: string
  coverPhotoCredit?: string | null
  galleryItems: GalleryItem[]
  checklistItems: ChecklistItem[]
  durationDays?: number | null
  aboutTitle?: string | null
  aboutText?: string | null
  difficulty?: number | null
  includedItems?: string[]
  excludedItems?: string[]
  ticketTypes?: TicketTypeInput[]
  totalSpots: number
  spotsLeft: number
  guideIds: string[]
  days: DayInput[]
  slug?: string
}

function validateGallery(items: GalleryItem[]) {
  if (items.length > MAX_EXPEDITION_GALLERY) {
    throw new Error(`Галерея: не более ${MAX_EXPEDITION_GALLERY} изображений.`)
  }
}

export async function createExpedition(input: ExpeditionInput): Promise<string> {
  const session = await requireAdmin()
  validateGallery(input.galleryItems)

  const slug = input.slug ?? await ensureUniqueSlug(input.title, async (s) => {
    const existing = await prisma.expedition.findFirst({ where: { slug: s } })
    return existing != null
  })

  const expedition = await prisma.expedition.create({
    data: {
      slug,
      title: input.title,
      description: input.description,
      startsAt: new Date(input.startsAt),
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      coverPhotoUrl:    input.coverPhotoUrl,
      coverPhotoCredit: input.coverPhotoCredit ?? null,
      galleryItems:     input.galleryItems,
      checklistItems: input.checklistItems,
      durationDays:   input.durationDays ?? null,
      aboutTitle:    input.aboutTitle ?? null,
      aboutText:     input.aboutText ?? null,
      difficulty:    input.difficulty ?? null,
      createdBy:     session.user.email ?? null,
      includedItems: input.includedItems ?? [],
      excludedItems: input.excludedItems ?? [],
      totalSpots:    input.totalSpots,
      spotsLeft:     input.totalSpots,
      guides: { connect: input.guideIds.map((id) => ({ id: parseInt(id, 10) })) },
      days: {
        create: input.days.map((d) => ({
          dayNumber: d.dayNumber,
          title: d.title,
          description: d.description,
        })),
      },
      ticketTypes: {
        create: (input.ticketTypes ?? []).map((t, i) => ({
          name: t.name,
          priceKopecks: t.priceKopecks,
          capacity: t.capacity,
          sortOrder: i,
        })),
      },
    },
  })
  return expedition.id
}

export async function updateExpedition(id: string, input: ExpeditionInput): Promise<void> {
  const session = await requireAdmin()
  validateGallery(input.galleryItems)

  await Promise.all([
    prisma.expeditionDay.deleteMany({ where: { expeditionId: id } }),
    prisma.expeditionTicketType.deleteMany({ where: { expeditionId: id } }),
  ])
  await prisma.expedition.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      startsAt: new Date(input.startsAt),
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      coverPhotoUrl:    input.coverPhotoUrl,
      coverPhotoCredit: input.coverPhotoCredit ?? null,
      galleryItems:     input.galleryItems,
      checklistItems:   input.checklistItems,
      durationDays:     input.durationDays ?? null,
      aboutTitle:       input.aboutTitle ?? null,
      aboutText:        input.aboutText ?? null,
      difficulty:       input.difficulty ?? null,
      includedItems:    input.includedItems ?? [],
      excludedItems:    input.excludedItems ?? [],
      totalSpots:       input.totalSpots,
      spotsLeft:        input.spotsLeft,
      updatedBy:        session.user.email ?? null,
      guides: { set: input.guideIds.map((gid) => ({ id: parseInt(gid, 10) })) },
      days: {
        create: input.days.map((d) => ({
          dayNumber: d.dayNumber,
          title: d.title,
          description: d.description,
        })),
      },
      ticketTypes: {
        create: (input.ticketTypes ?? []).map((t, i) => ({
          name: t.name,
          priceKopecks: t.priceKopecks,
          capacity: t.capacity,
          sortOrder: i,
        })),
      },
    },
  })
}

export async function publishExpedition(id: string): Promise<void> {
  const session = await requireAdmin()
  const expedition = await prisma.expedition.findFirst({ where: { id } })
  if (!expedition) throw new Error('Экспедиция не найдена')
  if (expedition.status === EventStatus.ACTIVE) throw new Error('Экспедиция уже опубликована')
  let publishedBy = expedition.publishedBy
  if (!publishedBy) {
    const userExists = await prisma.user.count({ where: { id: session.user.id } }) > 0
    if (userExists) publishedBy = session.user.id
  }
  await prisma.expedition.update({
    where: { id },
    data: {
      status: EventStatus.ACTIVE,
      publishedAt: expedition.publishedAt ?? new Date(),
      publishedBy,
    },
  })
}

export async function cancelExpedition(id: string): Promise<void> {
  await requireAdmin()
  const expedition = await prisma.expedition.findFirst({ where: { id } })
  if (!expedition) throw new Error('Экспедиция не найдена')
  if (expedition.status !== EventStatus.ACTIVE) throw new Error('Нельзя отменить: экспедиция не активна')
  await prisma.expedition.update({ where: { id }, data: { status: EventStatus.CANCELLED } })
}

export async function reactivateExpedition(id: string): Promise<void> {
  await requireAdmin()
  const expedition = await prisma.expedition.findFirst({ where: { id } })
  if (!expedition) throw new Error('Экспедиция не найдена')
  if (expedition.status !== EventStatus.CANCELLED) throw new Error('Экспедиция не отменена')
  if (expedition.startsAt <= new Date()) throw new Error('Нельзя вернуть в активные: время экспедиции уже прошло')
  await prisma.expedition.update({ where: { id }, data: { status: EventStatus.ACTIVE } })
}

export async function copyExpedition(id: string): Promise<string> {
  const session = await requireAdmin()
  const expedition = await prisma.expedition.findFirst({
    where: { id },
    include: {
      guides:      { select: { id: true } },
      days:        { orderBy: { dayNumber: 'asc' } },
      ticketTypes: { orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!expedition) throw new Error('Экспедиция не найдена')

  const now = new Date()
  const newStartsAt = new Date(expedition.startsAt)
  newStartsAt.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() + 7)

  let newEndsAt: Date | null = null
  if (expedition.endsAt) {
    const duration = expedition.endsAt.getTime() - expedition.startsAt.getTime()
    newEndsAt = new Date(newStartsAt.getTime() + duration)
  }

  const slug = await ensureUniqueSlug(expedition.title, async (s) => {
    const existing = await prisma.expedition.findFirst({ where: { slug: s } })
    return existing != null
  })

  const copy = await prisma.expedition.create({
    data: {
      slug,
      title:          expedition.title,
      description:    expedition.description,
      startsAt:       newStartsAt,
      endsAt:         newEndsAt,
      coverPhotoUrl:    expedition.coverPhotoUrl,
      coverPhotoCredit: expedition.coverPhotoCredit ?? null,
      galleryItems:     expedition.galleryItems as Prisma.InputJsonValue,
      checklistItems: expedition.checklistItems as Prisma.InputJsonValue,
      durationDays:   expedition.durationDays,
      aboutTitle:     expedition.aboutTitle,
      aboutText:      expedition.aboutText,
      difficulty:     expedition.difficulty,
      includedItems:  expedition.includedItems,
      excludedItems:  expedition.excludedItems,
      totalSpots:     expedition.totalSpots,
      spotsLeft:      expedition.totalSpots,
      status:         'DRAFT',
      createdBy:      session.user.email ?? null,
      guides: { connect: expedition.guides.map(g => ({ id: g.id })) },
      days: {
        create: expedition.days.map(d => ({
          dayNumber:   d.dayNumber,
          title:       d.title,
          description: d.description,
        })),
      },
    },
  })

  if (expedition.ticketTypes.length > 0) {
    await prisma.expeditionTicketType.createMany({
      data: expedition.ticketTypes.map((t, i) => ({
        expeditionId: copy.id,
        name:         t.name,
        priceKopecks: t.priceKopecks,
        capacity:     t.capacity,
        sortOrder:    i,
      })),
    })
  }

  return copy.id
}

export async function deleteExpedition(id: string): Promise<void> {
  await requireAdmin()
  const requestCount = await prisma.request.count({ where: { expeditionId: id } })
  if (requestCount > 0) throw new Error('Нельзя удалить экспедицию с заявками.')
  await prisma.expedition.update({ where: { id }, data: { status: 'DELETED' } })
}
