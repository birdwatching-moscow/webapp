import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { auth } from '@/lib/auth'
import { getExpeditionTitle, getExpeditionBySlug } from '@/lib/expeditions'
import { NoticeBanner } from '@/components/NoticeBanner/NoticeBanner'
import { ExpeditionContactForm } from '@/components/expedition/ExpeditionContactForm'
import { ExpeditionHero } from '@/components/expedition/ExpeditionHero'
import { ExpeditionBirds } from '@/components/expedition/ExpeditionBirds'
import { ExpeditionFaq } from '@/components/expedition/ExpeditionFaq'
import { ExpeditionGuides } from '@/components/expedition/ExpeditionGuides'
import { ExpeditionProgramme } from '@/components/expedition/ExpeditionProgramme'
import { ExpeditionPricing } from '@/components/expedition/ExpeditionPricing'
import { ExpeditionContactTrigger } from '@/components/expedition/ExpeditionContactTrigger'
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
  const [expedition, session] = await Promise.all([getExpeditionBySlug(slug), auth()])
  if (!expedition) notFound()

  const isSoldOut  = expedition.spotsLeft <= 0
  const hasTickets = expedition.ticketTypes.length > 0
  const useModal   = hasTickets && !isSoldOut

  return (
    <main className={`container ${styles.page}`}>
      {isSoldOut && (
        <div className={styles.noticeBanner}>
          <NoticeBanner
            title="Мест нет"
            text="Запишитесь в лист ожидания — форма для заявки ниже на странице"
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

      {expedition.guides.length > 0 && (
        <ExpeditionGuides guides={expedition.guides} />
      )}

      {expedition.checklistItems.length > 0 && (
        <ExpeditionFaq items={expedition.checklistItems} />
      )}

      <ExpeditionPricing
        ticketTypes={expedition.ticketTypes}
        includedItems={expedition.includedItems}
        excludedItems={expedition.excludedItems}
        cta={useModal
          ? <ExpeditionContactTrigger expeditionId={expedition.id} />
          : null
        }
      />

      {!useModal && (
        <div id="contact">
          <ExpeditionContactForm
            expeditionId={expedition.id}
            initialName={session?.user?.name ?? ''}
            initialEmail={session?.user?.email ?? ''}
            waitingList={!hasTickets || isSoldOut}
          />
        </div>
      )}
    </main>
  )
}
