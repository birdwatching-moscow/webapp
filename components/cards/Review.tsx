import { ImagePlaceholder } from '@/components/ui/image-placeholder/ImagePlaceholder'
import styles from './Review.module.css'

export type ReviewProps = {
  authorImageUrl?: string
  authorName: string
  body: string
  className?: string
}

export const Review = ({ authorImageUrl, authorName, body, className }: ReviewProps) => {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return (
    <article className={cls}>
      <div className={styles.header}>
        <div className={styles.photoWrapper}>
          <ImagePlaceholder ratio="1-1" src={authorImageUrl} alt={authorName} />
        </div>
        <p className="text-h2">{authorName}</p>
      </div>
      <p className={`text-body-l ${styles.body}`}>{body}</p>
    </article>
  )
}
