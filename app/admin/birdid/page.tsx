import { prisma } from '@/lib/prisma'
import { SORT_ASC } from '@/lib/constants'
import { getBirdId } from './_actions'
import { BirdIdEditForm } from './BirdIdEditForm'

export default async function BirdIdAdminPage() {
  const [birdId, allGuides] = await Promise.all([
    getBirdId(),
    prisma.teamMember.findMany({ select: { id: true, name: true }, orderBy: SORT_ASC }),
  ])

  return <BirdIdEditForm initial={birdId} guides={allGuides} />
}
