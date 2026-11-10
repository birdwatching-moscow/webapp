'use server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/permissions'
import { ensureUniqueSlug } from '@/lib/admin/slug'

export type TicketTypeInput = {
  name: string
  priceKopecks: number | null
  capacity: number
}

export type UpdateWalkFullData = {
  title: string
  subtitle?: string
  description: string
  startsAt: string
  endsAt?: string
  location: string
  coverPhotoUrl: string
  guideId: number
  guideId2?: number
  ticketTypes: TicketTypeInput[]
  purchaseEmailSubject?: string
  purchaseEmailBody?: string
  emailSubject?: string
  emailBody?: string
  reminderDaysBefore?: number
}

export async function updateWalkFull(id: string, data: UpdateWalkFullData): Promise<void> {
  await requireAdmin()
  const capacity = data.ticketTypes.reduce((sum, t) => sum + t.capacity, 0)
  const priceKopecks = data.ticketTypes[0]?.priceKopecks ?? 0
  await prisma.$transaction([
    prisma.walk.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle ?? null,
        description: data.description,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        location: data.location,
        coverPhotoUrl: data.coverPhotoUrl,
        guide:  { connect: { id: data.guideId } },
        guide2: data.guideId2 ? { connect: { id: data.guideId2 } } : { disconnect: true },
        priceKopecks,
        capacity,
        purchaseEmailSubject: data.purchaseEmailSubject ?? null,
        purchaseEmailBody: data.purchaseEmailBody ?? null,
        emailSubject: data.emailSubject ?? null,
        emailBody: data.emailBody ?? null,
        reminderDaysBefore: data.reminderDaysBefore ?? null,
      },
    }),
    prisma.ticketType.deleteMany({ where: { walkId: id } }),
    prisma.ticketType.createMany({
      data: data.ticketTypes.map((t, i) => ({
        walkId: id,
        name: t.name,
        priceKopecks: t.priceKopecks,
        capacity: t.capacity,
        sortOrder: i,
      })),
    }),
  ])
}

async function requireAdmin() {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) throw new Error('Недостаточно прав')
  return session
}

type WalkInput = {
  type: 'WALK'
  title: string
  description: string
  startsAt: string
  location: string
  coverPhotoUrl: string
  galleryUrl?: string
  priceKopecks: number
  capacity: number
  guideId: number
  slug?: string
  endsAt?: string
}

export async function createWalkFull(data: UpdateWalkFullData): Promise<string> {
  await requireAdmin()
  const slug = await ensureUniqueSlug(data.title, async (s) => {
    const existing = await prisma.walk.findFirst({ where: { slug: s } })
    return existing != null
  })
  const capacity = data.ticketTypes.reduce((sum, t) => sum + t.capacity, 0)
  const priceKopecks = data.ticketTypes[0]?.priceKopecks ?? 0
  const walk = await prisma.walk.create({
    data: {
      slug,
      title: data.title,
      subtitle: data.subtitle ?? null,
      description: data.description,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      location: data.location,
      coverPhotoUrl: data.coverPhotoUrl,
      priceKopecks,
      capacity,
      guideId: data.guideId,
      guideId2: data.guideId2 ?? null,
      purchaseEmailSubject: data.purchaseEmailSubject ?? null,
      purchaseEmailBody: data.purchaseEmailBody ?? null,
      emailSubject: data.emailSubject ?? null,
      emailBody: data.emailBody ?? null,
      reminderDaysBefore: data.reminderDaysBefore ?? null,
    },
  })
  if (data.ticketTypes.length > 0) {
    await prisma.ticketType.createMany({
      data: data.ticketTypes.map((t, i) => ({
        walkId: walk.id,
        name: t.name,
        priceKopecks: t.priceKopecks,
        capacity: t.capacity,
        sortOrder: i,
      })),
    })
  }
  return walk.id
}

export async function createWalk(input: WalkInput): Promise<string> {
  await requireAdmin()
  const slug = input.slug ?? await ensureUniqueSlug(input.title, async (s) => {
    const existing = await prisma.walk.findFirst({ where: { slug: s } })
    return existing != null
  })
  const walk = await prisma.walk.create({
    data: {
      slug,
      title: input.title,
      description: input.description,
      startsAt: new Date(input.startsAt),
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      location: input.location,
      coverPhotoUrl: input.coverPhotoUrl,
      galleryUrl: input.galleryUrl ?? null,
      priceKopecks: input.priceKopecks,
      capacity: input.capacity,
      guideId: input.guideId,
    },
  })
  return walk.id
}

export async function updateWalk(id: string, input: WalkInput): Promise<void> {
  await requireAdmin()
  await prisma.walk.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      startsAt: new Date(input.startsAt),
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      location: input.location,
      coverPhotoUrl: input.coverPhotoUrl,
      galleryUrl: input.galleryUrl ?? null,
      priceKopecks: input.priceKopecks,
      capacity: input.capacity,
      guideId: input.guideId,
    },
  })
}

export async function publishWalk(id: string): Promise<void> {
  const session = await requireAdmin()
  const walk = await prisma.walk.findFirst({ where: { id } })
  if (!walk) throw new Error('Прогулка не найдена')
  if (walk.status === 'ACTIVE') throw new Error('Прогулка уже опубликована')
  await prisma.walk.update({
    where: { id },
    data: {
      status: 'ACTIVE',
      publishedAt: walk.publishedAt ?? new Date(),
      publishedBy: walk.publishedBy ?? session.user.id,
    },
  })
}

export async function cancelWalk(id: string): Promise<void> {
  await requireAdmin()
  const walk = await prisma.walk.findFirst({ where: { id } })
  if (!walk) throw new Error('Прогулка не найдена')
  if (walk.status !== 'ACTIVE') throw new Error('Нельзя отменить: прогулка не активна')
  await prisma.walk.update({ where: { id }, data: { status: 'CANCELLED' } })
}

export async function restoreWalk(id: string, newStartsAt?: string): Promise<void> {
  await requireAdmin()
  const walk = await prisma.walk.findFirst({ where: { id } })
  if (!walk) throw new Error('Прогулка не найдена')
  const startsAt = new Date(walk.startsAt)
  if (startsAt < new Date() && !newStartsAt) {
    throw new Error('Укажите новую дату: дата прогулки в прошлом')
  }
  const resolvedStartsAt = newStartsAt ? new Date(newStartsAt) : startsAt
  if (newStartsAt && resolvedStartsAt < new Date()) {
    throw new Error('Новая дата должна быть в будущем')
  }
  await prisma.walk.update({
    where: { id },
    data: { status: 'DRAFT', startsAt: resolvedStartsAt },
  })
}

export async function deleteWalk(id: string): Promise<void> {
  await requireAdmin()
  const walk = await prisma.walk.findFirst({ where: { id } })
  if (!walk) throw new Error('Прогулка не найдена')

  const ticketCount = await prisma.ticket.count({ where: { walkId: id } })
  if (ticketCount > 0) {
    throw new Error('Нельзя удалить прогулку с проданными билетами.')
  }

  await prisma.walk.update({ where: { id }, data: { status: 'DELETED' } })
}
