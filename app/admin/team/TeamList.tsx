'use client'

import { useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import { reorderTeamMembers, deleteTeamMember } from './_actions'
import styles from './team.module.css'

type Member = {
  id: number
  name: string
  photoUrl: string
  sortOrder: number
}

export function TeamList({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState(initialMembers)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()
  const [isDeleting, startDeleting] = useTransition()

  const draggingIdRef = useRef<number | null>(null)
  const snapshotRef = useRef<Member[]>(initialMembers)

  const handleDragStart = (id: number) => {
    draggingIdRef.current = id
    setDraggingId(id)
    snapshotRef.current = [...members]
  }

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault()
    if (draggingIdRef.current !== null && draggingIdRef.current !== id) {
      setDropTargetId(id)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return
    setDropTargetId(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault()
    const sourceId = draggingIdRef.current
    setDraggingId(null)
    setDropTargetId(null)
    draggingIdRef.current = null

    if (!sourceId || sourceId === targetId) return

    const newOrder = [...members]
    const sourceIdx = newOrder.findIndex(m => m.id === sourceId)
    const targetIdx = newOrder.findIndex(m => m.id === targetId)
    const [item] = newOrder.splice(sourceIdx, 1)
    newOrder.splice(targetIdx, 0, item)

    setMembers(newOrder)
    setSaveError(null)

    startSaving(async () => {
      try {
        await reorderTeamMembers(newOrder.map(m => m.id))
      } catch {
        setSaveError('Не удалось сохранить порядок')
        setMembers(snapshotRef.current)
      }
    })
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDropTargetId(null)
    draggingIdRef.current = null
  }

  const handleDelete = (id: number) => {
    setDeleteError(null)
    startDeleting(async () => {
      try {
        await deleteTeamMember(id)
        setMembers(prev => prev.filter(m => m.id !== id))
        setPendingDeleteId(null)
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : 'Ошибка при удалении')
        setPendingDeleteId(null)
      }
    })
  }

  if (members.length === 0) {
    return <p className={styles.empty}>Нет участников команды</p>
  }

  return (
    <div>
      {saveError && <p className={styles.error}>{saveError}</p>}
      {deleteError && <p className={styles.error}>{deleteError}</p>}
      {isSaving && <p className={styles.saving}>Сохранение порядка…</p>}

      <ul className={styles.list} role="list">
        {members.map((m, idx) => {
          const isDragging = draggingId === m.id
          const isDropTarget = dropTargetId === m.id
          const isPendingDelete = pendingDeleteId === m.id

          return (
            <li
              key={m.id}
              draggable
              onDragStart={() => handleDragStart(m.id)}
              onDragOver={e => handleDragOver(e, m.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, m.id)}
              onDragEnd={handleDragEnd}
              className={[
                styles.item,
                isDragging ? styles.itemDragging : '',
                isDropTarget ? styles.itemDropTarget : '',
              ].filter(Boolean).join(' ')}
            >
              <span className={styles.handle} aria-hidden="true">
                <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
                  <circle cx="2" cy="2.5" r="1.5" />
                  <circle cx="8" cy="2.5" r="1.5" />
                  <circle cx="2" cy="8" r="1.5" />
                  <circle cx="8" cy="8" r="1.5" />
                  <circle cx="2" cy="13.5" r="1.5" />
                  <circle cx="8" cy="13.5" r="1.5" />
                </svg>
              </span>

              <span className={styles.order}>{idx + 1}</span>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.photoUrl} alt="" className={styles.photo} width={32} height={32} />

              <Link href={`/admin/team/${m.id}`} className={styles.name}>
                {m.name}
              </Link>

              <div className={styles.rowActions}>
                {isPendingDelete ? (
                  <>
                    <span className={styles.confirmText}>Удалить?</span>
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={isDeleting}
                      className={styles.confirmDeleteBtn}
                    >
                      {isDeleting ? '…' : 'Да'}
                    </button>
                    <button
                      onClick={() => setPendingDeleteId(null)}
                      className={styles.cancelBtn}
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setDeleteError(null)
                      setPendingDeleteId(m.id)
                    }}
                    className={styles.deleteBtn}
                    aria-label={`Удалить ${m.name}`}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
