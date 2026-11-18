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

// The photo is always cropped to 16:9 here; CC BY 4.0 §3(a)(1)(B) asks to indicate modifications.
const MODIFIED_MARK = ', изменено'

/**
 * Photo whose info icon gives way to the author/license credit on hover or focus,
 * like PhotoCard; on touch a tap on the icon opens it and a tap on the photo closes it.
 * Unlike PhotoCard, the credit stays up while the pointer is on it, so its links are clickable.
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
        {MODIFIED_MARK}
      </p>
    </details>
  </div>
)
