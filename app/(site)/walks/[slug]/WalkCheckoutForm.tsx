'use client'

import { useState, useId } from 'react'
import { formatKopecksShort } from '@/utils/formatMoney'
import styles from './WalkCheckoutForm.module.css'

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
  const radioName = useId()
  const hasTypes = ticketTypes.length > 0

  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    hasTypes
      ? Object.fromEntries(ticketTypes.map((t) => [t.id, 0]))
      : {}
  )
  const [simpleQty, setSimpleQty] = useState(1)
  const [hasBinoculars, setHasBinoculars] = useState<boolean | null>(null)
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
    if (hasBinoculars === null) {
      setError('Пожалуйста, ответьте на вопрос про бинокль')
      return
    }
    if (totalQty === 0) {
      setError('Выберите хотя бы один билет')
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
            hasBinoculars,
          }
        : { walkId, quantity: simpleQty, hasBinoculars }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json() as { confirmationUrl?: string; code?: string }
      if (!res.ok || !data.confirmationUrl) {
        setError(
          data.code === 'CAPACITY_EXCEEDED'
            ? 'К сожалению, места закончились.'
            : 'Не удалось создать заказ. Попробуйте позже.'
        )
        return
      }
      window.location.href = data.confirmationUrl
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.')
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

      <fieldset className={styles.binocularsField}>
        <legend className={styles.binocularsLegend}>Есть ли у вас бинокль?</legend>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name={radioName}
              value="yes"
              className={styles.radioInput}
              checked={hasBinoculars === true}
              onChange={() => setHasBinoculars(true)}
            />
            Да
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name={radioName}
              value="no"
              className={styles.radioInput}
              checked={hasBinoculars === false}
              onChange={() => setHasBinoculars(false)}
            />
            Нет
          </label>
        </div>
      </fieldset>

      {error && <p className={styles.checkoutError}>{error}</p>}

      <button type="submit" className={styles.cta} disabled={loading || totalQty === 0}>
        {loading ? 'Перенаправление…' : 'Купить'}
      </button>
    </form>
  )
}
