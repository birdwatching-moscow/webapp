import type { ExpeditionChecklistItem } from '@/lib/expeditions'
import styles from './ExpeditionFaq.module.css'

type Props = {
  items: ExpeditionChecklistItem[]
}

export const ExpeditionFaq = ({ items }: Props) => (
  <section className={styles.section}>
    <div className={styles.inner}>
    <h2 className={`text-h1 ${styles.title}`}>Всё, что важно знать перед поездкой</h2>
    <div className={styles.list}>
      {items.map((item, i) => (
        <details key={i} className={styles.item} open={i === 0}>
          <summary className={styles.summary}>
            {item.title}
            <span className={styles.toggle} aria-hidden="true" />
          </summary>
          <p className={styles.answer}>{item.text}</p>
        </details>
      ))}
    </div>
    </div>
  </section>
)
