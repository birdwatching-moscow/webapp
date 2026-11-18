'use client'

import { useState } from 'react'
import { formatKopecksShort } from '@/utils/formatMoney'
import { FormError } from '@/components/ui/form-error/FormError'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown/Dropdown'
import { CHECKOUT_LABELS } from '@/lib/checkout-labels'
import { CHECKOUT_ERROR_CODE } from '@/types/checkout'
import { HTTP_METHOD, JSON_HEADERS } from '@/lib/constants'
import { ROUTES, API_ROUTES } from '@/utils/routes'
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
  disabled?: boolean
}

const QTY_OPTIONS: DropdownOption[] = Array.from({ length: 11 }, (_, i) => ({ label: String(i), value: i }))
const QTY_OPTIONS_NO_ZERO: DropdownOption[] = Array.from({ length: 10 }, (_, i) => ({ label: String(i + 1), value: i + 1 }))

function ticketWord(n: number): string {
  if (n === 1) return 'билет'
  if (n >= 2 && n <= 4) return 'билета'
  return 'билетов'
}

export function WalkCheckoutForm({ walkId, priceKopecks, ticketTypes, disabled = false }: Props) {
  const hasTypes = ticketTypes.length > 0

  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    hasTypes
      ? Object.fromEntries(ticketTypes.map((t) => [t.id, 0]))
      : {}
  )
  const [simpleQty, setSimpleQty] = useState(disabled ? 0 : 1)
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

      const res = await fetch(API_ROUTES.checkout, {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
      })
      if (res.status === 401) { window.location.href = ROUTES.login; return }
      const data = await res.json() as { confirmationUrl?: string; code?: string }
      if (!res.ok || !data.confirmationUrl) {
        setError(data.code === CHECKOUT_ERROR_CODE.capacityExceeded ? L.capacityExceeded : L.createOrderFailed)
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
              <Dropdown
                value={quantities[type.id] ?? 0}
                onChange={(v) => setQuantities((prev) => ({ ...prev, [type.id]: v }))}
                options={QTY_OPTIONS}
                disabled={disabled}
                className={styles.qtyDropdown}
                triggerClassName={styles.qtyTrigger}
              />
              <span className={styles.rowPrice}>{formatKopecksShort(type.priceKopecks)}</span>
            </div>
          ))
        ) : (
          <div className={styles.row}>
            <span className={styles.mobileLabel}>Тип билета</span>
            <span className={styles.rowName}>Стандартный</span>
            <Dropdown
              value={simpleQty}
              onChange={setSimpleQty}
              options={QTY_OPTIONS_NO_ZERO}
              disabled={disabled}
              className={styles.qtyDropdown}
              triggerClassName={styles.qtyTrigger}
            />
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

      <button type="submit" className={styles.cta} disabled={loading || disabled}>
        {loading ? L.redirecting : L.buy}
      </button>
    </form>
  )
}
