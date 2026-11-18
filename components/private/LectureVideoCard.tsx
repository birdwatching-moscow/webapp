import { InfoIcon } from '@/components/icons/InfoIcon'
import { AspectRatioImage } from '@/components/ui/aspect-ratio-image/AspectRatioImage'
import styles from './LectureVideoCard.module.css'

const VIDEO_PLACEHOLDER_SRC = '/placeholders/image-placeholder.png'

type LectureVideoCardProps = {
  title: string
  subtitle: string
  /** Recording page; when set the whole card opens it in a new tab */
  videoUrl?: string
  /** Video cover; without it the card shows the placeholder picture */
  previewUrl?: string
  /** Revealed by the info icon on the cover, like PhotoCard; without it there is no icon */
  info?: string
  /** `sizes` for the preview — pass it when the card is wider than a grid third */
  imageSizes?: string
}

/**
 * Lecture recording: 16:9 cover, title and venue.
 * The video link sits on the title and stretches over the whole card; the info icon
 * is layered above it, so hovering or tapping the icon never opens the video.
 */
export const LectureVideoCard = ({ title, subtitle, videoUrl, previewUrl, info, imageSizes }: LectureVideoCardProps) => (
  <article className={styles.card}>
    <div className={styles.media}>
      <AspectRatioImage
        ratio="16-9"
        src={previewUrl ?? VIDEO_PLACEHOLDER_SRC}
        // With a video the link is named by the title; the cover is decorative
        alt={videoUrl ? '' : `Видео «${title}» скоро появится`}
        sizes={imageSizes}
        className={styles.preview}
      />
      {info && (
        <details className={styles.info}>
          <summary className={styles.icon} aria-label="Информация о видео">
            <InfoIcon />
          </summary>
          <p className={styles.caption}>{info}</p>
        </details>
      )}
    </div>
    <h2 className={styles.title}>
      {videoUrl ? (
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
          {title}
        </a>
      ) : (
        title
      )}
    </h2>
    <p className={styles.subtitle}>{subtitle}</p>
  </article>
)
