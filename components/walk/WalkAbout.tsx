import { TeamMemberCard } from '@/components/cards/TeamMemberCard'
import { validPhotoUrl } from '@/utils/image'
import styles from './WalkAbout.module.css'

type Guide = {
  name: string
  photoUrl?: string | null
  education?: string | null
  achievements?: string | null
  profileLinks: string[]
}

type Props = {
  description: string
  guide?: Guide | null
}

export const WalkAbout = ({ description, guide }: Props) => (
  <section className={styles.about}>
    <div className={styles.descriptionCol}>
      <h2 className={`text-h1 ${styles.heading}`}>О прогулке</h2>
      <p className={`text-body-l ${styles.description}`}>{description}</p>
    </div>

    {guide && (
      <div className={styles.guideCol}>
        <h2 className={`text-h1 ${styles.heading}`}>Сопровождение</h2>
        <TeamMemberCard
          name={guide.name}
          role={guide.education ?? ''}
          details={guide.achievements ?? ''}
          imageUrl={validPhotoUrl(guide.photoUrl ?? '') ?? '/placeholders/photo-placeholder.png'}
          imageAlt={guide.name}
          ebirdHref={guide.profileLinks[0]}
        />
      </div>
    )}
  </section>
)
