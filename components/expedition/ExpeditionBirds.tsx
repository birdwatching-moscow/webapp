import { PhotoWithTextCredit } from '@/components/PhotoWithTextCredit/PhotoWithTextCredit'
import type { ExpeditionGalleryItem } from '@/lib/expeditions'
import styles from './ExpeditionBirds.module.css'

type Props = {
  items: ExpeditionGalleryItem[]
}

export const ExpeditionBirds = ({ items }: Props) => {
  if (items.length === 0) return null

  return (
    <section className={styles.section} aria-label="Будем искать">
      <h2 className={`text-h1 ${styles.title}`}>Будем искать</h2>
      <ul className={`${styles.list}${items.length <= 2 ? ` ${styles.listCentered}` : ''}`}>
        {items.map((item, i) => (
          <li key={i} className={styles.item}>
            <div className={styles.photo}>
              <PhotoWithTextCredit
                src={item.url}
                alt={item.info}
                credit={item.info}
                sizes="(min-width: 1248px) calc((100vw - 240px) / 3), calc(100vw - 32px)"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
