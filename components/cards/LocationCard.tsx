import { AspectRatioImage } from '@/components/ui/aspect-ratio-image/AspectRatioImage'
import { PhotoWithCredit } from '@/components/PhotoWithCredit/PhotoWithCredit'
import type { PhotoCredit } from '@/types/photoCredit'
import styles from './LocationCard.module.css'

export type LocationCardProps = {
  imageUrl?: string
  imageAlt: string
  /** Author/license revealed by clicking the info icon; without it the photo has no icon */
  photoCredit?: PhotoCredit
  name: string
  description: string
  species: string
  className?: string
}

export const LocationCard = ({ imageUrl, imageAlt, photoCredit, name, description, species, className }: LocationCardProps) => {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return (
    <article className={cls}>
      {imageUrl && photoCredit
        ? <PhotoWithCredit src={imageUrl} alt={imageAlt} credit={photoCredit} />
        : <AspectRatioImage ratio="16-9" src={imageUrl} alt={imageAlt} />}
      <p className="text-h2">{name}</p>
      <p className={`text-body-l ${styles.muted}`}>{description}</p>
      <p className={`text-body-l ${styles.muted}`}>Птицы: {species}</p>
    </article>
  )
}
