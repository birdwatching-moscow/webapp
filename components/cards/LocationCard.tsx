import { AspectRatioImage } from '@/components/ui/aspect-ratio-image/AspectRatioImage'
import { PhotoCard } from '@/components/PhotoCard/PhotoCard'
import { IMAGE_SIZES } from '@/utils/imageSizes'
import styles from './LocationCard.module.css'

export type LocationCardProps = {
  imageUrl?: string
  imageAlt: string
  /** Photo credit revealed by the info icon; without it the photo has no icon */
  photoCaption?: string
  name: string
  description: string
  species: string
  className?: string
}

export const LocationCard = ({ imageUrl, imageAlt, photoCaption, name, description, species, className }: LocationCardProps) => {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return (
    <article className={cls}>
      {imageUrl && photoCaption
        ? <PhotoCard src={imageUrl} alt={imageAlt} caption={photoCaption} sizes={IMAGE_SIZES.cardThird} />
        : <AspectRatioImage ratio="16-9" src={imageUrl} alt={imageAlt} />}
      <p className="text-h2">{name}</p>
      <p className={`text-body-l ${styles.muted}`}>{description}</p>
      <p className={`text-body-l ${styles.muted}`}>Птицы: {species}</p>
    </article>
  )
}
