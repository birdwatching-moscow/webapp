import { prisma } from '@/lib/prisma'

const SINGLETON_ID = 'singleton'

export type BirdIdPublicData = {
  title: string
  formUrl: string | null
  startsAt: Date | null
  endsAt: Date | null
  durationDays: number | null
  durationHours: number | null
  difficulty: number | null
  difficultyText: string | null
  schedule: string | null
  seminars: string | null
  registrationOpen: boolean
}

export async function getBirdIdPublic(): Promise<BirdIdPublicData | null> {
  return prisma.birdId.findFirst({
    where: { id: SINGLETON_ID },
    select: {
      title: true,
      formUrl: true,
      startsAt: true,
      endsAt: true,
      durationDays: true,
      durationHours: true,
      difficulty: true,
      difficultyText: true,
      schedule: true,
      seminars: true,
      registrationOpen: true,
    },
  })
}
