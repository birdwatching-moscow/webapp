import { prisma } from '@/lib/prisma'
import { SORT_ASC } from '@/lib/constants'
import { WalkNewForm } from './WalkNewForm'

export default async function NewWalkPage() {
  const guides = await prisma.teamMember.findMany({
    select: { id: true, name: true },
    orderBy: SORT_ASC,
  })

  return <WalkNewForm guides={guides} />
}
