import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { NoticeBanner } from '@/components/NoticeBanner/NoticeBanner'
import { PrivateHighlights, type PrivateHighlight } from '@/components/private/PrivateHighlights'
import { WalkHero } from '@/components/walk/WalkHero'
import { WalkAbout } from '@/components/walk/WalkAbout'
import { CertificateCTABand } from '@/components/CertificateCTABand/CertificateCTABand'
import { WalkCheckoutForm } from './WalkCheckoutForm'
import { ROUTES } from '@/utils/routes'
import styles from './walk.module.css'

interface Props {
  params: Promise<{ slug: string }>
}

const WALK_HIGHLIGHTS: readonly PrivateHighlight[] = [
  {
    title: 'Что взять с собой',
    description: 'Бинокль или фотоаппарат для наблюдений, воду и удобную обувь. Если у вас нет бинокля — мы можем одолжить.',
  },
  {
    title: 'Одежда по погоде',
    description: 'Прогулки проходят на открытом воздухе в любую погоду, поэтому оденьтесь по сезону.',
  },
  {
    title: 'Сложность маршрута',
    description: '2–3 часа пешей прогулки по ровной поверхности. Доступно для детей от 5 лет.',
  },
  {
    title: 'Место встречи',
    description: 'Точная точка встречи будет указана в письме после покупки билета.',
  },
  {
    title: 'Птицы не гарантированы',
    description: 'Мы не можем гарантировать встречу с конкретными видами — поведение птиц зависит от погоды и сезона.',
  },
] as const

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
      priceKopecks: true,
      capacity: true,
      coverPhotoUrl: true,
      coverPhotoCredit: true,
      guide: {
        select: {
          name: true,
          photoUrl: true,
          education: true,
          achievements: true,
          profileLinks: true,
        },
      },
      ticketTypes: {
        select: { id: true, name: true, priceKopecks: true, capacity: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { tickets: true } },
    },
  })

  if (!walk) notFound()

  const spotsLeft = walk.capacity - walk._count.tickets
  const isSoldOut = spotsLeft <= 0

  const resolvedTicketTypes = walk.ticketTypes.map((t) => ({
    id: t.id,
    name: t.name,
    priceKopecks: t.priceKopecks ?? walk.priceKopecks,
  }))

  return (
    <main className={`container ${styles.page}`}>
      {isSoldOut && (
        <div style={{ paddingTop: 'var(--space-8)' }}>
          <NoticeBanner
            text={
              <>
                Стая укомплектована — мы улетаем в экспедицию!{' '}
                Оставьте свои контакты, и мы сразу оповестим вас о новой экспедиции.
              </>
            }
          />
        </div>
      )}

      <WalkHero
        title={walk.title}
        subtitle={walk.subtitle}
        startsAt={walk.startsAt}
        endsAt={walk.endsAt}
        spotsLeft={spotsLeft}
        coverPhotoUrl={walk.coverPhotoUrl}
        coverPhotoCredit={walk.coverPhotoCredit}
        isSoldOut={isSoldOut}
      />

      <WalkAbout description={walk.description} guide={walk.guide} />

      <PrivateHighlights
        title="Важно знать"
        highlights={WALK_HIGHLIGHTS}
        more={{ label: 'Подробнее', href: ROUTES.faq }}
      />

      {!isSoldOut && (
        <section id="payment" className={styles.paymentSection}>
          <h2 className={`text-h1 ${styles.paymentTitle}`}>Оплата</h2>
          <WalkCheckoutForm
            walkId={walk.id}
            priceKopecks={walk.priceKopecks}
            ticketTypes={resolvedTicketTypes}
          />
        </section>
      )}

      <CertificateCTABand />
    </main>
  )
}
