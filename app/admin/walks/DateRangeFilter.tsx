'use client'

import styles from './walks.module.css'

interface Props {
  from: string
  to: string
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
}

export function DateRangeFilter({ from, to, onFromChange, onToChange }: Props) {
  return (
    <div className={styles.filterDateRange}>
      <input
        className={styles.filterInput}
        type="date"
        value={from}
        max={to || undefined}
        onChange={e => onFromChange(e.target.value)}
      />
      <span className={styles.filterDateSep}>—</span>
      <input
        className={styles.filterInput}
        type="date"
        value={to}
        min={from || undefined}
        onChange={e => onToChange(e.target.value)}
      />
    </div>
  )
}
