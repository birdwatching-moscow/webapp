'use server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/permissions'

async function requireAdmin() {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) throw new Error('Недостаточно прав')
  return session
}

type TeamMemberInput = {
  name: string
  photoUrl: string
  education?: string
  achievements?: string
  profileLinks: string[]
  sortOrder: number
}

export async function createTeamMember(input: TeamMemberInput): Promise<number> {
  await requireAdmin()
  const member = await prisma.teamMember.create({ data: input })
  return member.id
}

export async function updateTeamMember(id: number, input: TeamMemberInput): Promise<void> {
  await requireAdmin()
  await prisma.teamMember.update({ where: { id }, data: input })
}

export async function reorderTeamMembers(orderedIds: number[]): Promise<void> {
  await requireAdmin()
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.teamMember.update({ where: { id }, data: { sortOrder: index + 1 } })
    )
  )
}

export async function deleteTeamMember(id: number): Promise<void> {
  await requireAdmin()
  const [walkCount, expeditionCount] = await Promise.all([
    prisma.walk.count({ where: { guideId: id, status: 'ACTIVE' } }),
    prisma.expedition.count({ where: { guides: { some: { id } }, status: 'ACTIVE' } }),
  ])
  const total = walkCount + expeditionCount
  if (total > 0) {
    throw new Error(`Участник назначен гидом на ${total} активных ${total === 1 ? 'событие' : 'события'}. Сначала снимите его с событий.`)
  }
  await prisma.teamMember.delete({ where: { id } })
}
