import Image from 'next/image'
import { InfoIcon } from '@/components/icons/InfoIcon'
import styles from './PhotoCard.module.css'

const LOREM_IPSUM = 'Lorem ipsum dolor'

interface PhotoCardProps {
  src: string
  alt: string
  caption?: string
  className?: string
}

export const PhotoCard = ({ src, alt, caption, className }: PhotoCardProps) => (
  <div className={`${styles.card} ${className ?? ''}`}>
    <Image src={src} alt={alt} fill className={styles.image} />

    <span data-testid="photo-info-icon" className={styles.icon} aria-hidden="true">
      <InfoIcon />
    </span>

    <p data-testid="photo-caption" className={styles.caption}>
      {caption ?? LOREM_IPSUM}
    </p>
  </div>
)
