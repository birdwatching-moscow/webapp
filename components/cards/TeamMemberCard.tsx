import { AspectRatioImage } from '@/components/ui/aspect-ratio-image/AspectRatioImage'
import { getProfileLinkLabel } from '@/utils/profileLink'
import styles from './TeamMemberCard.module.css'

export type TeamMemberCardProps = {
  name: string
  role: string
  details: string
  imageUrl?: string
  imageAlt: string
  ebirdHref?: string
  layout?: 'vertical' | 'horizontal'
  className?: string
}

export const TeamMemberCard = ({ name, role, details, imageUrl, imageAlt, ebirdHref, layout = 'vertical', className }: TeamMemberCardProps) => {
  const cls = [styles.root, layout === 'horizontal' && styles.horizontal, className].filter(Boolean).join(' ')
  return (
    <article className={cls}>
      <div className={styles.photo}>
        <AspectRatioImage ratio="1-1" src={imageUrl} alt={imageAlt} />
      </div>
      <div className={styles.info}>
        <p className={`text-h2 ${styles.name}`}>{name}</p>
        <p className={styles.role}>{role}</p>
        <p className={styles.details}>{details}</p>
        {ebirdHref !== undefined && (
          <a
            href={ebirdHref}
            className={styles.profileLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {getProfileLinkLabel(ebirdHref)}
          </a>
        )}
      </div>
    </article>
  )
}
