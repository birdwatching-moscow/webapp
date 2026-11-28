import { prisma } from '@/lib/prisma'

const SINGLETON_ID = 'singleton'

export type BirdIdPublicData = {
  title: string
  subtitle: string | null
  formUrl: string | null
  startsAt: Date | null
  endsAt: Date | null
  durationDays: number | null
  durationHours: number | null
  difficulty: number | null
  registrationOpen: boolean
}

export async function getBirdIdPublic(): Promise<BirdIdPublicData | null> {
  return prisma.birdId.findFirst({
    where: { id: SINGLETON_ID },
    select: {
      title: true,
      subtitle: true,
      formUrl: true,
      startsAt: true,
      endsAt: true,
      durationDays: true,
      durationHours: true,
      difficulty: true,
      registrationOpen: true,
    },
  })
}
