import type { TicketTypeRow } from './types'
import { makeKey, MAX_TICKETS } from './types'
import styles from '../[id]/walk-edit.module.css'

interface Props {
  tickets: TicketTypeRow[]
  onChange: (tickets: TicketTypeRow[]) => void
  disabled?: boolean
  requireAll?: boolean
}

export function WalkSectionTickets({ tickets, onChange, disabled, requireAll }: Props) {
  function update(key: string, patch: Partial<TicketTypeRow>) {
    onChange(tickets.map(t => t.key === key ? { ...t, ...patch } : t))
  }
  function add() {
    if (tickets.length >= MAX_TICKETS) return
    onChange([...tickets, { key: makeKey(), name: '', priceRub: '', capacity: '' }])
  }
  function remove(key: string) {
    if (tickets.length <= 1) return
    onChange(tickets.filter(t => t.key !== key))
  }

  const hasValidTicket = tickets.some(t => t.name.trim() !== '' && t.priceRub !== '' && t.capacity !== '')

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Билеты
        {requireAll && !hasValidTicket && (
          <span className={styles.sectionHint}> — хотя бы один с названием, ценой и количеством *</span>
        )}
      </h2>

      <div className={styles.ticketList}>
        <div className={styles.ticketColLabels}>
          <span className={styles.ticketColLabel}>Тип</span>
          <span className={styles.ticketColLabel}>Цена (₽)</span>
          <span className={styles.ticketColLabel}>Количество</span>
          <span />
        </div>

        {tickets.map(t => (
          <div key={t.key} className={styles.ticketRow}>
            <input
              className={`${styles.input} ${styles.ticketName}`}
              value={t.name}
              onChange={e => update(t.key, { name: e.target.value })}
              disabled={disabled}
              placeholder="Название типа"
            />
            <input
              className={styles.input}
              type="number"
              min="0"
              step="1"
              value={t.priceRub}
              onChange={e => update(t.key, { priceRub: e.target.value })}
              disabled={disabled}
              placeholder="Не указана"
            />
            <input
              className={styles.input}
              type="number"
              min="0"
              step="1"
              value={t.capacity}
              onChange={e => update(t.key, { capacity: e.target.value })}
              disabled={disabled}
              placeholder="0"
            />
            <button
              type="button"
              className={styles.removeTicketBtn}
              onClick={() => remove(t.key)}
              disabled={disabled || tickets.length <= 1}
              aria-label="Удалить тип билета"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {!disabled && (
        <button
          type="button"
          className={styles.addTicketBtn}
          onClick={add}
          disabled={tickets.length >= MAX_TICKETS}
        >
          + Добавить тип{tickets.length >= MAX_TICKETS ? ' (максимум 5)' : ''}
        </button>
      )}
    </section>
  )
}
