import Image from 'next/image'
import { Button } from '@/components/ui/buttons/Button'
import { InfoIcon } from '@/components/icons/InfoIcon'
import { ROUTES } from '@/utils/routes'
import styles from './HomeBook.module.css'

const TITLE = 'Книга «В том дереве слева»'
const DESCRIPTION = 'Книга орнитолога Вероники Самоцкой, основательницы Birdwatching Moscow'
const PHOTO_CREDIT = 'Вероника Самоцкая'

export const HomeBook = () => (
  <section data-testid="home-book" className={styles.section}>
    <div className={styles.left}>
      <h2 className={`text-h1 ${styles.title}`}>{TITLE}</h2>
      <p className={`text-body-l ${styles.description}`}>{DESCRIPTION}</p>
      <Button as="a" size="lg" fullWidth href={ROUTES.book} className={styles.cta}>
        Подробнее
      </Button>
    </div>

    <div className={styles.imageWrapper}>
      <Image
        src="/images/book-cover.jpg"
        alt={TITLE}
        fill
        sizes="(min-width: 1248px) 608px, 100vw"
        className={styles.image}
        priority
      />
      <span data-testid="book-info-icon" className={styles.infoIcon} aria-hidden="true">
        <InfoIcon />
      </span>
      <p className={styles.caption}>{PHOTO_CREDIT}</p>
    </div>

  </section>
)
