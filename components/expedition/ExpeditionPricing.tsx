import type { ExpeditionTicketTypeRow } from '@/lib/expeditions'
import styles from './ExpeditionPricing.module.css'

type Props = {
  ticketTypes: ExpeditionTicketTypeRow[]
  includedItems: string[]
  excludedItems: string[]
  cta: React.ReactNode
}

function formatPrice(kopecks: number | null): string {
  if (kopecks == null) return 'По запросу'
  return `${Math.round(kopecks / 100).toLocaleString('ru-RU')} ₽`
}

export const ExpeditionPricing = ({ ticketTypes, includedItems, excludedItems, cta }: Props) => {
  if (ticketTypes.length === 0 && includedItems.length === 0 && excludedItems.length === 0) return null

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.inner}>
        <h2 className={`text-h1 ${styles.title}`}>Стоимость и условия</h2>

        {ticketTypes.length > 0 && (
          <ul className={styles.cards}>
            {ticketTypes.map(t => (
              <li key={t.id} className={styles.card}>
                {t.description && (
                  <span className={styles.cardLabel}>{t.description}</span>
                )}
                <span className={styles.cardPrice}>{formatPrice(t.priceKopecks)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.lists}>
          {includedItems.length > 0 && (
            <div className={styles.listBlock}>
              <p className={styles.listTitle}>Включено в базовую стоимость:</p>
              <ul className={styles.list}>
                {includedItems.map((item, i) => (
                  <li key={i} className={styles.listItem}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {excludedItems.length > 0 && (
            <div className={styles.listBlock}>
              <p className={styles.listTitle}>Не входит в стоимость:</p>
              <ul className={styles.list}>
                {excludedItems.map((item, i) => (
                  <li key={i} className={styles.listItem}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {cta}
      </div>
    </section>
  )
}
