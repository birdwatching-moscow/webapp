'use server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/permissions'

const SINGLETON_ID = 'singleton'

async function requireAdmin() {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) throw new Error('Недостаточно прав')
  return session
}

export type BirdIdTicketInput = { name: string; priceKopecks: number | null; capacity: number; description?: string | null }

export type BirdIdInput = {
  title: string
  formUrl: string | null
  startsAt: string | null
  endsAt: string | null
  durationDays: number | null
  difficulty: number | null
  schedule: string | null
  seminars: string | null
  registrationDeadline: string | null
  registrationOpen: boolean
  teamMemberIds: number[]
  ticketTypes: BirdIdTicketInput[]
}

export type BirdIdData = {
  id: string
  title: string
  formUrl: string | null
  startsAt: string | null
  endsAt: string | null
  durationDays: number | null
  difficulty: number | null
  schedule: string | null
  seminars: string | null
  registrationDeadline: string | null
  registrationOpen: boolean
  teamMemberIds: number[]
  ticketTypes: { name: string; priceKopecks: number | null; capacity: number; description: string | null; sortOrder: number }[]
}

export async function getBirdId(): Promise<BirdIdData | null> {
  await requireAdmin()
  const record = await prisma.birdId.findFirst({
    where: { id: SINGLETON_ID },
    include: {
      team:        { select: { id: true } },
      ticketTypes: { orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!record) return null
  return {
    id:                   record.id,
    title:                record.title,
    formUrl:              record.formUrl,
    startsAt:             record.startsAt ? record.startsAt.toISOString().split('T')[0] : null,
    endsAt:               record.endsAt   ? record.endsAt.toISOString().split('T')[0]   : null,
    durationDays:         record.durationDays,
    difficulty:           record.difficulty,
    schedule:             record.schedule,
    seminars:             record.seminars,
    registrationDeadline: record.registrationDeadline ? record.registrationDeadline.toISOString().split('T')[0] : null,
    registrationOpen:     record.registrationOpen,
    teamMemberIds:        record.team.map(t => t.id),
    ticketTypes:          record.ticketTypes.map(t => ({
      name:         t.name,
      priceKopecks: t.priceKopecks,
      capacity:     t.capacity,
      description:  t.description,
      sortOrder:    t.sortOrder,
    })),
  }
}

export async function saveBirdId(input: BirdIdInput): Promise<void> {
  const session = await requireAdmin()

  await prisma.birdIdTicketType.deleteMany({ where: { birdIdId: SINGLETON_ID } })

  await prisma.birdId.upsert({
    where:  { id: SINGLETON_ID },
    create: {
      id:                   SINGLETON_ID,
      title:                input.title,
      formUrl:              input.formUrl,
      startsAt:             input.startsAt ? new Date(input.startsAt) : null,
      endsAt:               input.endsAt   ? new Date(input.endsAt)   : null,
      durationDays:         input.durationDays,
      difficulty:           input.difficulty,
      schedule:             input.schedule,
      seminars:             input.seminars,
      registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : null,
      registrationOpen:     input.registrationOpen,
      team:        { connect: input.teamMemberIds.map(id => ({ id })) },
      ticketTypes: { create: input.ticketTypes.map((t, i) => ({ name: t.name, priceKopecks: t.priceKopecks, capacity: t.capacity, description: t.description ?? null, sortOrder: i })) },
      updatedBy:   session.user.email ?? null,
    },
    update: {
      title:                input.title,
      formUrl:              input.formUrl,
      startsAt:             input.startsAt ? new Date(input.startsAt) : null,
      endsAt:               input.endsAt   ? new Date(input.endsAt)   : null,
      durationDays:         input.durationDays,
      difficulty:           input.difficulty,
      schedule:             input.schedule,
      seminars:             input.seminars,
      registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : null,
      registrationOpen:     input.registrationOpen,
      team:        { set: input.teamMemberIds.map(id => ({ id })) },
      ticketTypes: { create: input.ticketTypes.map((t, i) => ({ name: t.name, priceKopecks: t.priceKopecks, capacity: t.capacity, description: t.description ?? null, sortOrder: i })) },
      updatedBy:   session.user.email ?? null,
    },
  })
}
