import { ImagePlaceholder } from '@/components/ui/image-placeholder/ImagePlaceholder'
import { getProfileLinkLabel } from '@/utils/profileLink'
import styles from './TeamCard.module.css'

export type TeamCardProps = {
  name: string
  role: string
  details: string
  imageUrl?: string
  imageAlt: string
  ebirdHref?: string
  className?: string
}

export const TeamCard = ({ name, role, details, imageUrl, imageAlt, ebirdHref, className }: TeamCardProps) => {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return (
    <article className={cls}>
      <div className={styles.photo}>
        <ImagePlaceholder ratio="1-1" src={imageUrl} alt={imageAlt} />
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
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
