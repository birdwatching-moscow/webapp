import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createTeamMember } from '@/app/admin/team/_actions'
import { ProfileLinkField } from '@/app/admin/team/[id]/ProfileLinkField'
import { ROUTES } from '@/utils/routes'

export default function NewTeamMemberPage() {
  async function handleCreate(formData: FormData) {
    'use server'
    const link = ((formData.get('profileLink') as string) ?? '').trim()
    const id = await createTeamMember({
      name: formData.get('name') as string,
      photoUrl: formData.get('photoUrl') as string,
      education: (formData.get('education') as string) || undefined,
      achievements: (formData.get('achievements') as string) || undefined,
      profileLinks: link ? [link] : [],
      sortOrder: parseInt(formData.get('sortOrder') as string, 10),
    })
    redirect(`/admin/team/${id}`)
  }

  return (
    <div>
      <h1>Новый участник команды</h1>
      <Link href={ROUTES.admin.team}>← Назад</Link>
      <form action={handleCreate}>
        <label>
          Имя
          <input name="name" required />
        </label>
        <label>
          Фото (URL)
          <input name="photoUrl" type="url" required />
        </label>
        <label>
          Образование
          <textarea name="education" />
        </label>
        <label>
          Достижения
          <textarea name="achievements" />
        </label>
        <label>Профиль</label>
        <ProfileLinkField defaultValue="" />
        <label>
          Порядок сортировки
          <input name="sortOrder" type="number" defaultValue={0} required />
        </label>
        <button type="submit">Создать</button>
      </form>
    </div>
  )
}
