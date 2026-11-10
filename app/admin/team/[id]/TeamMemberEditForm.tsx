'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { saveTeamMemberForm } from '@/app/admin/team/_actions'
import { ProfileLinkField } from './ProfileLinkField'
import { TeamPhotoField } from './TeamPhotoField'
import styles from './member-edit.module.css'

interface Props {
  memberId: number
  sortOrder: number
  defaultName: string
  defaultPhotoUrl: string
  defaultEducation: string
  defaultAchievements: string
  defaultProfileLink: string
}

export function TeamMemberEditForm({
  memberId, sortOrder,
  defaultName, defaultPhotoUrl, defaultEducation, defaultAchievements, defaultProfileLink,
}: Props) {
  const [state, action, pending] = useActionState(saveTeamMemberForm, null)

  return (
    <form action={action}>
      <input type="hidden" name="memberId" value={memberId} />
      <input type="hidden" name="sortOrder" value={sortOrder} />

      {state?.success === true && (
        <div className={`${styles.banner} ${styles.bannerSuccess}`} style={{ marginBottom: 'var(--space-4)' }}>
          Изменения сохранены
        </div>
      )}
      {state?.success === false && (
        <div className={`${styles.banner} ${styles.bannerError}`} style={{ marginBottom: 'var(--space-4)' }}>
          Не удалось сохранить: {state.error}
        </div>
      )}

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Основное</p>

        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Имя <span className={styles.required}>*</span>
          </label>
          <input
            id="name"
            name="name"
            className={styles.input}
            defaultValue={defaultName}
            required
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Фото</span>
          <TeamPhotoField defaultValue={defaultPhotoUrl} />
        </div>

        <div className={styles.field}>
          <label htmlFor="education" className={styles.label}>Образование</label>
          <textarea
            id="education"
            name="education"
            className={styles.textarea}
            defaultValue={defaultEducation}
            placeholder="организатор бёрдвотчинг-туров"
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
            defaultValue={defaultAchievements}
            maxLength={190}
            rows={3}
          />
          <span className={styles.fieldHint}>До 190 символов</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Профиль</span>
          <ProfileLinkField defaultValue={defaultProfileLink} />
        </div>
      </div>

      <div className={styles.formActions}>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </div>
    </form>
  )
}
