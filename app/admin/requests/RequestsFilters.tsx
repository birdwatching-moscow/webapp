'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/utils/routes'
import { STATUS_FILTER_OPTIONS, TYPE_OPTIONS } from './_constants'
import styles from './requests.module.css'

interface Props {
  initial: { q: string; statuses: string[]; types: string[] }
}

export function RequestsFilters({ initial }: Props) {
  const router = useRouter()
  const [q, setQ]           = useState(initial.q)
  const [statuses, setStatuses] = useState(initial.statuses)
  const [types, setTypes]   = useState(initial.types)
  const [statusOpen, setStatusOpen] = useState(false)
  const [typeOpen, setTypeOpen]     = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  const typeRef   = useRef<HTMLDivElement>(null)
  const isFirst = useRef(true)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false)
      if (typeRef.current   && !typeRef.current.contains(e.target as Node))   setTypeOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const hasFilters = q !== '' || statuses.length > 0 || types.length > 0

  const buildUrl = useCallback((overrides?: Partial<{ q: string; statuses: string[]; types: string[] }>) => {
    const state = { q, statuses, types, ...overrides }
    const params = new URLSearchParams()
    if (state.q) params.set('q', state.q)
    state.statuses.forEach(s => params.append('status', s))
    state.types.forEach(t => params.append('type', t))
    const qs = params.toString()
    return qs ? `${ROUTES.admin.requests}?${qs}` : ROUTES.admin.requests
  }, [q, statuses, types])

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    const timer = setTimeout(() => router.push(buildUrl()), 600)
    return () => clearTimeout(timer)
  }, [buildUrl, router])

  function reset() {
    setQ(''); setStatuses([]); setTypes([])
    router.push(ROUTES.admin.requests)
  }

  function toggleStatus(value: string) {
    setStatuses(prev => prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value])
  }

  function toggleType(value: string) {
    setTypes(prev => prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value])
  }

  const statusLabel =
    statuses.length === 0 ? 'Все статусы' :
    statuses.length === 1 ? (STATUS_FILTER_OPTIONS.find(o => o.value === statuses[0])?.label ?? statuses[0]) :
    `${statuses.length} выбрано`

  const typeLabel =
    types.length === 0 ? 'Все типы' :
    types.length === 1 ? (TYPE_OPTIONS.find(o => o.value === types[0])?.label ?? types[0]) :
    `${types.length} выбрано`

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
          <span className={styles.filterLabel}>Тип</span>
          <div ref={typeRef} className={styles.statusSelect}>
            <button
              type="button"
              className={[styles.filterInput, styles.statusSelectTrigger].join(' ')}
              onClick={() => setTypeOpen(o => !o)}
              aria-expanded={typeOpen}
              aria-haspopup="listbox"
            >
              <span>{typeLabel}</span>
              <span className={styles.statusSelectCaret} aria-hidden="true">▾</span>
            </button>
            {typeOpen && (
              <div className={styles.statusSelectDropdown} role="listbox" aria-multiselectable="true">
                <button
                  type="button"
                  className={styles.statusSelectToggleAll}
                  onClick={() =>
                    setTypes(types.length === TYPE_OPTIONS.length ? [] : TYPE_OPTIONS.map(o => o.value))
                  }
                >
                  {types.length === TYPE_OPTIONS.length ? 'Убрать все' : 'Выбрать все'}
                </button>
                <div className={styles.statusSelectDivider} />
                {TYPE_OPTIONS.map(opt => (
                  <label key={opt.value} className={styles.statusSelectOption}>
                    <input
                      type="checkbox"
                      checked={types.includes(opt.value)}
                      onChange={() => toggleType(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}
          </div>
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
                    setStatuses(statuses.length === STATUS_FILTER_OPTIONS.length ? [] : STATUS_FILTER_OPTIONS.map(o => o.value))
                  }
                >
                  {statuses.length === STATUS_FILTER_OPTIONS.length ? 'Убрать все' : 'Выбрать все'}
                </button>
                <div className={styles.statusSelectDivider} />
                {STATUS_FILTER_OPTIONS.map(opt => (
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
