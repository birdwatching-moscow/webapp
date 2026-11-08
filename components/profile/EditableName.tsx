'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input/Input'
import { Button } from '@/components/ui/buttons/Button'
import styles from './profile.module.css'

export const EditableName = ({ initialName }: { initialName: string }) => {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [nameInput, setNameInput] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startEditing = () => {
    setNameInput(name)
    setIsEditing(true)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    if (!nameInput.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/user/update-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim() }),
      })
      if (!res.ok) {
        setError('Не удалось сохранить. Попробуйте ещё раз.')
        return
      }
      setName(nameInput.trim())
      setIsEditing(false)
      router.refresh()
    } catch {
      setError('Не удалось сохранить. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className={styles.editBlock}>
        <span className={styles.fieldLabel}>Имя</span>
        <Input
          id="edit-name"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          disabled={loading}
          autoFocus
          error={error ?? undefined}
          className={styles.fieldInput}
        />
        <div className={styles.editActions}>
          <Button size="sm" onClick={handleSave} loading={loading} disabled={loading || !nameInput.trim()}>
            Сохранить
          </Button>
          <Button size="sm" variant="secondary" onClick={handleCancel} disabled={loading}>
            Отменить
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.profileRow}>
        <span className={styles.fieldLabel}>Имя</span>
        <button type="button" className={styles.editLink} onClick={startEditing}>
          Изменить
        </button>
      </div>
      <span className={styles.fieldValue}>{name}</span>
    </>
  )
}
