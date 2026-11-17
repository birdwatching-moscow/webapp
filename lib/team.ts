import { prisma } from '@/lib/prisma'

export type TeamMemberRow = {
  id: number
  name: string
  photoUrl: string
  education: string | null
  achievements: string | null
  profileLinks: string[]
}

export async function getTeamMemberById(id: number): Promise<TeamMemberRow | null> {
  return prisma.teamMember.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      photoUrl: true,
      education: true,
      achievements: true,
      profileLinks: true,
    },
  })
}

export async function getTeamMembers(): Promise<TeamMemberRow[]> {
  return prisma.teamMember.findMany({
    select: {
      id: true,
      name: true,
      photoUrl: true,
      education: true,
      achievements: true,
      profileLinks: true,
    },
    orderBy: { sortOrder: 'asc' },
  })
}
