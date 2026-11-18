import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ROUTES } from '@/utils/routes'
import { TeamMemberNewForm } from './TeamMemberNewForm'
import styles from '@/app/admin/team/[id]/member-edit.module.css'

export default async function NewTeamMemberPage() {
  const last = await prisma.teamMember.findFirst({
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })
  const nextSortOrder = (last?.sortOrder ?? -1) + 1

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href={ROUTES.admin.team} className={styles.backBtn}>← Команда</Link>
        <h1 className={styles.pageTitle}>Новый участник</h1>
      </div>
      <TeamMemberNewForm nextSortOrder={nextSortOrder} />
    </div>
  )
}
