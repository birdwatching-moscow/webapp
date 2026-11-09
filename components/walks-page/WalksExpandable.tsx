'use client'

import { useState } from 'react'
import Link from 'next/link'
import { NearestSection } from '@/components/NearestSection/NearestSection'
import { Button } from '@/components/ui/buttons/Button'
import { formatWalkDate } from '@/utils/formatWalkDate'
import { formatTicketsLabel } from '@/utils/formatTicketsLabel'
import { formatKopecksShort } from '@/utils/formatMoney'
import { ROUTES } from '@/utils/routes'
import type { WalkTableRow } from '@/lib/walks'
import tableStyles from '@/components/WalksTable/WalksTable.module.css'
import styles from './WalksExpandable.module.css'

export interface WalksExpandableProps {
  walks: WalkTableRow[]
}

export const WalksExpandable = ({ walks }: WalksExpandableProps) => {
  const [expanded, setExpanded] = useState(false)

  if (walks.length === 0) return null

  const hasExtra = walks.length > 3

  return (
    <section data-testid="walks-table" className={tableStyles.section}>
      <NearestSection showMoreButton={false}>
        <div
          data-testid="walks-expandable-wrapper"
          className={expanded ? styles.expanded : ''}
        >
          <div className={tableStyles.table} role="list">
            <div className={tableStyles.headerRow} role="presentation">
              <span className={`text-label ${tableStyles.colDate}`}>Дата</span>
              <span className={`text-label ${tableStyles.colTitle}`}>Место</span>
              <span className={`text-label ${tableStyles.colPrice}`}>Цена</span>
              <span className={`text-label ${tableStyles.colTickets}`}>Осталось билетов</span>
            </div>

            {walks.map((walk, index) => {
              const available = Math.max(0, walk.capacity - walk.ticketsSold)
              const dateLabel = formatWalkDate(walk.startsAt, walk.endsAt)
              const priceLabel = `от ${formatKopecksShort(walk.priceKopecks)}`
              const ticketsLabel = formatTicketsLabel(available)
              const isExtra = index >= 3

              return (
                <Link
                  key={walk.id}
                  href={ROUTES.walk(walk.slug)}
                  className={`${tableStyles.row}${isExtra ? ` ${styles.extraRow}` : ''}`}
                  aria-label={walk.title}
                >
                  <span className={`text-body ${tableStyles.colDate} ${tableStyles.dateText}`}>{dateLabel}</span>
                  <span className={`text-body ${tableStyles.colTitle}`}>{walk.title}</span>
                  <span className={`text-body ${tableStyles.colPrice}`}>{priceLabel}</span>
                  <span className={`text-body ${tableStyles.colTickets}`}>{ticketsLabel}</span>
                  <span className={tableStyles.arrow} aria-hidden="true">→</span>
                </Link>
              )
            })}
          </div>

          {hasExtra && !expanded && (
            <div className={styles.expandButton}>
              <Button variant="default" fullWidth onClick={() => setExpanded(true)}>
                Посмотреть все
              </Button>
            </div>
          )}
        </div>
      </NearestSection>
    </section>
  )
}
