import Image from 'next/image'
import { Button } from '@/components/ui/buttons/Button'
import { ROUTES } from '@/utils/routes'
import styles from './not-found.module.css'

// .imageWrapper: full width on mobile, fixed 480px from the desktop breakpoint
const IMAGE_SIZES = '(min-width: 1248px) 480px, 100vw'

export default function NotFound() {
  return (
    <main className={styles.hero}>
      <div className={styles.content}>
        <h1 className={`text-display ${styles.heading}`}>Улетела из гнезда</h1>
        <p className={`text-body-l ${styles.subheading}`}>
          Этой страницы больше нет — похоже, она сменила маршрут миграции.
          Проверьте адрес или вернитесь на главную.
        </p>
        <Button as="a" href={ROUTES.home} size="lg" fullWidth className={styles.cta}>
          Перейти на главную
        </Button>
      </div>
      <div className={styles.imageWrapper}>
        <Image
          src="/placeholders/hero-media.png"
          alt=""
          fill
          sizes={IMAGE_SIZES}
          className={styles.placeholder}
          aria-hidden
        />
        <Image
          src="/404-image.png"
          alt="Птичье гнездо"
          fill
          sizes={IMAGE_SIZES}
          className={styles.image}
          priority
        />
      </div>
    </main>
  )
}
