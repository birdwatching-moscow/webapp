'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/buttons/Button'
import { createTeamMember } from '@/app/admin/team/_actions'
import { ProfileLinkField } from '@/app/admin/team/[id]/ProfileLinkField'
import { TeamPhotoField } from '@/app/admin/team/[id]/TeamPhotoField'
import { ROUTES } from '@/utils/routes'
import styles from '@/app/admin/team/[id]/member-edit.module.css'

export function TeamMemberNewForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startCreate] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const data = new FormData(form)
    const name = (data.get('name') as string).trim()
    const photoUrl = (data.get('photoUrl') as string).trim()
    const education = (data.get('education') as string).trim()
    const achievements = (data.get('achievements') as string).trim()
    const link = ((data.get('profileLink') as string) ?? '').trim()

    if (!name)         { setError('Укажите имя'); return }
    if (!photoUrl)     { setError('Загрузите фото'); return }
    if (!education)    { setError('Заполните поле «Образование»'); return }
    if (!achievements) { setError('Заполните поле «Достижения»'); return }
    if (!link)         { setError('Заполните поле «Профиль»'); return }

    startCreate(async () => {
      try {
        await createTeamMember({
          name,
          photoUrl:     photoUrl,
          education:    education || undefined,
          achievements: achievements || undefined,
          profileLinks: link ? [link] : [],
          sortOrder:    parseInt((data.get('sortOrder') as string) ?? '0', 10),
        })
        router.push(ROUTES.admin.team)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при создании')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className={`${styles.banner} ${styles.bannerError}`} style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Основное</p>

        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Имя <span className={styles.required}>*</span>
          </label>
          <input id="name" name="name" className={styles.input} required autoFocus aria-required="true" />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Фото</span>
          <TeamPhotoField defaultValue="" />
        </div>

        <div className={styles.field}>
          <label htmlFor="education" className={styles.label}>Образование</label>
          <textarea
            id="education"
            name="education"
            className={styles.textarea}
            required
            maxLength={75}
            rows={2}
          />
          <span className={styles.fieldHint}>До 75 символов</span>
        </div>

        <div className={styles.field}>
          <label htmlFor="achievements" className={styles.label}>Достижения</label>
          <textarea
            id="achievements"
            name="achievements"
            className={styles.textarea}
            required
            maxLength={190}
            rows={3}
          />
          <span className={styles.fieldHint}>До 190 символов</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Профиль</span>
          <ProfileLinkField defaultValue="" />
        </div>

        <div className={styles.field}>
          <label htmlFor="sortOrder" className={styles.label}>Порядок сортировки</label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            className={styles.input}
            defaultValue={0}
            required
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Создание…' : 'Создать'}
        </Button>
      </div>
    </form>
  )
}
