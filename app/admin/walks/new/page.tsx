import { prisma } from '@/lib/prisma'
import { WalkNewForm } from './WalkNewForm'

export default async function NewWalkPage() {
  const guides = await prisma.teamMember.findMany({
    select: { id: true, name: true },
    orderBy: { sortOrder: 'asc' },
  })

  return <WalkNewForm guides={guides} />
}
