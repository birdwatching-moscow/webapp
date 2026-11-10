'use client'

import { useState, useTransition, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/buttons/Button'
import { createWalkDraft } from '@/app/admin/walks/_actions'
import { ROUTES } from '@/utils/routes'
import styles from '../[id]/walk-edit.module.css'

type Guide = { id: number; name: string }

interface Props {
  guides: Guide[]
}

export function WalkNewForm({ guides }: Props) {
  const router = useRouter()
  const [title, setTitle]   = useState('')
  const [guideId, setGuideId] = useState(String(guides[0]?.id ?? ''))
  const [error, setError]   = useState<string | null>(null)
  const [pending, startCreate] = useTransition()

  const titleId = useId()
  const guideSelectId = useId()

  function handleSubmit() {
    setError(null)
    if (!title.trim()) { setError('Название обязательно'); return }
    if (!guideId) { setError('Выберите гида'); return }
    startCreate(async () => {
      try {
        const id = await createWalkDraft(title.trim(), Number(guideId))
        router.push(`/admin/walks/${id}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при создании')
      }
    })
  }

  return (
    <div className={styles.page}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={() => router.push(ROUTES.admin.walks)}>
          ← Прогулки
        </button>
        <div className={styles.topBarRight}>
          <span className={[styles.badge, styles.badgeDRAFT].join(' ')}>Новая</span>
          <Button size="sm" onClick={handleSubmit} disabled={pending || !title.trim()}>
            {pending ? 'Создание…' : 'Создать черновик'}
          </Button>
        </div>
      </div>

      {error && (
        <div className={styles.readonlyBanner} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      <div className={styles.sections}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Основное</h2>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.required}`} htmlFor={titleId}>
                Название
              </label>
              <input
                id={titleId}
                className={styles.input}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                placeholder="Например: Утренний бёрдвотчинг в Коломенском"
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.required}`} htmlFor={guideSelectId}>
                Гид
              </label>
              <select
                id={guideSelectId}
                className={styles.select}
                value={guideId}
                onChange={e => setGuideId(e.target.value)}
              >
                {guides.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>
          <p className={styles.emailNote}>
            Остальные поля можно заполнить после создания.
          </p>
        </section>
      </div>

    </div>
  )
}
