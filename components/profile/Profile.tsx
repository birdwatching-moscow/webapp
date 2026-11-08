import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPastWalksForUser } from '@/lib/walks'
import { NoticeBanner } from '@/components/NoticeBanner/NoticeBanner'
import { EditableName } from './EditableName'
import { PastWalksGrid } from './PastWalksGrid'
import styles from './profile.module.css'

export const Profile = async () => {
  const session = await auth()
  const email = session?.user?.email ?? ''
  const userId = session?.user?.id ?? ''

  const [user, pastWalks] = await Promise.all([
    userId
      ? prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
      : null,
    userId ? getPastWalksForUser(userId) : [],
  ])
  const name = user?.name ?? ''

  return (
    <main className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>Личный кабинет</h1>
        </div>

        <div className={styles.content}>

          <section className={styles.profileCard}>
            <h2 className={styles.sectionTitle}>Профиль</h2>
            <EditableName initialName={name} />
            <span className={styles.fieldLabel}>Эл. почта</span>
            <span className={styles.fieldValue}>{email}</span>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Предстоящие</h2>
            <p className={styles.emptyText}>Вы ещё не купили билет на прогулку</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Прошедшие</h2>
            {pastWalks.length > 0
              ? <PastWalksGrid walks={pastWalks} />
              : <p className={styles.emptyText}>Здесь появятся прошедшие прогулки</p>
            }
          </section>

        </div>

        <div className={styles.bannerSection}>
          <NoticeBanner
            text="По вопросам связанной с оплатой и билетам обращайтесь в поддержку"
            buttons={[{ label: 'Написать', href: 'mailto:birdwatching@mail.ru' }]}
            className={styles.noticeBanner}
          />
        </div>

      </div>
    </main>
  )
}
