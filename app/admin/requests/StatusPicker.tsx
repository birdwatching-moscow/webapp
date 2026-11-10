'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { RequestStatus } from '@/generated/prisma/client'
import { updateRequestStatus } from './_actions'
import styles from './requests.module.css'

const STATUS_OPTIONS: { value: RequestStatus; label: string; cls: string }[] = [
  { value: 'WAITLIST',    label: 'Лист ожидания',  cls: 'badgeWAITLIST' },
  { value: 'OPEN',        label: 'Открыта',        cls: 'badgeOPEN' },
  { value: 'IN_PROGRESS', label: 'В работе',       cls: 'badgeIN_PROGRESS' },
  { value: 'CLOSED',      label: 'Закрыта',        cls: 'badgeCLOSED' },
]

const ALL_STATUS_DISPLAY: Record<RequestStatus, { label: string; cls: string }> = {
  NEW:         { label: 'Новая',         cls: 'badgeNEW' },
  WAITLIST:    { label: 'Лист ожидания', cls: 'badgeWAITLIST' },
  OPEN:        { label: 'Открыта',       cls: 'badgeOPEN' },
  IN_PROGRESS: { label: 'В работе',      cls: 'badgeIN_PROGRESS' },
  CLOSED:      { label: 'Закрыта',       cls: 'badgeCLOSED' },
}

interface Props {
  id: string
  status: RequestStatus
}

export function StatusPicker({ id, status }: Props) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [pending, startTransition] = useTransition()
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
    if (next === status) return
    startTransition(async () => {
      await updateRequestStatus(id, next)
    })
  }

  const current = ALL_STATUS_DISPLAY[status]

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[
          styles.badge,
          styles[current.cls as keyof typeof styles],
          styles.statusPickerTrigger,
          pending ? styles.statusPickerPending : '',
        ].filter(Boolean).join(' ')}
        onClick={handleOpen}
        aria-expanded={open}
        aria-haspopup="true"
        disabled={pending}
        title="Изменить статус"
      >
        {pending ? '…' : current.label}
        <span className={styles.statusPickerCaret} aria-hidden="true">▾</span>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          className={styles.statusPickerPopover}
          style={{ top: coords.top, left: coords.left }}
          role="menu"
        >
          {STATUS_OPTIONS.map(opt => (
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
              {opt.value === status && (
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
