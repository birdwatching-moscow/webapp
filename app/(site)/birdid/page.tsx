import type { Metadata } from 'next'
import { PhotoCard } from '@/components/PhotoCard/PhotoCard'

export const metadata: Metadata = {
  title: 'BirdID | Birdwatching Moscow',
  description: 'Бердвотчинг в Москве, экспедиции по России и за границей',
}

export default function BirdIDPage() {
  return (
    <main className="container">
      <PhotoCard
        src="/images/birdid/birdid-hero.jpg"
        alt="Участники курса BirdID наблюдают за птицами"
        caption="Фото: Ольга Ерёменко, BirdId-2022"
      />
    </main>
  )
}
