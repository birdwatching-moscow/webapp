import type { Metadata } from 'next'
import { getActiveWalks } from '@/lib/walks'
import { WalksPageHero } from '@/components/walks-page/WalksPageHero'
import { WalksExpandable } from '@/components/walks-page/WalksExpandable'
import { WalksReviews } from '@/components/walks-page/WalksReviews'
import styles from './walks.module.css'

export const metadata: Metadata = {
  title: 'Прогулки по Москве | Birdwatching Moscow',
  description: 'Бёрдвотчинг-прогулки по паркам и заповедникам Москвы каждые выходные',
}

export default async function WalksPage() {
  const walks = await getActiveWalks()

  return (
    <main className={styles.page}>
      <WalksPageHero />
      <WalksExpandable walks={walks} />
      <WalksReviews />
    </main>
  )
}
