import type { Metadata } from 'next'
import Image from 'next/image'
import { InfoIcon } from '@/components/icons/InfoIcon'
import { IMAGE_SIZES } from '@/utils/imageSizes'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'BirdID | Birdwatching Moscow',
  description: 'Бердвотчинг в Москве, экспедиции по России и за границей',
}

export default function BirdIDPage() {
  return (
    <main className="container">
      <div className={styles.hero}>
        <Image
          src="/images/birdid/birdid-hero.jpg"
          alt="Участники курса BirdID наблюдают за птицами"
          fill
          sizes={IMAGE_SIZES.pageWidth}
          priority
          className={styles.heroImage}
        />
        <details className={styles.credit}>
          <summary className={styles.creditIcon} aria-label="Автор фото">
            <InfoIcon />
          </summary>
          <p className={styles.creditCaption}>Фото: Ольга Ерёменко</p>
        </details>
      </div>
    </main>
  )
}
