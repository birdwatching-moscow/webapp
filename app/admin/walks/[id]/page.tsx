import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { WalkEditForm } from './WalkEditForm'

export default async function EditWalkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [walk, guides] = await Promise.all([
    prisma.walk.findFirst({
      where: { id, status: { not: 'DELETED' } },
      include: {
        guide:       { select: { id: true, name: true } },
        guide2:      { select: { id: true, name: true } },
        ticketTypes: { orderBy: { sortOrder: 'asc' } },
      },
    }),
    prisma.teamMember.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: 'asc' } }),
  ])

  if (!walk) notFound()

  function toDatetimeLocal(date: Date) {
    return date.toISOString().slice(0, 16)
  }

  return (
    <WalkEditForm
      walk={{
        id:           walk.id,
        title:        walk.title,
        subtitle:     walk.subtitle,
        description:  walk.description,
        startsAt:     toDatetimeLocal(walk.startsAt),
        endsAt:       walk.endsAt ? toDatetimeLocal(walk.endsAt) : '',
        location:     walk.location,
        coverPhotoUrl: walk.coverPhotoUrl,
        guideId:      walk.guideId,
        guideId2:     walk.guideId2,
        status:       walk.status,
        purchaseEmailSubject: walk.purchaseEmailSubject,
        purchaseEmailBody:    walk.purchaseEmailBody,
        emailSubject:         walk.emailSubject,
        emailBody:            walk.emailBody,
        reminderDaysBefore:   walk.reminderDaysBefore,
        ticketTypes:  walk.ticketTypes.map(t => ({
          name:         t.name,
          priceKopecks: t.priceKopecks,
          capacity:     t.capacity,
        })),
      }}
      guides={guides}
    />
  )
}
