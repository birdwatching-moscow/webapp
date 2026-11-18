import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero/PageHero'
import { PrivateLectures } from '@/components/private/PrivateLectures'
import { PrivateRequestButton } from '@/components/private/PrivateRequestButton'
import { PRIVATE_LECTURES } from '@/lib/private/lectures'

const TITLE = 'Лекции'

const INTRO = [
  'Пригласите эксперта Birdwatching Moscow провести лекцию о птицах, бёрдвотчинге и городской природе.',
  'Проводим лекции для компаний, школ, библиотек, музеев, образовательных и культурных проектов. Тему и формат можем подобрать под вашу аудиторию и задачу.',
] as const

export const metadata: Metadata = {
  title: `${TITLE} | Birdwatching Moscow`,
  description: INTRO[0],
}

export default function PrivateLecturesPage() {
  return (
    <main className="container">
      <PageHero title={TITLE} description={INTRO} action={<PrivateRequestButton formType="PRIVATE_LECTURE" />} />
      <PrivateLectures lectures={PRIVATE_LECTURES} />
    </main>
  )
}
