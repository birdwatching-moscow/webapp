'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { RequestStatus } from '@/lib/enums'
import { updateRequestStatus } from './_actions'
import { STATUS_DISPLAY, STATUS_PICKER_BASE, STATUS_PICKER_WAITLIST } from './_constants'
import styles from './requests.module.css'

interface Props {
  id: string
  status: RequestStatus
  type: string
}

export function StatusPicker({ id, status, type }: Props) {
  const statusOptions = type === 'EXPEDITION'
    ? [STATUS_PICKER_WAITLIST, ...STATUS_PICKER_BASE]
    : STATUS_PICKER_BASE
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [pending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(status)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    function onScroll() { setOpen(false) }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  function handleOpen() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({ top: rect.bottom + 6, left: rect.left })
    setOpen(o => !o)
  }

  function pick(next: RequestStatus) {
    setOpen(false)
    if (next === currentStatus) return
    setCurrentStatus(next)
    startTransition(async () => {
      await updateRequestStatus(id, next)
    })
  }

  const current = STATUS_DISPLAY[currentStatus]

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[
          styles.badge,
          styles[current.cls as keyof typeof styles],
          styles.statusPickerTrigger,
        ].filter(Boolean).join(' ')}
        onClick={handleOpen}
        aria-expanded={open}
        aria-haspopup="true"
        title="Изменить статус"
      >
        {current.label}
        <span className={styles.statusPickerCaret} aria-hidden="true">▾</span>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          className={styles.statusPickerPopover}
          style={{ top: coords.top, left: coords.left }}
          role="menu"
        >
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              role="menuitem"
              className={styles.statusPickerOption}
              onClick={() => pick(opt.value)}
            >
              <span className={[styles.badge, styles[opt.cls as keyof typeof styles]].join(' ')}>
                {opt.label}
              </span>
              {opt.value === currentStatus && (
                <span className={styles.statusPickerCheck} aria-hidden="true">✓</span>
              )}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}
