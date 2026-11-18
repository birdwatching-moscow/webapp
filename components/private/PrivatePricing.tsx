import { PrivateRequestButton } from '@/components/private/PrivateRequestButton'
import styles from './PrivatePricing.module.css'

export const PRICE_SECTION_ID = 'price'
const TITLE = 'Стоимость и условия'

type Price = { label: string; price: string }

type PrivatePricingProps = {
  description: string
  prices: readonly Price[]
  note: string
  terms: string
}

/** «Стоимость и условия» — target of the hero's «Посмотреть стоимость» link. */
export const PrivatePricing = ({ description, prices, note, terms }: PrivatePricingProps) => (
  <section id={PRICE_SECTION_ID} className={styles.section} aria-label={TITLE}>
    <div className={styles.content}>
      <div className={styles.intro}>
        <h2 className={`text-h1 ${styles.title}`}>{TITLE}</h2>
        <p className={`text-body-l ${styles.description}`}>{description}</p>
      </div>

      <div className={styles.prices}>
        {prices.map(({ label, price }) => (
          <div key={label} className={styles.priceCard}>
            <p className={`text-caption ${styles.priceLabel}`}>{label}</p>
            <p className={`text-h2 ${styles.priceValue}`}>{price}</p>
          </div>
        ))}
      </div>

      <p className={`text-body-l ${styles.note}`}>{note}</p>
      <p className={`text-body-l ${styles.terms}`}>{terms}</p>

      <PrivateRequestButton className={styles.cta} />
    </div>
  </section>
)
