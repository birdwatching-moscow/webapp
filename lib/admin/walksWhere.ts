import { Prisma } from '@/generated/prisma/client'

type WalksFilterParams = {
  q?: string
  fromStr?: string
  toStr?: string
  statuses?: string[]
  guides?: string[]
  now?: Date
}

export function buildWalksWhere({
  q = '',
  fromStr = '',
  toStr = '',
  statuses = [],
  guides = [],
  now = new Date(),
}: WalksFilterParams): Prisma.WalkWhereInput {
  const and: Prisma.WalkWhereInput[] = []

  if (q)       and.push({ title: { contains: q, mode: 'insensitive' } })
  if (fromStr) and.push({ startsAt: { gte: new Date(fromStr) } })
  if (toStr)   and.push({ startsAt: { lte: new Date(toStr + 'T23:59:59') } })

  if (statuses.length > 0) {
    const statusOr: Prisma.WalkWhereInput[] = []
    for (const s of statuses) {
      if (s === 'active')    statusOr.push({ status: 'ACTIVE', startsAt: { gte: now } })
      if (s === 'past')      statusOr.push({ status: 'ACTIVE', startsAt: { lt:  now } })
      if (s === 'draft')     statusOr.push({ status: 'DRAFT' })
      if (s === 'cancelled') statusOr.push({ status: 'CANCELLED' })
    }
    and.push({ OR: statusOr })
  } else {
    and.push({ status: { not: 'DELETED' } })
  }

  if (guides.length > 0) {
    and.push({ guideId: { in: guides.map(Number) } })
  }

  return and.length === 1 ? and[0] : { AND: and }
}
