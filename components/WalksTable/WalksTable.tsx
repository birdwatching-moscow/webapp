import Link from 'next/link'
import { NearestSection } from '@/components/NearestSection/NearestSection'
import { formatWalkDate } from '@/utils/formatWalkDate'
import { formatTicketsLabel } from '@/utils/formatTicketsLabel'
import { formatKopecksShort } from '@/utils/formatMoney'
import { ROUTES } from '@/utils/routes'
import type { WalkTableRow } from '@/lib/walks'
import styles from './WalksTable.module.css'

export interface WalksTableProps {
  walks: WalkTableRow[]
  showMoreButton?: boolean
}

export const WalksTable = ({ walks, showMoreButton = false }: WalksTableProps) => {
  if (walks.length === 0) return null
  return (
  <section data-testid="walks-table" className={styles.section}>
    <NearestSection
      moreHref={ROUTES.walks}
      showMoreButton={showMoreButton}
      isEmpty={walks.length === 0}
    >
      <div className={styles.table} role="list">
        <div className={styles.headerRow} role="presentation">
          <span className={`text-label ${styles.colDate}`}>Дата</span>
          <span className={`text-label ${styles.colTitle}`}>Место</span>
          <span className={`text-label ${styles.colPrice}`}>Цена</span>
          <span className={`text-label ${styles.colTickets}`}>Осталось билетов</span>
        </div>

        {walks.map((walk) => {
          const available = walk.capacity - walk.ticketsSold
          const dateLabel = formatWalkDate(walk.startsAt, walk.endsAt)
          const priceLabel = walk.ticketTypeCount > 1
            ? `от ${formatKopecksShort(walk.minPriceKopecks)}`
            : formatKopecksShort(walk.priceKopecks)
          const ticketsLabel = formatTicketsLabel(available)

          return (
            <Link
              key={walk.id}
              href={ROUTES.walk(walk.slug)}
              className={styles.row}
              aria-label={walk.title}
            >
              <span className={`text-body ${styles.colDate} ${styles.dateText}`}>{dateLabel}</span>
              <span className={`text-body ${styles.colTitle}`}>{walk.title}</span>
              <span className={`text-body ${styles.colPrice}`}>{priceLabel}</span>
              <span className={`text-body ${styles.colTickets}`}>
                {ticketsLabel}
              </span>
              <span className={styles.arrow} aria-hidden="true">→</span>
            </Link>
          )
        })}
      </div>
    </NearestSection>
  </section>
  )
}
