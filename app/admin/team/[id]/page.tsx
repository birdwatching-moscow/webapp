import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { updateTeamMember } from '@/app/admin/team/_actions'
import { Button } from '@/components/ui/buttons/Button'
import { ROUTES } from '@/utils/routes'
import { DeleteMemberButton } from './DeleteMemberButton'
import { ProfileLinkField } from './ProfileLinkField'
import styles from './member-edit.module.css'

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const memberId = parseInt(id, 10)
  const member = await prisma.teamMember.findFirst({ where: { id: memberId } })
  if (!member) notFound()
  const { sortOrder } = member

  async function handleUpdate(formData: FormData) {
    'use server'
    const link = (formData.get('profileLink') as string).trim()
    await updateTeamMember(memberId, {
      name:         formData.get('name') as string,
      photoUrl:     formData.get('photoUrl') as string,
      education:    (formData.get('education') as string) || undefined,
      achievements: (formData.get('achievements') as string) || undefined,
      profileLinks: link ? [link] : [],
      sortOrder,
    })
    redirect(`/admin/team/${memberId}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href={ROUTES.admin.team} className={styles.backBtn}>← Назад</Link>
        <h1 className={styles.pageTitle}>{member.name}</h1>
      </div>

      <form action={handleUpdate}>
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Основное</p>

          <div className={styles.fieldRow + ' ' + styles.fieldRow2}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                Имя <span className={styles.required}>*</span>
              </label>
              <input
                id="name"
                name="name"
                className={styles.input}
                defaultValue={member.name}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="photoUrl" className={styles.label}>
                Фото (URL) <span className={styles.required}>*</span>
              </label>
              <input
                id="photoUrl"
                name="photoUrl"
                type="url"
                className={styles.input}
                defaultValue={member.photoUrl}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="education" className={styles.label}>Образование</label>
            <textarea
              id="education"
              name="education"
              className={styles.textarea}
              defaultValue={member.education ?? ''}
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
              defaultValue={member.achievements ?? ''}
              maxLength={190}
              rows={3}
            />
            <span className={styles.fieldHint}>До 190 символов</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Профиль</span>
            <ProfileLinkField defaultValue={member.profileLinks[0] ?? ''} />
          </div>
        </div>

        <div className={styles.formActions}>
          <Button type="submit" size="sm">Сохранить</Button>
        </div>
      </form>

      <div className={styles.dangerZone}>
        <p className={styles.dangerZoneTitle}>Опасная зона</p>
        <DeleteMemberButton memberId={memberId} memberName={member.name} />
      </div>
    </div>
  )
}
