import { ImagePlaceholder } from '@/components/ui/image-placeholder/ImagePlaceholder'
import { Button } from '@/components/ui/buttons/Button'
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
        <p className="text-h2">{name}</p>
        <p className={`text-body ${styles.role}`}>{role}</p>
        <p className={`text-body-l ${styles.details}`}>{details}</p>
        {ebirdHref !== undefined && (
          <Button as="a" href={ebirdHref} variant="ghost" size="sm">eBird</Button>
        )}
      </div>
    </article>
  )
}
