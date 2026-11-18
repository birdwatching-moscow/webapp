import { prisma } from '@/lib/prisma'
import { EventStatus } from '@/generated/prisma/client'

export async function closeFinishedEvents(): Promise<void> {
  const now = new Date()

  // A walk is finished when its end time has passed; if no end time, use start time
  await prisma.walk.updateMany({
    where: {
      status: EventStatus.ACTIVE,
      OR: [
        { endsAt:  { not: null, lt: now } },
        { endsAt:  null, startsAt: { lt: now } },
      ],
    },
    data: { status: EventStatus.PAST },
  })

  await prisma.expedition.updateMany({
    where: {
      status: EventStatus.ACTIVE,
      OR: [
        { endsAt:  { not: null, lt: now } },
        { endsAt:  null, startsAt: { lt: now } },
      ],
    },
    data: { status: EventStatus.PAST },
  })
}
