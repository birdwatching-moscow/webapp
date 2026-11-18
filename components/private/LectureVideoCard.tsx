import { AspectRatioImage } from '@/components/ui/aspect-ratio-image/AspectRatioImage'
import styles from './LectureVideoCard.module.css'

const VIDEO_PLACEHOLDER_SRC = '/placeholders/image-placeholder.png'

type LectureVideoCardProps = {
  title: string
  subtitle: string
  /** `sizes` for the preview — pass it when the card is wider than a grid third */
  imageSizes?: string
}

/** Lecture recording: 16:9 video slot (placeholder for now), title and venue. */
export const LectureVideoCard = ({ title, subtitle, imageSizes }: LectureVideoCardProps) => (
  <article className={styles.card}>
    {/* TODO: embed the video; keep the placeholder while it loads or when it is unavailable */}
    <AspectRatioImage
      ratio="16-9"
      src={VIDEO_PLACEHOLDER_SRC}
      alt={`Видео «${title}» скоро появится`}
      sizes={imageSizes}
      className={styles.preview}
    />
    <h2 className={styles.title}>{title}</h2>
    <p className={styles.subtitle}>{subtitle}</p>
  </article>
)
