import { TeamMemberCard } from '@/components/cards/TeamMemberCard'
import { validPhotoUrl } from '@/utils/image'
import type { ExpeditionGuideRow } from '@/lib/expeditions'
import styles from './ExpeditionGuides.module.css'

type Props = {
  guides: ExpeditionGuideRow[]
}

export const ExpeditionGuides = ({ guides }: Props) => {
  const isCentered = guides.length < 3

  return (
    <section className={styles.section}>
      <h2 className={`text-h1 ${styles.title}`}>Сопровождение</h2>
      <ul className={`${styles.list} ${isCentered ? styles.listCentered : ''}`}>
        {guides.map(guide => (
          <li key={guide.name} className={styles.item}>
            <TeamMemberCard
              name={guide.name}
              role={guide.education ?? ''}
              details={guide.achievements ?? ''}
              imageUrl={validPhotoUrl(guide.photoUrl) ?? '/placeholders/photo-placeholder.png'}
              imageAlt={guide.name}
              ebirdHref={guide.profileLinks[0]}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
