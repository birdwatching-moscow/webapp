'use client'

import { ImagePlaceholder } from '@/components/ui/image-placeholder/ImagePlaceholder'
import styles from './ExpeditionCard.module.css'

export type ExpeditionCardProps = {
  imageUrl?: string
  imageAlt: string
  dateRange: string
  title: string
  summary: string
  narrow?: boolean
  onPreview?: () => void
  className?: string
}

export const ExpeditionCard = ({
  imageUrl,
  imageAlt,
  dateRange,
  title,
  summary,
  narrow,
  onPreview,
  className,
}: ExpeditionCardProps) => {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return (
    <article className={cls}>
      <button
        className={[styles.photoZone, narrow ? styles.narrow : ''].filter(Boolean).join(' ')}
        aria-label="Открыть превью"
        onClick={() => onPreview?.()}
        type="button"
      >
        <ImagePlaceholder ratio="4-3" src={imageUrl} alt={imageAlt} className={styles.image} />
        <span className={styles.infoIcon} aria-hidden="true">ⓘ</span>
      </button>
      <div className={styles.text}>
        <p className={`text-label ${styles.dateRange}`}>{dateRange}</p>
        <p className="text-h2">{title}</p>
        <p className={`text-body-l ${styles.summary}`}>{summary}</p>
      </div>
    </article>
  )
}
