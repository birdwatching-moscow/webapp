import Image from 'next/image'
import { InfoIcon } from '@/components/icons/InfoIcon'
import { IMAGE_SIZES } from '@/utils/imageSizes'
import styles from './PhotoCard.module.css'

const LOREM_IPSUM = 'Lorem ipsum dolor'
// Default: the card fills a section inside the page gutters.
const DEFAULT_SIZES = IMAGE_SIZES.pageWidth

interface PhotoCardProps {
  src: string
  alt: string
  caption?: string
  className?: string
  /** `sizes` for next/image — pass a narrower value when the card is not full width. */
  sizes?: string
}

export const PhotoCard = ({ src, alt, caption, className, sizes = DEFAULT_SIZES }: PhotoCardProps) => (
  <div className={`${styles.card} ${className ?? ''}`}>
    <Image src={src} alt={alt} fill sizes={sizes} className={styles.image} />

    <span data-testid="photo-info-icon" className={styles.icon} aria-hidden="true">
      <InfoIcon />
    </span>

    <p data-testid="photo-caption" className={styles.caption}>
      {caption ?? LOREM_IPSUM}
    </p>
  </div>
)
