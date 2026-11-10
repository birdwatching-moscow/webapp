import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatWalkDateShort } from '@/utils/formatWalkDate'
import { formatDurationRange } from '@/utils/formatDurationRange'
import { WalkCheckoutForm } from './WalkCheckoutForm'
import styles from './walk.module.css'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const walk = await prisma.walk.findFirst({ where: { slug, status: 'ACTIVE' }, select: { title: true } })
  return { title: walk ? `${walk.title} | Birdwatching Moscow` : 'Прогулка | Birdwatching Moscow' }
}

export default async function WalkPage({ params }: Props) {
  const { slug } = await params

  const walk = await prisma.walk.findFirst({
    where: { slug, status: 'ACTIVE' },
    select: {
      id: true,
      title: true,
      subtitle: true,
      description: true,
      startsAt: true,
      endsAt: true,
      location: true,
      priceKopecks: true,
      capacity: true,
      _count: { select: { tickets: true } },
    },
  })

  if (!walk) notFound()

  const spotsLeft = walk.capacity - walk._count.tickets
  const isSoldOut = spotsLeft <= 0
  const dateLabel = formatWalkDateShort(walk.startsAt, walk.endsAt)
  const durationLabel = walk.endsAt ? formatDurationRange(walk.startsAt, walk.endsAt) : null

  return (
    <main className={styles.page}>
      <div>
        <h1 className="text-h1">{walk.title}</h1>
        {walk.subtitle && <p className="text-body">{walk.subtitle}</p>}
      </div>

      <dl className="text-body">
        <div><dt style={{ display: 'inline', fontWeight: 600 }}>Дата:&nbsp;</dt><dd style={{ display: 'inline' }}>{dateLabel}</dd></div>
        {durationLabel && <div><dt style={{ display: 'inline', fontWeight: 600 }}>Длительность:&nbsp;</dt><dd style={{ display: 'inline' }}>{durationLabel}</dd></div>}
        <div><dt style={{ display: 'inline', fontWeight: 600 }}>Место:&nbsp;</dt><dd style={{ display: 'inline' }}>{walk.location}</dd></div>
      </dl>

      <p className="text-body">{walk.description}</p>

      {isSoldOut ? (
        <p className="text-body" style={{ color: 'var(--color-error)' }}>Места закончились</p>
      ) : (
        <WalkCheckoutForm walkId={walk.id} priceKopecks={walk.priceKopecks} />
      )}
    </main>
  )
}
