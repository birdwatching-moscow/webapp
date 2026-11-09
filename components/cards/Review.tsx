import { ImagePlaceholder } from '@/components/ui/image-placeholder/ImagePlaceholder'
import styles from './Review.module.css'

export type ReviewProps = {
  authorImageUrl?: string
  authorName: string
  body: string
  href?: string
  className?: string
}

const DEFAULT_AUTHOR_IMAGE = '/placeholders/review-image.png'

export const Review = ({ authorImageUrl = DEFAULT_AUTHOR_IMAGE, authorName, body, href, className }: ReviewProps) => {
  const cls = [styles.root, href && styles.linked, className].filter(Boolean).join(' ')

  const content = (
    <>
      <div className={styles.header}>
        <div className={styles.photoWrapper}>
          <ImagePlaceholder ratio="1-1" src={authorImageUrl} alt={authorName} />
        </div>
        <p className="text-h2">{authorName}</p>
      </div>
      <p className={`text-body-l ${styles.body}`}>{body}</p>
    </>
  )

  return (
    <article className={cls}>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={styles.inner}>
          {content}
        </a>
      ) : (
        <div className={styles.inner}>{content}</div>
      )}
    </article>
  )
}
