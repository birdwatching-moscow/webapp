import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ROUTES } from '@/utils/routes'
import { DeleteMemberButton } from './DeleteMemberButton'
import { TeamMemberEditForm } from './TeamMemberEditForm'
import styles from './member-edit.module.css'

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const memberId = parseInt(id, 10)
  const member = await prisma.teamMember.findFirst({ where: { id: memberId } })
  if (!member) notFound()

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href={ROUTES.admin.team} className={styles.backBtn}>← Назад</Link>
        <h1 className={styles.pageTitle}>{member.name}</h1>
      </div>

      <TeamMemberEditForm
        memberId={memberId}
        sortOrder={member.sortOrder}
        defaultName={member.name}
        defaultPhotoUrl={member.photoUrl}
        defaultEducation={member.education ?? ''}
        defaultAchievements={member.achievements ?? ''}
        defaultProfileLink={member.profileLinks[0] ?? ''}
      />

      <div className={styles.dangerZone}>
        <p className={styles.dangerZoneTitle}>Опасная зона</p>
        <DeleteMemberButton memberId={memberId} memberName={member.name} />
      </div>
    </div>
  )
}
