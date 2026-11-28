import type { Metadata } from 'next'
import { PhotoCard } from '@/components/PhotoCard/PhotoCard'
import { BirdIdHeroInfo } from '@/components/birdid/BirdIdHeroInfo'
import { PrivateHighlights, type PrivateHighlight } from '@/components/private/PrivateHighlights'
import { AlertBanner } from '@/components/AlertBanner/AlertBanner'
import { getBirdIdPublic } from '@/lib/birdid'

export const metadata: Metadata = {
  title: 'BirdID | Birdwatching Moscow',
  description: 'Бердвотчинг в Москве, экспедиции по России и за границей',
}

const ABOUT_HIGHLIGHTS: readonly PrivateHighlight[] = [
  {
    title: 'Продолжительность',
    description: 'Ожидаемая продолжительность курса: 181 час. Выезды по выходным с 4 апреля по 7 июня. Лекции и семинары по вечерам в будни',
  },
  {
    title: 'Что будем делать?',
    description: 'Посещаем различные местообитания птиц и учимся определять их в природе по внешнему виду и голосу',
  },
  {
    title: 'Сложность',
    description: 'Долгие пешие переходы, переезды на авто и общественном транспорте. Ночевки в разных условиях от гостевого домика до палатки',
  },
]

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
          formUrl={birdId.formUrl}
          startsAt={birdId.startsAt}
          endsAt={birdId.endsAt}
          durationDays={birdId.durationDays}
          durationHours={birdId.durationHours}
          difficulty={birdId.difficulty}
          registrationOpen={birdId.registrationOpen}
        />
      )}

      <PrivateHighlights title="Коротко о курсе" highlights={ABOUT_HIGHLIGHTS} />

      <AlertBanner text="Вставать придётся в 5 утра, ходить по 10+ км! В выходные!" />
    </main>
  )
}
