import { AspectRatioImage } from '@/components/ui/aspect-ratio-image/AspectRatioImage'
import styles from './LectureVideoCard.module.css'

const VIDEO_PLACEHOLDER_SRC = '/placeholders/image-placeholder.png'

type LectureVideoCardProps = {
  title: string
  subtitle: string
  /** Recording page; when set the whole card opens it in a new tab */
  videoUrl?: string
  /** `sizes` for the preview — pass it when the card is wider than a grid third */
  imageSizes?: string
}

/** Lecture recording: 16:9 preview, title and venue. */
export const LectureVideoCard = ({ title, subtitle, videoUrl, imageSizes }: LectureVideoCardProps) => {
  const content = (
    <>
      <AspectRatioImage
        ratio="16-9"
        src={VIDEO_PLACEHOLDER_SRC}
        // With a video the link is named by the title; the preview is decorative
        alt={videoUrl ? '' : `Видео «${title}» скоро появится`}
        sizes={imageSizes}
        className={styles.preview}
      />
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>
    </>
  )

  return (
    <article>
      {videoUrl ? (
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className={styles.card}>
          {content}
        </a>
      ) : (
        <div className={styles.card}>{content}</div>
      )}
    </article>
  )
}
