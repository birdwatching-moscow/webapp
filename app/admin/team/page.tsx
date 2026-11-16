import { prisma } from '@/lib/prisma'
import { ROUTES } from '@/utils/routes'
import { Button } from '@/components/ui/buttons/Button'
import { TeamList } from './TeamList'
import styles from './team.module.css'

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    select: { id: true, name: true, photoUrl: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Команда</h1>
        <Button as="a" href={ROUTES.admin.teamNew} size="sm">
          + Добавить участника
        </Button>
      </div>

      <TeamList initialMembers={members} />
    </div>
  )
}
