import Image from 'next/image'
import { InfoIcon } from '@/components/icons/InfoIcon'
import { IMAGE_SIZES } from '@/utils/imageSizes'
import type { PhotoCredit } from '@/types/photoCredit'
import styles from './PhotoWithCredit.module.css'

type PhotoWithCreditProps = {
  src: string
  alt: string
  credit: PhotoCredit
  /** `sizes` for next/image */
  sizes?: string
}

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const

/**
 * Photo whose info icon toggles the author/license credit on click.
 * Unlike PhotoCard's hover caption, the links stay reachable (and work on touch).
 */
export const PhotoWithCredit = ({ src, alt, credit, sizes = IMAGE_SIZES.cardThird }: PhotoWithCreditProps) => (
  <div className={styles.card}>
    <Image src={src} alt={alt} fill sizes={sizes} className={styles.image} />

    <details className={styles.credit}>
      <summary data-testid="photo-info-icon" className={styles.icon} aria-label="Автор и лицензия фото">
        <InfoIcon />
      </summary>
      <p data-testid="photo-caption" className={styles.caption}>
        <a href={credit.sourceUrl} {...EXTERNAL} className={styles.link}>{credit.author}</a>
        {', '}
        <a href={credit.licenseUrl} {...EXTERNAL} className={styles.link}>{credit.license}</a>
      </p>
    </details>
  </div>
)
