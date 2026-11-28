import type { Metadata } from 'next'
import { PhotoCard } from '@/components/PhotoCard/PhotoCard'
import { BirdIdHeroInfo } from '@/components/birdid/BirdIdHeroInfo'
import { getBirdIdPublic } from '@/lib/birdid'

export const metadata: Metadata = {
  title: 'BirdID | Birdwatching Moscow',
  description: 'Бердвотчинг в Москве, экспедиции по России и за границей',
}

export default async function BirdIDPage() {
  const birdId = await getBirdIdPublic()

  return (
    <main className="container">
      <PhotoCard
        src="/images/birdid/birdid-hero.webp"
        alt="Участники курса BirdID наблюдают за птицами"
        caption="Фото: Ольга Ерёменко, BirdId-2022"
        priority
      />

      {birdId && (
        <BirdIdHeroInfo
          title={birdId.title}
          subtitle={birdId.subtitle}
          formUrl={birdId.formUrl}
          startsAt={birdId.startsAt}
          endsAt={birdId.endsAt}
          durationDays={birdId.durationDays}
          durationHours={birdId.durationHours}
          difficulty={birdId.difficulty}
          registrationOpen={birdId.registrationOpen}
        />
      )}
    </main>
  )
}
