'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MultiSelect } from './MultiSelect'
import { DateRangeFilter } from './DateRangeFilter'
import { ROUTES } from '@/utils/routes'
import styles from './walks.module.css'

const STATUS_OPTIONS = [
  { value: 'active',    label: 'Активна' },
  { value: 'draft',     label: 'Черновик' },
  { value: 'past',      label: 'Завершена' },
  { value: 'cancelled', label: 'Отменена' },
]

interface Props {
  guides: { id: number; name: string }[]
  initial: { q: string; from: string; to: string; statuses: string[]; guides: string[] }
}

export function WalksFilters({ guides, initial }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(initial.q)
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [statuses, setStatuses] = useState(initial.statuses)
  const [selectedGuides, setSelectedGuides] = useState(initial.guides)
  const isFirst = useRef(true)

  const guideOptions = guides.map(g => ({ value: String(g.id), label: g.name }))

  const hasFilters = q !== '' || from !== '' || to !== '' || statuses.length > 0 || selectedGuides.length > 0

  const buildUrl = useCallback((overrides?: Partial<typeof initial>) => {
    const state = { q, from, to, statuses, guides: selectedGuides, ...overrides }
    const params = new URLSearchParams()
    params.set('tab', 'all')
    if (state.q) params.set('q', state.q)
    if (state.from) params.set('from', state.from)
    if (state.to) params.set('to', state.to)
    state.statuses.forEach(s => params.append('status', s))
    state.guides.forEach(g => params.append('guide', g))
    return `${ROUTES.admin.walks}?${params.toString()}`
  }, [q, from, to, statuses, selectedGuides])

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    const timer = setTimeout(() => router.push(buildUrl()), 1000)
    return () => clearTimeout(timer)
  }, [buildUrl, router])

  function reset() {
    setQ(''); setFrom(''); setTo(''); setStatuses([]); setSelectedGuides([])
    router.push(`${ROUTES.admin.walks}?tab=all`)
  }

  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-q">Название</label>
          <input
            id="filter-q"
            className={styles.filterInput}
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Поиск по названию"
          />
        </div>
        <div className={styles.filterField}>
          <span className={styles.filterLabel}>Период</span>
          <DateRangeFilter
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
          />
        </div>
        <div className={styles.filterField}>
          <span className={styles.filterLabel}>Статус</span>
          <MultiSelect
            options={STATUS_OPTIONS}
            selected={statuses}
            emptyLabel="Все статусы"
            onChange={setStatuses}
          />
        </div>
        <div className={styles.filterField}>
          <span className={styles.filterLabel}>Гид</span>
          <MultiSelect
            options={guideOptions}
            selected={selectedGuides}
            emptyLabel="Все гиды"
            onChange={setSelectedGuides}
          />
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
