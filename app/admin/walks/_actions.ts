'use server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/permissions'
import { ensureUniqueSlug } from '@/lib/admin/slug'
import { EventStatus } from '@/generated/prisma/client'
import { SORT_ASC } from '@/lib/constants'

export type TicketTypeInput = {
  name: string
  priceKopecks: number | null
  capacity: number
  description?: string | null
}

export type UpdateWalkFullData = {
  title: string
  subtitle?: string
  description: string
  startsAt: string
  endsAt?: string
  location: string
  coverPhotoUrl: string
  coverPhotoCredit?: string
  guideId: number
  ticketTypes: TicketTypeInput[]
  purchaseEmailSubject?: string
  purchaseEmailBody?: string
  emailSubject?: string
  emailBody?: string
  reminderDaysBefore?: number
}

export async function updateWalkFull(id: string, data: UpdateWalkFullData): Promise<void> {
  const session = await requireAdmin()
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
        coverPhotoCredit: data.coverPhotoCredit ?? null,
        guide:  { connect: { id: data.guideId } },
        priceKopecks,
        capacity,
        purchaseEmailSubject: data.purchaseEmailSubject ?? null,
        purchaseEmailBody: data.purchaseEmailBody ?? null,
        emailSubject: data.emailSubject ?? null,
        emailBody: data.emailBody ?? null,
        reminderDaysBefore: data.reminderDaysBefore ?? null,
        updatedBy: session.user.email ?? null,
      },
    }),
    prisma.ticketType.deleteMany({ where: { walkId: id } }),
    prisma.ticketType.createMany({
      data: data.ticketTypes.map((t, i) => ({
        walkId: id,
        name: t.name,
        priceKopecks: t.priceKopecks,
        capacity: t.capacity,
        description: t.description ?? null,
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

export async function createWalkFull(data: UpdateWalkFullData): Promise<string> {
  const session = await requireAdmin()
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
      coverPhotoCredit: data.coverPhotoCredit ?? null,
      priceKopecks,
      capacity,
      guideId: data.guideId,
      purchaseEmailSubject: data.purchaseEmailSubject ?? null,
      purchaseEmailBody: data.purchaseEmailBody ?? null,
      emailSubject: data.emailSubject ?? null,
      emailBody: data.emailBody ?? null,
      reminderDaysBefore: data.reminderDaysBefore ?? null,
      createdBy: session.user.email ?? null,
    },
  })
  if (data.ticketTypes.length > 0) {
    await prisma.ticketType.createMany({
      data: data.ticketTypes.map((t, i) => ({
        walkId: walk.id,
        name: t.name,
        priceKopecks: t.priceKopecks,
        capacity: t.capacity,
        description: t.description ?? null,
        sortOrder: i,
      })),
    })
  }
  return walk.id
}

export async function publishWalk(id: string): Promise<void> {
  const session = await requireAdmin()
  const walk = await prisma.walk.findFirst({ where: { id } })
  if (!walk) throw new Error('Прогулка не найдена')
  if (walk.status === EventStatus.ACTIVE) throw new Error('Прогулка уже опубликована')
  let publishedBy = walk.publishedBy
  if (!publishedBy) {
    const userExists = await prisma.user.count({ where: { id: session.user.id } }) > 0
    if (userExists) publishedBy = session.user.id
  }
  await prisma.walk.update({
    where: { id },
    data: {
      status: EventStatus.ACTIVE,
      publishedAt: walk.publishedAt ?? new Date(),
      publishedBy,
    },
  })
}

export async function cancelWalk(id: string): Promise<void> {
  await requireAdmin()
  const walk = await prisma.walk.findFirst({ where: { id } })
  if (!walk) throw new Error('Прогулка не найдена')
  if (walk.status !== EventStatus.ACTIVE) throw new Error('Нельзя отменить: прогулка не активна')
  await prisma.walk.update({ where: { id }, data: { status: EventStatus.CANCELLED } })
}

export async function reactivateWalk(id: string): Promise<void> {
  await requireAdmin()
  const walk = await prisma.walk.findFirst({ where: { id } })
  if (!walk) throw new Error('Прогулка не найдена')
  if (walk.status !== EventStatus.CANCELLED) throw new Error('Прогулка не отменена')
  if (walk.startsAt <= new Date()) throw new Error('Нельзя вернуть в активные: время прогулки уже прошло')
  await prisma.walk.update({ where: { id }, data: { status: EventStatus.ACTIVE } })
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

export async function copyWalk(id: string): Promise<string> {
  await requireAdmin()
  const walk = await prisma.walk.findFirst({
    where: { id },
    include: { ticketTypes: { orderBy: SORT_ASC } },
  })
  if (!walk) throw new Error('Прогулка не найдена')

  const now = new Date()
  const newStartsAt = new Date(walk.startsAt)
  newStartsAt.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() + 7)

  let newEndsAt: Date | null = null
  if (walk.endsAt) {
    const duration = walk.endsAt.getTime() - walk.startsAt.getTime()
    newEndsAt = new Date(newStartsAt.getTime() + duration)
  }

  const slug = await ensureUniqueSlug(walk.title, async (s) => {
    const existing = await prisma.walk.findFirst({ where: { slug: s } })
    return existing != null
  })

  const newWalk = await prisma.walk.create({
    data: {
      slug,
      title: walk.title,
      subtitle: walk.subtitle,
      description: walk.description,
      startsAt: newStartsAt,
      endsAt: newEndsAt,
      location: walk.location,
      coverPhotoUrl: walk.coverPhotoUrl,
      priceKopecks: walk.priceKopecks,
      capacity: walk.capacity,
      guideId: walk.guideId,
      purchaseEmailSubject: walk.purchaseEmailSubject,
      purchaseEmailBody: walk.purchaseEmailBody,
      emailSubject: walk.emailSubject,
      emailBody: walk.emailBody,
      reminderDaysBefore: walk.reminderDaysBefore,
      status: EventStatus.DRAFT,
    },
  })

  if (walk.ticketTypes.length > 0) {
    await prisma.ticketType.createMany({
      data: walk.ticketTypes.map((t, i) => ({
        walkId: newWalk.id,
        name: t.name,
        priceKopecks: t.priceKopecks,
        capacity: t.capacity,
        description: t.description ?? null,
        sortOrder: i,
      })),
    })
  }

  return newWalk.id
}

export async function exportWalkParticipants(walkId: string, timeZone?: string): Promise<{ b64: string; filename: string }> {
  await requireAdmin()

  const walk = await prisma.walk.findFirst({
    where: { id: walkId },
    select: { title: true, startsAt: true },
  })
  if (!walk) throw new Error('Прогулка не найдена')

  const tickets = await prisma.ticket.findMany({
    where: { walkId },
    select: {
      createdAt: true,
      hasBinoculars: true,
      user: { select: { name: true, email: true } },
      order: {
        select: {
          status: true,
          paidAt: true,
          orderItems: {
            where: { walkId },
            select: { unitPriceKopecks: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Участники')

  const tz = timeZone ?? 'UTC'

  function formatDateTz(date: Date) {
    return date.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: tz,
    })
  }

  ws.columns = [
    { header: 'Имя',                        key: 'name',         width: 30 },
    { header: 'Email',                       key: 'email',        width: 36 },
    { header: 'Статус',                      key: 'status',       width: 18 },
    { header: 'Сумма (₽)',                   key: 'price',        width: 14 },
    { header: `Дата покупки (${tz})`,        key: 'date',         width: 26 },
    { header: 'Бинокль',                     key: 'binoculars',   width: 12 },
  ]
  ws.getRow(1).font = { bold: true }

  const STATUS_LABELS: Record<string, string> = {
    PAID: 'Оплачен', PENDING: 'Ожидает', AWAITING_PAYMENT: 'Ожидает оплаты',
    FAILED: 'Ошибка', EXPIRED: 'Истёк',
  }

  for (const t of tickets) {
    const kopecks = t.order.orderItems[0]?.unitPriceKopecks ?? null
    ws.addRow({
      name:       t.user.name,
      email:      t.user.email,
      status:     STATUS_LABELS[t.order.status] ?? t.order.status,
      price:      kopecks != null ? kopecks / 100 : '',
      date:       formatDateTz(t.order.paidAt ?? t.createdAt),
      binoculars: t.hasBinoculars == null ? '—' : t.hasBinoculars ? 'Да' : 'Нет',
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const b64 = Buffer.from(buffer as ArrayBuffer).toString('base64')
  const dateStr = walk.startsAt.toISOString().slice(0, 10)
  const safeName = walk.title.replace(/[^\wа-яёА-ЯЁ\s-]/gi, '').trim().slice(0, 40)
  return { b64, filename: `участники-${safeName}-${dateStr}.xlsx` }
}

export type WalkTicketRow = {
  id: string
  createdAt: string
  userName: string
  userEmail: string
  orderStatus: string
  paidAt: string | null
  unitPriceKopecks: number | null
  hasBinoculars: boolean | null
}

export async function getWalkTickets(walkId: string): Promise<WalkTicketRow[]> {
  await requireAdmin()
  const tickets = await prisma.ticket.findMany({
    where: { walkId },
    select: {
      id: true,
      createdAt: true,
      hasBinoculars: true,
      user: { select: { name: true, email: true } },
      order: {
        select: {
          status: true,
          paidAt: true,
          orderItems: {
            where: { walkId },
            select: { unitPriceKopecks: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return tickets.map(t => ({
    id: t.id,
    createdAt: t.createdAt.toISOString(),
    userName: t.user.name,
    userEmail: t.user.email,
    orderStatus: t.order.status,
    paidAt: t.order.paidAt?.toISOString() ?? null,
    unitPriceKopecks: t.order.orderItems[0]?.unitPriceKopecks ?? null,
    hasBinoculars: t.hasBinoculars,
  }))
}
