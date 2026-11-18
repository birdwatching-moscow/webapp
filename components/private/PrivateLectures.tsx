import { LectureVideoCard } from '@/components/private/LectureVideoCard'
import type { PrivateLecture } from '@/lib/private/lectures'
import styles from './PrivateLectures.module.css'

// .featured is capped at --size-text-max (720px) on desktop
const FEATURED_IMAGE_SIZES = '(min-width: 1248px) 720px, calc(100vw - 32px)'

type PrivateLecturesProps = {
  lectures: readonly PrivateLecture[]
}

/** One column on mobile, 3-column grid on desktop; a featured lecture gets a wider row. */
export const PrivateLectures = ({ lectures }: PrivateLecturesProps) => (
  <section className={styles.section} aria-label="Записи лекций">
    <ul className={styles.list}>
      {lectures.map((lecture, index) => (
        // Titles repeat in the design content, so the index is part of the key
        <li key={`${index}-${lecture.title}`} className={lecture.featured ? styles.featured : undefined}>
          <LectureVideoCard
            title={lecture.title}
            subtitle={lecture.subtitle}
            videoUrl={lecture.videoUrl}
            imageSizes={lecture.featured ? FEATURED_IMAGE_SIZES : undefined}
          />
        </li>
      ))}
    </ul>
  </section>
)
