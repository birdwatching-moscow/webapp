import { AspectRatioImage } from '@/components/ui/aspect-ratio-image/AspectRatioImage'
import styles from './LectureVideoCard.module.css'

type LectureVideoCardProps = {
  title: string
  subtitle: string
}

/** Lecture recording: 16:9 video slot (placeholder for now), title and venue. */
export const LectureVideoCard = ({ title, subtitle }: LectureVideoCardProps) => (
  <article className={styles.card}>
    {/* TODO: embed the video; keep the placeholder while it loads or when it is unavailable */}
    <AspectRatioImage ratio="16-9" alt={`Видео «${title}» скоро появится`} />
    <h2 className={styles.title}>{title}</h2>
    <p className={styles.subtitle}>{subtitle}</p>
  </article>
)
