import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getExpeditionTitle, getExpeditionBySlug } from '@/lib/expeditions'
import { NoticeBanner } from '@/components/NoticeBanner/NoticeBanner'
import { ExpeditionHero } from '@/components/expedition/ExpeditionHero'
import { ExpeditionBirds } from '@/components/expedition/ExpeditionBirds'
import { ExpeditionProgramme } from '@/components/expedition/ExpeditionProgramme'
import styles from './expedition.module.css'

type Props = { params: Promise<{ slug: string }> }

const getTitle = cache(getExpeditionTitle)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const title = await getTitle(slug)
  return { title: `${title ?? 'Экспедиция'} | Birdwatching Moscow` }
}

export default async function ExpeditionPage({ params }: Props) {
  const { slug } = await params
  const expedition = await getExpeditionBySlug(slug)
  if (!expedition) notFound()

  const isSoldOut = expedition.spotsLeft <= 0

  return (
    <main className={`container ${styles.page}`}>
      {isSoldOut && (
        <div className={styles.noticeBanner}>
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

      <ExpeditionHero
        title={expedition.title}
        description={expedition.description}
        startsAt={expedition.startsAt}
        endsAt={expedition.endsAt}
        durationDays={expedition.durationDays}
        totalSpots={expedition.totalSpots}
        spotsLeft={expedition.spotsLeft}
        difficulty={expedition.difficulty}
        coverPhotoUrl={expedition.coverPhotoUrl}
        coverPhotoCredit={expedition.coverPhotoCredit}
        isSoldOut={isSoldOut}
      />

      {expedition.aboutTitle && expedition.aboutText && (
        <div className={styles.about}>
          <h2 className={`text-h1 ${styles.aboutTitle}`}>{expedition.aboutTitle}</h2>
          <p className={`text-body-l ${styles.aboutDesc}`}>{expedition.aboutText}</p>
        </div>
      )}

      {expedition.galleryItems.length > 0 && (
        <ExpeditionBirds items={expedition.galleryItems} />
      )}

      {expedition.days.length > 0 && (
        <ExpeditionProgramme
          days={expedition.days}
          coverPhotoUrl={expedition.coverPhotoUrl}
          title={expedition.title}
          startsAt={expedition.startsAt}
        />
      )}
    </main>
  )
}
