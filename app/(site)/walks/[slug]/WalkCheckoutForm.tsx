'use client'

import { useState, useId } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { formatKopecksShort, formatKopecksRu } from '@/utils/formatMoney'
import styles from './walk.module.css'

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

  function changeQty(typeId: number, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [typeId]: Math.max(0, Math.min(10, (prev[typeId] ?? 0) + delta)),
    }))
  }

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
    <form className={styles.checkoutForm} onSubmit={handleSubmit}>
      <div className={styles.ticketTable}>
        <div className={styles.ticketTableHead}>
          <span className={`text-label ${styles.ticketTableLabel}`}>Тип билета</span>
          <span className={`text-label ${styles.ticketTableLabel}`}>Цена</span>
          <span className={`text-label ${styles.ticketTableLabel}`}>Количество</span>
        </div>

        {hasTypes ? (
          ticketTypes.map((type) => (
            <div key={type.id} className={styles.ticketRow}>
              <span className={`text-body-l ${styles.ticketName}`}>{type.name}</span>
              <span className={`text-body-l ${styles.ticketPrice}`}>{formatKopecksShort(type.priceKopecks)}</span>
              <div className={styles.qtyControl}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => changeQty(type.id, -1)}
                  disabled={(quantities[type.id] ?? 0) === 0}
                  aria-label={`Уменьшить количество ${type.name}`}
                >
                  –
                </button>
                <span className={`text-body-l ${styles.qtyValue}`}>{quantities[type.id] ?? 0}</span>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => changeQty(type.id, 1)}
                  disabled={(quantities[type.id] ?? 0) >= 10}
                  aria-label={`Увеличить количество ${type.name}`}
                >
                  +
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.ticketRow}>
            <span className={`text-body-l ${styles.ticketName}`}>Стандартный</span>
            <span className={`text-body-l ${styles.ticketPrice}`}>{formatKopecksShort(priceKopecks)}</span>
            <div className={styles.qtyControl}>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setSimpleQty((q) => Math.max(1, q - 1))}
                disabled={simpleQty <= 1}
                aria-label="Уменьшить количество"
              >
                –
              </button>
              <span className={`text-body-l ${styles.qtyValue}`}>{simpleQty}</span>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setSimpleQty((q) => Math.min(10, q + 1))}
                disabled={simpleQty >= 10}
                aria-label="Увеличить количество"
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className={`${styles.ticketRow} ${styles.totalRow}`}>
          <span className={`text-body-l ${styles.ticketName}`}>Итого</span>
          <span className={`text-body-l ${styles.ticketPrice}`}>{formatKopecksShort(totalKopecks)}</span>
          <span />
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

      <Button type="submit" size="lg" fullWidth disabled={loading || totalQty === 0}>
        {loading ? 'Перенаправление…' : `Купить · ${formatKopecksRu(totalKopecks)}`}
      </Button>
    </form>
  )
}
