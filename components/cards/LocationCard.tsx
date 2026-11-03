import { ImagePlaceholder } from '@/components/ui/image-placeholder/ImagePlaceholder'
import styles from './LocationCard.module.css'

export type LocationCardProps = {
  imageUrl?: string
  imageAlt: string
  name: string
  description: string
  species: string
  className?: string
}

export const LocationCard = ({ imageUrl, imageAlt, name, description, species, className }: LocationCardProps) => {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return (
    <article className={cls}>
      <ImagePlaceholder ratio="16-9" src={imageUrl} alt={imageAlt} />
      <p className="text-h2">{name}</p>
      <p className={`text-body-l ${styles.muted}`}>{description}</p>
      <p className={`text-body-l ${styles.muted}`}>Птицы: {species}</p>
    </article>
  )
}
