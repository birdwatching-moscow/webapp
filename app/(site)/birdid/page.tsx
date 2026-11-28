import type { Metadata } from 'next'
import { PhotoCard } from '@/components/PhotoCard/PhotoCard'
import { BirdIdHeroInfo } from '@/components/birdid/BirdIdHeroInfo'
import { PrivateHighlights, type PrivateHighlight } from '@/components/private/PrivateHighlights'
import { getBirdIdPublic } from '@/lib/birdid'

export const metadata: Metadata = {
  title: 'BirdID | Birdwatching Moscow',
  description: 'Бердвотчинг в Москве, экспедиции по России и за границей',
}

export default async function BirdIDPage() {
  const birdId = await getBirdIdPublic()

  const highlights: PrivateHighlight[] = (
    [
      birdId?.schedule       ? { title: 'Продолжительность', description: birdId.schedule }       : null,
      birdId?.seminars       ? { title: 'Что будем делать?', description: birdId.seminars }       : null,
      birdId?.difficultyText ? { title: 'Сложность',         description: birdId.difficultyText } : null,
    ] as Array<PrivateHighlight | null>
  ).filter((x): x is PrivateHighlight => x !== null)

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
          formUrl={birdId.formUrl}
          startsAt={birdId.startsAt}
          endsAt={birdId.endsAt}
          durationDays={birdId.durationDays}
          durationHours={birdId.durationHours}
          difficulty={birdId.difficulty}
          registrationOpen={birdId.registrationOpen}
        />
      )}

      {highlights.length > 0 && (
        <PrivateHighlights title="Коротко о курсе" highlights={highlights} />
      )}
    </main>
  )
}
