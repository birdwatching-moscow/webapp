import { prisma } from '@/lib/prisma'
import { ExpeditionNewForm } from './ExpeditionNewForm'

export const metadata = { title: 'Новая экспедиция — Администратор' }

export default async function NewExpeditionPage() {
  const guides = await prisma.teamMember.findMany({ orderBy: { name: 'asc' } })
  return <ExpeditionNewForm guides={guides} />
}
