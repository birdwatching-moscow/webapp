'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/utils/routes'
import styles from './requests.module.css'

const STATUS_OPTIONS = [
  { value: 'WAITLIST',    label: 'Лист ожидания' },
  { value: 'OPEN',        label: 'Открыта' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'CLOSED',      label: 'Закрыта' },
]

interface Props {
  initial: { q: string; statuses: string[] }
}

export function RequestsFilters({ initial }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(initial.q)
  const [statuses, setStatuses] = useState(initial.statuses)
  const [statusOpen, setStatusOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  const isFirst = useRef(true)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const hasFilters = q !== '' || statuses.length > 0

  const buildUrl = useCallback((overrides?: Partial<{ q: string; statuses: string[] }>) => {
    const state = { q, statuses, ...overrides }
    const params = new URLSearchParams()
    if (state.q) params.set('q', state.q)
    state.statuses.forEach(s => params.append('status', s))
    const qs = params.toString()
    return qs ? `${ROUTES.admin.requests}?${qs}` : ROUTES.admin.requests
  }, [q, statuses])

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    const timer = setTimeout(() => router.push(buildUrl()), 600)
    return () => clearTimeout(timer)
  }, [buildUrl, router])

  function reset() {
    setQ(''); setStatuses([])
    router.push(ROUTES.admin.requests)
  }

  function toggleStatus(value: string) {
    setStatuses(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    )
  }

  const statusLabel =
    statuses.length === 0 ? 'Все статусы' :
    statuses.length === 1 ? (STATUS_OPTIONS.find(o => o.value === statuses[0])?.label ?? statuses[0]) :
    `${statuses.length} выбрано`

  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="req-filter-q">Поиск</label>
          <input
            id="req-filter-q"
            className={styles.filterInput}
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Имя или email"
          />
        </div>
        <div className={styles.filterField}>
          <span className={styles.filterLabel}>Статус</span>
          <div ref={statusRef} className={styles.statusSelect}>
            <button
              type="button"
              className={[styles.filterInput, styles.statusSelectTrigger].join(' ')}
              onClick={() => setStatusOpen(o => !o)}
              aria-expanded={statusOpen}
              aria-haspopup="listbox"
            >
              <span>{statusLabel}</span>
              <span className={styles.statusSelectCaret} aria-hidden="true">▾</span>
            </button>
            {statusOpen && (
              <div className={styles.statusSelectDropdown} role="listbox" aria-multiselectable="true">
                <button
                  type="button"
                  className={styles.statusSelectToggleAll}
                  onClick={() =>
                    setStatuses(statuses.length === STATUS_OPTIONS.length ? [] : STATUS_OPTIONS.map(o => o.value))
                  }
                >
                  {statuses.length === STATUS_OPTIONS.length ? 'Убрать все' : 'Выбрать все'}
                </button>
                <div className={styles.statusSelectDivider} />
                {STATUS_OPTIONS.map(opt => (
                  <label key={opt.value} className={styles.statusSelectOption}>
                    <input
                      type="checkbox"
                      checked={statuses.includes(opt.value)}
                      onChange={() => toggleStatus(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {hasFilters && (
        <div className={styles.filterActions}>
          <button type="button" className={styles.filterReset} onClick={reset}>
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  )
}
