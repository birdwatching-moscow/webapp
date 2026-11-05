import Image from 'next/image'
import { Button } from '@/components/ui/buttons/Button'
import { ROUTES } from '@/utils/routes'
import styles from './HomeBook.module.css'

const TITLE = 'Книга «В том дереве слева»'
const DESCRIPTION = 'Книга орнитолога Вероники Самоцкой, основательницы Birdwatching Moscow'

export const HomeBook = () => (
  <section data-testid="home-book" className={styles.section}>
    <h2 className={`text-h1 ${styles.title}`}>{TITLE}</h2>

    <div className={styles.imageWrapper}>
      <Image
        src="/images/book-cover.jpg"
        alt={TITLE}
        fill
        sizes="(min-width: 1248px) 608px, 100vw"
        className={styles.image}
        priority
      />
    </div>

    <p className={`text-body-l ${styles.description}`}>{DESCRIPTION}</p>

    <Button as="a" size="lg" fullWidth href={ROUTES.book} className={styles.cta}>
      Подробнее
    </Button>
  </section>
)
