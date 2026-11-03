import { ImagePlaceholder } from '@/components/ui/image-placeholder/ImagePlaceholder'
import styles from './EditorialCard.module.css'

export type EditorialCardProps = {
  imageUrl?: string
  imageAlt: string
  title: string
  subtitle: string
  className?: string
}

export const EditorialCard = ({ imageUrl, imageAlt, title, subtitle, className }: EditorialCardProps) => {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return (
    <article className={cls}>
      <div className={styles.imageContainer}>
        <ImagePlaceholder ratio="16-9" src={imageUrl} alt={imageAlt} />
      </div>
      <div className={styles.text}>
        <p className={`text-h1 ${styles.title}`}>{title}</p>
        <p className={`text-body-l ${styles.subtitle}`}>{subtitle}</p>
      </div>
    </article>
  )
}
