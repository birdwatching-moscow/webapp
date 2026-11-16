import { getTeamMembers } from '@/lib/team'
import { TeamCard } from '@/components/cards/TeamCard'
import { VoronyeGnezdoBanner } from '@/components/VoronyeGnezdoBanner/VoronyeGnezdoBanner'
import { validPhotoUrl } from '@/utils/image'
import styles from './Team.module.css'

const HERO_DESC =
  'Мы знакомим людей с птицами, организуем бердвотчерские прогулки в Москве и поездки по всему миру, обучаем специалистов и школьников, читаем лекции и делаем подкаст «Витю видел?». Наша миссия — помогать природе через образование людей. К нам приходят, чтобы узнать больше о птицах, научиться их различать, найти новое увлечение или просто провести время на природе в хорошей компании.'

export const Team = async () => {
  const members = await getTeamMembers()

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>О проекте</h1>
          <p className={styles.heroDesc}>{HERO_DESC}</p>
        </div>
      </section>

      <section className={styles.teamSection}>
        <h2 className={styles.teamTitle}>Наша команда</h2>
        <div className={styles.teamGrid}>
          {members.map((member) => (
            <TeamCard
              key={member.id}
              name={member.name}
              role={member.education ?? ''}
              details={member.achievements ?? ''}
              imageUrl={validPhotoUrl(member.photoUrl)}
              imageAlt={member.name}
              ebirdHref={member.profileLinks[0]}
              className={styles.teamCard}
            />
          ))}
        </div>
      </section>

      <section className={styles.noticeSection}>
        <VoronyeGnezdoBanner />
      </section>
    </main>
  )
}
