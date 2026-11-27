import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SORT_ASC } from '@/lib/constants'
import { makeKey, makeKey as makeTicketKey } from '@/app/admin/walks/_sections/types'
import { ExpeditionEditForm } from './ExpeditionEditForm'
import type { ChecklistItem, GalleryItem } from '@/app/admin/expeditions/_actions'

export default async function EditExpeditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [expedition, guides] = await Promise.all([
    prisma.expedition.findFirst({
      where: { id, status: { not: 'DELETED' } },
      select: {
        id:             true,
        title:          true,
        description:    true,
        startsAt:       true,
        endsAt:         true,
        coverPhotoUrl:    true,
        coverPhotoCredit: true,
        galleryItems:     true,
        checklistItems: true,
        durationDays:   true,
        aboutTitle:     true,
        aboutText:      true,
        difficulty:     true,
        includedItems:  true,
        excludedItems:  true,
        totalSpots:     true,
        ticketTypes:    { orderBy: { sortOrder: 'asc' as const } },
        spotsLeft:      true,
        status:         true,
        guides:         { select: { id: true, name: true } },
        days:           { orderBy: { dayNumber: 'asc' } },
      },
    }),
    prisma.teamMember.findMany({ select: { id: true, name: true }, orderBy: SORT_ASC }),
  ])

  if (!expedition) notFound()

  function toDateOnly(date: Date) {
    return date.toISOString().slice(0, 10)
  }

  return (
    <ExpeditionEditForm
      expedition={{
        id:            expedition.id,
        title:         expedition.title,
        description:   expedition.description,
        startsAt:      toDateOnly(expedition.startsAt),
        endsAt:        expedition.endsAt ? toDateOnly(expedition.endsAt) : '',
        coverPhotoUrl:    expedition.coverPhotoUrl,
        coverPhotoCredit: expedition.coverPhotoCredit ?? null,
        galleryItems:     expedition.galleryItems as GalleryItem[],
        checklistItems: expedition.checklistItems as ChecklistItem[],
        durationDays:   expedition.durationDays,
        aboutTitle:     expedition.aboutTitle,
        aboutText:      expedition.aboutText,
        difficulty:     expedition.difficulty,
        includedItems:  expedition.includedItems,
        excludedItems:  expedition.excludedItems,
        ticketTypes:    expedition.ticketTypes.map(t => ({
          key: makeTicketKey(),
          name: t.name,
          priceRub: t.priceKopecks != null ? String(t.priceKopecks / 100) : '',
          capacity:  String(t.capacity),
        })),
        totalSpots:     expedition.totalSpots,
        spotsLeft:     expedition.spotsLeft,
        status:        expedition.status,
        guideIds:      expedition.guides.map(g => String(g.id)),
        days:          expedition.days.map(d => ({
          clientId:    makeKey(),
          dayNumber:   d.dayNumber,
          title:       d.title,
          description: d.description,
          photoUrl:    d.photoUrl ?? '',
          photoCredit: d.photoCredit ?? '',
        })),
      }}
      guides={guides}
    />
  )
}
