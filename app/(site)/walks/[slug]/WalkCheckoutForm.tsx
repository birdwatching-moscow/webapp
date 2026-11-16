'use client'

import { useState, useId } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { formatKopecksRu } from '@/utils/formatMoney'
import styles from './walk.module.css'

interface Props {
  walkId: string
  priceKopecks: number
}

export function WalkCheckoutForm({ walkId, priceKopecks }: Props) {
  const radioName = useId()
  const [hasBinoculars, setHasBinoculars] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasBinoculars === null) { setError('Пожалуйста, ответьте на вопрос про бинокль'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walkId, quantity: 1, hasBinoculars }),
      })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json() as { confirmationUrl?: string; code?: string }
      if (!res.ok || !data.confirmationUrl) {
        setError(data.code === 'CAPACITY_EXCEEDED' ? 'К сожалению, места закончились.' : 'Не удалось создать заказ. Попробуйте позже.')
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

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Перенаправление…' : `Купить билет · ${formatKopecksRu(priceKopecks)}`}
      </Button>
    </form>
  )
}
