'use client'

import { useState } from 'react'
import { formatKopecksShort } from '@/utils/formatMoney'
import { FormError } from '@/components/ui/form-error/FormError'
import { CHECKOUT_LABELS } from '@/lib/checkout-labels'
import styles from './WalkCheckoutForm.module.css'

const L = CHECKOUT_LABELS.form

type TicketTypeItem = {
  id: number
  name: string
  priceKopecks: number
}

interface Props {
  walkId: string
  priceKopecks: number
  ticketTypes: TicketTypeItem[]
}

const QTY_OPTIONS = Array.from({ length: 11 }, (_, i) => i)

function ticketWord(n: number): string {
  if (n === 1) return 'билет'
  if (n >= 2 && n <= 4) return 'билета'
  return 'билетов'
}

export function WalkCheckoutForm({ walkId, priceKopecks, ticketTypes }: Props) {
  const hasTypes = ticketTypes.length > 0

  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    hasTypes
      ? Object.fromEntries(ticketTypes.map((t) => [t.id, 0]))
      : {}
  )
  const [simpleQty, setSimpleQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalQty = hasTypes
    ? Object.values(quantities).reduce((s, q) => s + q, 0)
    : simpleQty

  const totalKopecks = hasTypes
    ? ticketTypes.reduce((s, t) => s + t.priceKopecks * (quantities[t.id] ?? 0), 0)
    : priceKopecks * simpleQty

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (totalQty === 0) {
      setError(L.noTickets)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const body = hasTypes
        ? {
            walkId,
            lineItems: ticketTypes
              .filter((t) => (quantities[t.id] ?? 0) > 0)
              .map((t) => ({ ticketTypeId: t.id, quantity: quantities[t.id] })),
          }
        : { walkId, quantity: simpleQty }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json() as { confirmationUrl?: string; code?: string }
      if (!res.ok || !data.confirmationUrl) {
        setError(data.code === 'CAPACITY_EXCEEDED' ? L.capacityExceeded : L.createOrderFailed)
        return
      }
      window.location.href = data.confirmationUrl
    } catch {
      setError(L.networkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.card}>
        {/* Desktop header row */}
        <div className={styles.tableHead}>
          <span className={styles.tableHeadCell}>Тип билета</span>
          <span className={styles.tableHeadCell}>Цена</span>
          <span className={styles.tableHeadCell}>Количество</span>
        </div>

        {/* Ticket rows */}
        {hasTypes ? (
          ticketTypes.map((type) => (
            <div key={type.id} className={styles.row}>
              <span className={styles.mobileLabel}>Тип билета</span>
              <span className={styles.rowName}>{type.name}</span>
              <select
                className={styles.qtySelect}
                value={quantities[type.id] ?? 0}
                onChange={(e) =>
                  setQuantities((prev) => ({ ...prev, [type.id]: parseInt(e.target.value, 10) }))
                }
                aria-label={`Количество билетов «${type.name}»`}
              >
                {QTY_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className={styles.rowPrice}>{formatKopecksShort(type.priceKopecks)}</span>
            </div>
          ))
        ) : (
          <div className={styles.row}>
            <span className={styles.mobileLabel}>Тип билета</span>
            <span className={styles.rowName}>Стандартный</span>
            <select
              className={styles.qtySelect}
              value={simpleQty}
              onChange={(e) => setSimpleQty(parseInt(e.target.value, 10))}
              aria-label="Количество билетов"
            >
              {QTY_OPTIONS.filter((n) => n > 0).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className={styles.rowPrice}>{formatKopecksShort(priceKopecks)}</span>
          </div>
        )}

        {/* Total row */}
        <div className={`${styles.row} ${styles.totalRow}`}>
          <span className={styles.mobileLabel}>Итого</span>
          <span className={styles.rowName}>Итого</span>
          <span className={styles.rowPrice}>{formatKopecksShort(totalKopecks)}</span>
          <span className={styles.totalQty}>
            {totalQty > 0 ? `${totalQty} ${ticketWord(totalQty)}` : '—'}
          </span>
        </div>
      </div>

      <FormError message={error} />

      <button type="submit" className={styles.cta} disabled={loading}>
        {loading ? L.redirecting : L.buy}
      </button>
    </form>
  )
}
