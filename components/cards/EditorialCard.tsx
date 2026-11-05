import Image from 'next/image'
import { ImagePlaceholder } from '@/components/ui/image-placeholder/ImagePlaceholder'
import styles from './EditorialCard.module.css'

const LOGO_WIDTH = 247

export type EditorialCardProps = {
  imageUrl?: string
  imageAlt: string
  title: string
  subtitle: string
  /** External article URL — when set, the whole card opens it in a new tab */
  href?: string
  className?: string
}

export const EditorialCard = ({ imageUrl, imageAlt, title, subtitle, href, className }: EditorialCardProps) => {
  const cls = [styles.root, href && styles.linked, className].filter(Boolean).join(' ')

  const content = (
    <>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <Image src={imageUrl} alt={imageAlt} fill sizes={`${LOGO_WIDTH}px`} className={styles.image} />
        ) : (
          <ImagePlaceholder ratio="16-9" alt={imageAlt} />
        )}
      </div>
      <div className={styles.text}>
        <h3 className={`text-h2 ${styles.title}`}>{title}</h3>
        <p className={`text-body-l ${styles.subtitle}`}>{subtitle}</p>
      </div>
    </>
  )

  return (
    <article className={cls}>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={styles.content}>
          {content}
        </a>
      ) : (
        <div className={styles.content}>{content}</div>
      )}
    </article>
  )
}
