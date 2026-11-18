import Image from 'next/image'
import { InfoIcon } from '@/components/icons/InfoIcon'
import styles from './PhotoWithTextCredit.module.css'

type Props = {
  src: string
  alt: string
  credit: string
  sizes?: string
  priority?: boolean
}

/**
 * Photo with an info icon (bottom-right) that reveals a plain-text credit on hover/focus.
 * Use for admin-uploaded photos without a formal CC license.
 */
export const PhotoWithTextCredit = ({ src, alt, credit, sizes, priority }: Props) => (
  <div className={styles.wrapper}>
    <Image src={src} alt={alt} fill className={styles.image} sizes={sizes} priority={priority} />
    <details className={styles.credit}>
      <summary className={styles.icon} aria-label="Автор фото">
        <InfoIcon />
      </summary>
      <p className={styles.caption}>{credit}</p>
    </details>
  </div>
)
