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
  /** Pass true when this image is the LCP element (above the fold). */
  priority?: boolean
}

export const PhotoCard = ({ src, alt, caption, className, sizes = DEFAULT_SIZES, priority }: PhotoCardProps) => (
  <div className={`${styles.card} ${className ?? ''}`}>
    <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={styles.image} />

    <details className={styles.credit}>
      <summary data-testid="photo-info-icon" className={styles.icon} aria-label="Автор фото">
        <InfoIcon />
      </summary>
      <p data-testid="photo-caption" className={styles.caption}>
        {caption ?? LOREM_IPSUM}
      </p>
    </details>
  </div>
)
