import { ROUTES } from '@/utils/routes'
import { TeamMemberNewForm } from './TeamMemberNewForm'
import styles from '@/app/admin/team/[id]/member-edit.module.css'
import Link from 'next/link'

export default function NewTeamMemberPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href={ROUTES.admin.team} className={styles.backBtn}>← Команда</Link>
        <h1 className={styles.pageTitle}>Новый участник</h1>
      </div>
      <TeamMemberNewForm />
    </div>
  )
}
