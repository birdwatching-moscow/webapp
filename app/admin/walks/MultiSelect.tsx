'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './walks.module.css'

interface Props {
  options: { value: string; label: string }[]
  selected: string[]
  emptyLabel: string
  onChange: (selected: string[]) => void
}

export function MultiSelect({ options, selected, emptyLabel, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter(x => x !== value) : [...selected, value])
  }

  const label =
    selected.length === 0 ? emptyLabel :
    selected.length === 1 ? (options.find(o => o.value === selected[0])?.label ?? selected[0]) :
    `${selected.length} выбрано`

  return (
    <div ref={ref} className={styles.guideSelect}>
      <button
        type="button"
        className={[styles.filterInput, styles.guideSelectTrigger].join(' ')}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{label}</span>
        <span className={styles.guideSelectCaret} aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className={styles.guideSelectDropdown} role="listbox" aria-multiselectable="true">
          <button
            type="button"
            className={styles.guideSelectToggleAll}
            onClick={() => onChange(selected.length === options.length ? [] : options.map(o => o.value))}
          >
            {selected.length === options.length ? 'Убрать все' : 'Выбрать все'}
          </button>
          <div className={styles.guideSelectDivider} />
          {options.map(opt => (
            <label key={opt.value} className={styles.guideSelectOption}>
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
